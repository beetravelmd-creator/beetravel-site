// Logare în panoul /admin (Decap CMS) cu contul GitHub. Necesită GITHUB_CLIENT_ID și GITHUB_CLIENT_SECRET în Cloudflare.
export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const state = crypto.randomUUID();
  const gh = new URL('https://github.com/login/oauth/authorize');
  gh.searchParams.set('client_id', env.GITHUB_CLIENT_ID || '');
  gh.searchParams.set('scope', 'repo,user');
  gh.searchParams.set('redirect_uri', url.origin + '/api/callback');
  gh.searchParams.set('state', state);
  return new Response(null, { status: 302, headers: { Location: gh.toString(), 'Set-Cookie': `decap_state=${state}; Path=/api; HttpOnly; Secure; SameSite=Lax; Max-Age=600` } });
}
