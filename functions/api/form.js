// Formularele site-ului (contact, rezervare, tur personalizat): se salvează în KV (FORMS) și se trimit pe e-mail prin Web3Forms.
export async function onRequestPost({ request, env }) {
  let fd; try { fd = await request.formData(); } catch { return new Response('Bad request', { status: 400 }); }
  if (fd.get('bot-field')) return new Response('ok');
  const data = {}; for (const [k, v] of fd.entries()) if (k !== 'bot-field' && typeof v === 'string') data[k] = v.slice(0, 3000);
  const form = (data['form-name'] || 'formular').replace(/[^\w-]/g, '');
  const entry = { form, data, created: new Date().toISOString() };
  if (env.FORMS) await env.FORMS.put('forms/' + entry.created + '-' + crypto.randomUUID().slice(0, 8), JSON.stringify(entry)).catch(() => {});
  let sent = !env.WEB3FORMS_KEY;
  if (env.WEB3FORMS_KEY) {
    const subj = { contact: 'Mesaj nou de pe beetravel.md', 'rezerva-tur': 'Cerere de rezervare de pe beetravel.md', 'tur-personalizat': 'Cerere tur personalizat de pe beetravel.md' }[form] || 'Formular nou de pe beetravel.md';
    const r = await fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ access_key: env.WEB3FORMS_KEY, subject: subj, from_name: 'BEE TRAVEL site', ...data }) }).catch(() => null);
    sent = !!(r && r.ok);
  }
  return new Response(sent || env.FORMS ? 'ok' : 'error', { status: sent || env.FORMS ? 200 : 502 });
}
