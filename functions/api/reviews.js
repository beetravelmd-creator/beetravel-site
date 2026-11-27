// Recenzii BEE TRAVEL pe Cloudflare Pages: listă publică, trimitere, administrare. Datele stau în KV (legătura „REVIEWS”).
const COOKIE = 'bee_reviews_admin';
const enc = new TextEncoder();
const json = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers } });
const err = (msg, status = 400) => json({ error: msg }, status);
const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
async function hmac(key, msg) { const k = await crypto.subtle.importKey('raw', enc.encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']); return hex(await crypto.subtle.sign('HMAC', k, enc.encode(msg))); }
const sha = async (s) => hex(await crypto.subtle.digest('SHA-256', enc.encode(s)));
function same(a, b) { if (a.length !== b.length) return false; let r = 0; for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i); return r === 0; }
async function isAdmin(req, pw) {
  const c = (req.headers.get('cookie') || '').split(/;\s*/).find((x) => x.startsWith(COOKIE + '='));
  if (!c || !pw) return false;
  const [exp, sig] = decodeURIComponent(c.slice(COOKIE.length + 1)).split('.');
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  return same(sig, await hmac('bee-reviews:' + pw, exp));
}
const clean = (s, max) => String(s ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max);
const norm = (r, key) => ({ id: r.id || key.replace(/^reviews\//, ''), name: r.name || '', email: r.email || '', tour: r.tour || '', rating: Math.max(1, Math.min(5, Number(r.rating) || 5)), text: r.text || '', created: r.created || r.createdAt || new Date(0).toISOString(), status: r.status || 'pending' });
async function all(kv) {
  const out = []; let cursor;
  do { const l = await kv.list({ prefix: 'reviews/', cursor }); for (const k of l.keys) { const r = await kv.get(k.name, 'json'); if (r) out.push(norm(r, k.name)); } cursor = l.list_complete ? null : l.cursor; } while (cursor);
  return out.sort((a, b) => (a.created < b.created ? 1 : -1));
}
// La prima pornire, recenziile publicate se copiază automat de pe site-ul vechi (Netlify).
async function seed(kv) {
  if (await kv.get('meta/seeded')) return;
  try {
    const old = await fetch('https://tourmaline-pithivier-683b41.netlify.app/.netlify/functions/bee-reviews?action=public').then((r) => (r.ok ? r.json() : null));
    if (Array.isArray(old)) for (const r of old) if (r && r.id) await kv.put('reviews/' + r.id, JSON.stringify({ ...r, status: 'approved', imported: true }));
    if (Array.isArray(old)) await kv.put('meta/seeded', new Date().toISOString());
  } catch (e) {}
}
export async function onRequest({ request: req, env }) {
  const kv = env.REVIEWS; if (!kv) return err('Stocarea recenziilor nu este configurată.', 500);
  await seed(kv);
  const pw = env.BEE_REVIEWS_ADMIN_PASSWORD || '';
  const url = new URL(req.url); const action = url.searchParams.get('action') || 'public';
  if (req.method === 'GET') {
    if (action === 'public') return json((await all(kv)).filter((r) => r.status === 'approved').map(({ email, status, ...pub }) => pub));
    if (action === 'admin') { if (!(await isAdmin(req, pw))) return err('Autentificarea este necesară.', 401); return json(await all(kv)); }
    return err('Acțiune necunoscută.', 404);
  }
  if (req.method !== 'POST') return err('Metodă nepermisă.', 405);
  let body = {}; try { body = await req.json(); } catch { return err('Date invalide.'); }
  if (action === 'login') {
    if (!pw || !same(await sha(String(body.password || '')), await sha(pw))) return err('Parola nu este corectă.', 401);
    const exp = Date.now() + 8 * 3600 * 1000;
    return json({ ok: true }, 200, { 'Set-Cookie': `${COOKIE}=${encodeURIComponent(exp + '.' + (await hmac('bee-reviews:' + pw, String(exp))))}; Path=/api/reviews; HttpOnly; Secure; SameSite=Strict; Max-Age=28800` });
  }
  if (action === 'logout') return json({ ok: true }, 200, { 'Set-Cookie': `${COOKIE}=; Path=/api/reviews; HttpOnly; Secure; SameSite=Strict; Max-Age=0` });
  if (action === 'moderate') {
    if (!(await isAdmin(req, pw))) return err('Autentificarea este necesară.', 401);
    const id = clean(body.id, 100), status = body.status;
    if (!id || !/^[\w-]+$/.test(id)) return err('Recenzie inexistentă.', 404);
    const key = 'reviews/' + id; const cur = await kv.get(key, 'json');
    if (!cur) return err('Recenzie inexistentă.', 404);
    if (status === 'deleted') { await kv.delete(key); return json({ ok: true }); }
    if (!['approved', 'hidden', 'pending'].includes(status)) return err('Stare invalidă.');
    await kv.put(key, JSON.stringify({ ...cur, status, moderated: new Date().toISOString() }));
    return json({ ok: true });
  }
  if (action === 'submit') {
    if (clean(body.website, 200)) return json({ ok: true });
    const name = clean(body.name, 80), email = clean(body.email, 254), tour = clean(body.tour, 160), text = clean(body.text, 3000), rating = Number(body.rating);
    if (name.length < 2) return err('Numele este prea scurt.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return err('Adresa de e-mail nu este validă.');
    if (!(rating >= 1 && rating <= 5)) return err('Alege o notă de la 1 la 5.');
    if (text.length < 10) return err('Recenzia este prea scurtă.');
    if (body.consent !== true) return err('Este necesar acordul pentru publicare.');
    const ip = req.headers.get('cf-connecting-ip') || 'x';
    const lk = 'limits/' + (await sha('bee:' + ip));
    const lim = (await kv.get(lk, 'json')) || {}; const now = Date.now();
    const recent = (Array.isArray(lim.times) ? lim.times : []).filter((t) => now - t < 3600 * 1000);
    if (recent.length >= 3) return err('Ai trimis deja mai multe recenzii. Încearcă din nou mai târziu.', 429);
    await kv.put(lk, JSON.stringify({ times: [...recent, now] }), { expirationTtl: 7200 });
    const id = crypto.randomUUID();
    const review = { id, name, email, tour, rating: Math.round(rating), text, created: new Date().toISOString(), status: 'pending', consent: true };
    await kv.put('reviews/' + id, JSON.stringify(review));
    if (env.WEB3FORMS_KEY) await fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ access_key: env.WEB3FORMS_KEY, subject: 'Recenzie nouă pe beetravel.md', from_name: 'BEE TRAVEL site', nume: name, email, nota: review.rating, tur: tour, mesaj: text }) }).catch(() => {});
    return json({ ok: true });
  }
  return err('Acțiune necunoscută.', 404);
}
