import { getCollection } from 'astro:content';
const SITE = 'https://beetravel.md';
const STATIC = ['', 'experiente', 'destinatii', 'descopera-moldova', 'tur-personalizat', 'servicii', 'despre-noi', 'contact', 'rezerva-tur', 'recenzii', 'termeni-si-conditii', 'politica-de-confidentialitate', 'politica-cookie', 'anulare-si-rambursare'];
export async function GET() {
  const tours = (await getCollection('tours')).filter((t) => t.data.publicat).sort((a, b) => a.data.ordine - b.data.ordine);
  const posts = (await getCollection('blog')).filter((p) => p.data.publicat);
  const multi = [...STATIC, ...tours.map((t) => 'destinatii/' + t.id)];
  const u = (lang, p) => `${SITE}/${lang === 'ro' ? '' : lang + '/'}${p ? p + '/' : ''}`;
  let x = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';
  for (const p of multi) for (const lang of ['ro', 'ru', 'en']) {
    x += `<url><loc>${u(lang, p)}</loc>` + ['ro', 'ru', 'en'].map((l) => `<xhtml:link rel="alternate" hreflang="${l}" href="${u(l, p)}"/>`).join('') + `<xhtml:link rel="alternate" hreflang="x-default" href="${u('ro', p)}"/></url>\n`;
  }
  x += `<url><loc>${SITE}/blog/</loc></url>\n`;
  for (const p of posts) x += `<url><loc>${SITE}/blog/${p.id}/</loc><lastmod>${p.data.data.toISOString().slice(0, 10)}</lastmod></url>\n`;
  x += '</urlset>\n';
  return new Response(x, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
