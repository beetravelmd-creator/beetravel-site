// Recenzii BEE TRAVEL: listă publică, trimitere, administrare. Datele stau în Netlify Blobs, store „bee-reviews-v1”.
import { getStore } from '@netlify/blobs';
import { createHmac, createHash, randomUUID, timingSafeEqual } from 'node:crypto';

const STORE = 'bee-reviews-v1';
const COOKIE = 'bee_reviews_admin';
const json = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers } });
const err = (msg, status = 400) => json({ error: msg }, status);
const pw = () => process.env.BEE_REVIEWS_ADMIN_PASSWORD || '';
const sign = (exp) => createHmac('sha256', 'bee-reviews:' + pw()).update(String(exp)).digest('hex');
function isAdmin(req) {
  const c = (req.headers.get('cookie') || '').split(/;\s*/).find((x) => x.startsWith(COOKIE + '='));
  if (!c || !pw()) return false;
  const [exp, sig] = decodeURIComponent(c.slice(COOKIE.length + 1)).split('.');
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  const good = sign(exp);
  return sig.length === good.length && timingSafeEqual(Buffer.from(sig), Buffer.from(good));
}
const clean = (s, max) => String(s ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max);
const norm = (r, key) => ({ id: r.id || key.replace(/^reviews\//, ''), name: r.name || '', email: r.email || '', tour: r.tour || '', rating: Math.max(1, Math.min(5, Number(r.rating) || 5)), text: r.text || '', created: r.created || r.createdAt || new Date(0).toISOString(), status: r.status || 'pending' });

async function all(store) {
  const { blobs } = await store.list({ prefix: 'reviews/' });
  const out = [];
  for (const b of blobs) { const r = await store.get(b.key, { type: 'json' }).catch(() => null); if (r) out.push(norm(r, b.key)); }
  return out.sort((a, b) => (a.created < b.created ? 1 : -1));
}

export default async (req) => {
  const url = new URL(req.url);
  const action = url.searchParams.get('action') || 'public';
  const store = getStore({ name: STORE, consistency: 'strong' });

  if (req.method === 'GET') {
    if (action === 'public') {
      const items = (await all(store)).filter((r) => r.status === 'approved').map(({ email, status, ...pub }) => pub);
      return json(items);
    }
    if (action === 'admin') {
      if (!isAdmin(req)) return err('Autentificarea este necesară.', 401);
      return json(await all(store));
    }
    return err('Acțiune necunoscută.', 404);
  }
  if (req.method !== 'POST') return err('Metodă nepermisă.', 405);
  let body = {};
  try { body = await req.json(); } catch { return err('Date invalide.'); }

  if (action === 'login') {
    const given = String(body.password || '');
    const a = createHash('sha256').update(given).digest(), b = createHash('sha256').update(pw()).digest();
    if (!pw() || !timingSafeEqual(a, b)) return err('Parola nu este corectă.', 401);
    const exp = Date.now() + 8 * 3600 * 1000;
    return json({ ok: true }, 200, { 'Set-Cookie': `${COOKIE}=${encodeURIComponent(exp + '.' + sign(exp))}; Path=/.netlify/functions/bee-reviews; HttpOnly; Secure; SameSite=Strict; Max-Age=28800` });
  }
  if (action === 'logout') return json({ ok: true }, 200, { 'Set-Cookie': `${COOKIE}=; Path=/.netlify/functions/bee-reviews; HttpOnly; Secure; SameSite=Strict; Max-Age=0` });

  if (action === 'moderate') {
    if (!isAdmin(req)) return err('Autentificarea este necesară.', 401);
    const id = clean(body.id, 100), status = body.status;
    if (!id || !/^[\w-]+$/.test(id)) return err('Recenzie inexistentă.', 404);
    const key = 'reviews/' + id;
    const cur = await store.get(key, { type: 'json' });
    if (!cur) return err('Recenzie inexistentă.', 404);
    if (status === 'deleted') { await store.delete(key); return json({ ok: true }); }
    if (!['approved', 'hidden', 'pending'].includes(status)) return err('Stare invalidă.');
    await store.setJSON(key, { ...cur, status, moderated: new Date().toISOString() });
    return json({ ok: true });
  }

  if (action === 'submit') {
    if (clean(body.website, 200)) return json({ ok: true }); // capcană pentru roboți
    const name = clean(body.name, 80), email = clean(body.email, 254), tour = clean(body.tour, 160), text = clean(body.text, 3000), rating = Number(body.rating);
    if (name.length < 2) return err('Numele este prea scurt.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return err('Adresa de e-mail nu este validă.');
    if (!(rating >= 1 && rating <= 5)) return err('Alege o notă de la 1 la 5.');
    if (text.length < 10) return err('Recenzia este prea scurtă.');
    if (body.consent !== true) return err('Este necesar acordul pentru publicare.');
    const ip = req.headers.get('x-nf-client-connection-ip') || req.headers.get('x-forwarded-for') || 'x';
    const lk = 'limits/' + createHash('sha256').update('bee:' + ip).digest('hex');
    const lim = (await store.get(lk, { type: 'json' }).catch(() => null)) || {};
    const now = Date.now();
    const recent = (Array.isArray(lim.times) ? lim.times : []).filter((t) => now - t < 3600 * 1000);
    if (recent.length >= 3) return err('Ai trimis deja mai multe recenzii. Încearcă din nou mai târziu.', 429);
    await store.setJSON(lk, { times: [...recent, now] });
    const id = randomUUID();
    const review = { id, name, email, tour, rating: Math.round(rating), text, created: new Date().toISOString(), status: 'pending', consent: true };
    await store.setJSON('reviews/' + id, review);
    const notify = process.env.BEE_REVIEWS_NOTIFY_URL;
    if (notify) {
      const f = new URLSearchParams({ 'form-name': 'recenzii-notificari', 'bot-field': '', review_id: id, nume: name, email, nota: String(review.rating), tur: tour, mesaj: text });
      await fetch(notify, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: f.toString() }).catch(() => {});
    }
    return json({ ok: true });
  }
  return err('Acțiune necunoscută.', 404);
};

export const config = { rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ['ip', 'domain'] } };
