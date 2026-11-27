// Întoarcerea de la GitHub: trimite tokenul înapoi către fereastra panoului Decap.
function page(status, content) {
  const msg = 'authorization:github:' + status + ':' + JSON.stringify(content);
  const html = '<!doctype html><html><body><script>(function(){var m=' + JSON.stringify(msg) +
    ';function r(e){window.opener.postMessage(m,e.origin);window.removeEventListener("message",r,false);}' +
    'window.addEventListener("message",r,false);window.opener.postMessage("authorizing:github","*");})();</script></body></html>';
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Set-Cookie': 'decap_state=; Path=/api; Max-Age=0' } });
}
export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code'), state = url.searchParams.get('state');
  const saved = ((request.headers.get('cookie') || '').match(/decap_state=([^;]+)/) || [])[1];
  if (!code || !state || state !== saved) return page('error', { error: 'Cererea de logare nu este validă. Încearcă din nou.' });
  const r = await fetch('https://github.com/login/oauth/access_token', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'User-Agent': 'beetravel-cms' }, body: JSON.stringify({ client_id: (env.GITHUB_CLIENT_ID || '').trim(), client_secret: (env.GITHUB_CLIENT_SECRET || '').trim(), code }) }).then((x) => x.json()).catch(() => ({}));
  if (!r.access_token) return page('error', { error: 'GitHub nu a confirmat logarea (' + (r.error || 'fără răspuns') + ').' });
  return page('success', { token: r.access_token, provider: 'github' });
}
