import settings from '../data/setari.json';
import categorii from '../data/categorii.json';

export const LANGS = ['ro', 'ru', 'en'];
export const SITE = 'https://beetravel.md';

// Link intern pentru o limbă: RO fără prefix, RU/EN cu /ru/ sau /en/. Mereu cu „/” la final.
export function L(lang, path = '/') {
  let [p, q] = path.split('?');
  let hash = '';
  if (p.includes('#')) [p, hash] = p.split('#');
  if (!p.endsWith('/')) p += '/';
  const pre = lang === 'ro' ? '' : '/' + lang;
  const full = (pre + p).replace(/\/\/+/g, '/');
  return full + (q ? '?' + q : '') + (hash ? '#' + hash : '');
}

export const NAV = [
  ['/', { ro: 'Acasă', ru: 'Главная', en: 'Home' }],
  ['/experiente', { ro: 'Experiențe', ru: 'Впечатления', en: 'Experiences' }],
  ['/destinatii', { ro: 'Destinații', ru: 'Направления', en: 'Destinations' }],
  ['/tur-personalizat', { ro: 'Tur personalizat', ru: 'Индивидуальный тур', en: 'Custom tour' }],
  ['/servicii', { ro: 'Servicii și organizare', ru: 'Услуги и организация', en: 'Services & organization' }],
  ['/despre-noi', { ro: 'Despre noi', ru: 'О нас', en: 'About us' }],
  ['/recenzii', { ro: 'Recenzii', ru: 'Отзывы', en: 'Reviews' }],
  ['/contact', { ro: 'Contact', ru: 'Контакты', en: 'Contact' }],
];

export const UI = {
  ro: {
    tagline: 'Călătorim cu suflet', home: 'BEE TRAVEL – pagina principală',
    footerText: 'Pelerinaje, tururi culturale și călătorii la vinării în Moldova și România, organizate cu grijă pentru fiecare călător.',
    nav: 'Navigare', info: 'Informații', contact: 'Contact', city: 'Chișinău, Republica Moldova', phoneLabel: 'Telefon / WhatsApp',
    legal: [['/termeni-si-conditii', 'Termeni și condiții'], ['/politica-de-confidentialitate', 'Confidențialitate'], ['/politica-cookie', 'Cookie'], ['/anulare-si-rambursare', 'Anulare și rambursare']],
    rights: 'Toate drepturile rezervate.',
    cookieT: 'Preferințe cookie', cookieP: 'Folosim cookie-uri strict necesare pentru funcționarea site-ului. Cu acordul tău, folosim și Google Analytics pentru a înțelege cum este utilizat site-ul.',
    cookieL: 'Politica cookie', cookieN: 'Doar necesare', cookieA: 'Acceptă analitice',
  },
  ru: {
    tagline: 'Путешествуем с душой', home: 'BEE TRAVEL – главная страница',
    footerText: 'Паломнические, культурные и винные туры по Молдове и Румынии, организованные с заботой о каждом путешественнике.',
    nav: 'Навигация', info: 'Информация', contact: 'Контакты', city: 'Кишинёв, Республика Молдова', phoneLabel: 'Телефон / WhatsApp',
    legal: [['/termeni-si-conditii', 'Условия'], ['/politica-de-confidentialitate', 'Конфиденциальность'], ['/politica-cookie', 'Cookie'], ['/anulare-si-rambursare', 'Отмена и возврат']],
    rights: 'Все права защищены.',
    cookieT: 'Настройки cookie', cookieP: 'Мы используем строго необходимые cookie для работы сайта. С вашего согласия мы также используем Google Analytics, чтобы понимать, как используется сайт.',
    cookieL: 'Политика cookie', cookieN: 'Только необходимые', cookieA: 'Принять аналитику',
  },
  en: {
    tagline: 'We travel with soul', home: 'BEE TRAVEL – home page',
    footerText: 'Pilgrimages, cultural tours and winery trips in Moldova and Romania, thoughtfully organized for every traveler.',
    nav: 'Navigation', info: 'Information', contact: 'Contact', city: 'Chișinău, Republic of Moldova', phoneLabel: 'Phone / WhatsApp',
    legal: [['/termeni-si-conditii', 'Terms & conditions'], ['/politica-de-confidentialitate', 'Privacy'], ['/politica-cookie', 'Cookies'], ['/anulare-si-rambursare', 'Cancellation & refunds']],
    rights: 'All rights reserved.',
    cookieT: 'Cookie preferences', cookieP: 'We use strictly necessary cookies for the website to work. With your consent, we also use Google Analytics to understand how the website is used.',
    cookieL: 'Cookie policy', cookieN: 'Necessary only', cookieA: 'Accept analytics',
  },
};

export const TOUR_UI = {
  ro: { route: 'Traseu / obiective vizitate', duration: 'Durată', inc: 'Ce include', exc: 'Ce NU include', priv: 'Preț privat', ford: 'Transport grup 8–16', request: 'Solicită rezervarea', book: 'Scrie-ne pe WhatsApp', related: 'Alte tururi similare', gallery: 'Galeria turului', gallerySub: 'Fotografii ale obiectivelor incluse în acest traseu', close: 'Închide', wa: 'Bună! Aș dori mai multe informații despre turul' },
  en: { route: 'Itinerary / places visited', duration: 'Duration', inc: 'What is included', exc: 'What is NOT included', priv: 'Private price', ford: 'Group transport 8–16', request: 'Request booking', book: 'Message us on WhatsApp', related: 'Similar tours', gallery: 'Tour gallery', gallerySub: 'Photos of places included in this itinerary', close: 'Close', wa: 'Hello! I would like more information about the tour' },
  ru: { route: 'Маршрут / посещаемые места', duration: 'Продолжительность', inc: 'Что включено', exc: 'Что НЕ включено', priv: 'Цена частного тура', ford: 'Транспорт для групп 8–16', request: 'Запросить бронирование', book: 'Написать в WhatsApp', related: 'Похожие туры', gallery: 'Галерея тура', gallerySub: 'Фотографии мест, включённых в этот маршрут', close: 'Закрыть', wa: 'Здравствуйте! Я хотел(а) бы узнать больше о туре' },
};

export const LIST_UI = {
  ro: { title: 'Destinații', intro: 'Descoperă traseele BEE TRAVEL, organizate pe categorii. În catalog afișăm prețul de pornire; prețurile complete sunt disponibile în pagina fiecărui tur.', note: 'Prețuri conform grilei aprobate BEE TRAVEL. Verifică pagina turului pentru toate opțiunile și condițiile.', all: 'Toate turele', request: 'Solicită rezervarea', details: 'Detalii' },
  en: { title: 'Destinations', intro: 'Discover BEE TRAVEL itineraries by category. The catalogue shows the starting price; full customer prices are available on each tour page.', note: 'Prices follow the approved BEE TRAVEL price list. See the tour page for all options and conditions.', all: 'All tours', request: 'Request booking', details: 'Details' },
  ru: { title: 'Направления', intro: 'Откройте маршруты BEE TRAVEL по категориям. В каталоге указана стартовая цена; полные цены для клиентов находятся на странице каждого тура.', note: 'Цены соответствуют утверждённой сетке BEE TRAVEL. Все варианты и условия смотрите на странице тура.', all: 'Все туры', request: 'Запросить бронь', details: 'Подробнее' },
};

export function categoryName(slug, lang) {
  const c = categorii.find((x) => x.slug === slug);
  return c ? c[lang] || c.ro : slug;
}
export { categorii };

// Traducerea automată a prețurilor (aceeași regulă ca pe site-ul vechi): prețul se scrie doar în română.
export function trPrice(s, lang) {
  if (!s || lang === 'ro') return s;
  if (lang === 'en') return s.replace(/^de la /i, 'from ').replace(/\/grup/g, '/group').replace(/\/pers\./g, '/person').replace(/pers\.:/g, 'people:').replace(/minim 8 persoane plătitoare/g, 'minimum 8 paying passengers').replace(/La cerere/g, 'On request');
  return s.replace(/^de la /i, 'от ').replace(/\/grup/g, '/группа').replace(/\/pers\./g, '/чел.').replace(/pers\.:/g, 'чел.:').replace(/minim 8 persoane plătitoare/g, 'минимум 8 оплачивающих пассажиров').replace(/La cerere/g, 'По запросу');
}

// Turul în limba cerută (câmpurile RU/EN goale iau textul din română).
export function localTour(entry, lang) {
  const d = entry.data;
  const t = (lang !== 'ro' && d[lang]) || {};
  return {
    id: entry.id, categorie: d.categorie, category: categoryName(d.categorie, lang),
    name: t.nume || d.nume, route: t.traseu || d.traseu, includes: t.include || d.include, excludes: t.nu_include || d.nu_include,
    priv: trPrice(d.pret_privat, lang), group: trPrice(d.pret_grup, lang), duration: t.durata || d.durata,
    image: d.imagine_card, alt: d.alt, gallery: d.galerie || [], credit: d.credit_foto, data: d,
    grid: d.grila || [], minPrice: (d.grila || []).length ? Math.min(...d.grila.map((g) => g.pret)) : null,
  };
}

export const GRID_UI = {
  ro: { title: 'Preț de persoană', sub: 'în funcție de numărul de persoane din grup', pers: 'pers.', big: 'Grupuri de peste 16 persoane: cu autocar, la cerere.', from: 'DE LA', per: 'PERS.', two: (p) => `Pentru 2 persoane: ${p} € / pers.` },
  en: { title: 'Price per person', sub: 'depending on the number of people in the group', pers: 'people', big: 'Groups over 16 people: by coach, on request.', from: 'FROM', per: 'PERSON', two: (p) => `For 2 people: €${p} per person` },
  ru: { title: 'Цена за человека', sub: 'в зависимости от количества человек в группе', pers: 'чел.', big: 'Группы более 16 человек: автобус, по запросу.', from: 'ОТ', per: 'ЧЕЛ.', two: (p) => `Для 2 человек: ${p} € / чел.` },
};
export function catalogPrice(t, lang) {
  if (t.minPrice != null) return `${GRID_UI[lang].from} ${t.minPrice} € / ${GRID_UI[lang].per}`;
  const r = lang === 'ro' ? 'DE LA' : lang === 'en' ? 'FROM' : 'ОТ', s = lang === 'ro' ? 'PERS.' : lang === 'en' ? 'PERSON' : 'ЧЕЛ.', o = lang === 'ro' ? 'GRUP' : lang === 'en' ? 'GROUP' : 'ГРУППА', a = lang === 'ro' ? 'MIN. 8 PERS.' : lang === 'en' ? 'MIN. 8 PEOPLE' : 'МИН. 8 ЧЕЛ.';
  const n = t.group.match(/(\d+)\s*MDL/i), l = t.group.match(/EUR\s*(\d+)/i) || t.group.match(/€\s*(\d+)/), c = t.priv.match(/EUR\s*(\d+)/i) || t.priv.match(/€\s*(\d+)/);
  return n ? `${r} ${n[1]} MDL / ${s} (${a})` : l ? `${r} ${l[1]} € / ${s} (${a})` : c ? `${r} ${c[1]} € / ${o}` : lang === 'ro' ? 'VEZI PREȚUL' : lang === 'en' ? 'SEE PRICE' : 'СМОТРЕТЬ ЦЕНУ';
}
export function catalogPrivate(t, lang) {
  if (t.grid && t.grid.length) { const two = t.grid.find((g) => g.persoane === '2'); return two ? GRID_UI[lang].two(two.pret) : ''; }
  const r = t.group.match(/(\d+)\s*MDL/i), s = t.group.match(/EUR\s*(\d+)/i) || t.group.match(/€\s*(\d+)/), o = t.priv.match(/EUR\s*(\d+)/i) || t.priv.match(/€\s*(\d+)/);
  return (r || s) && o ? (lang === 'ro' ? `Tur privat de la ${o[1]} € / grup` : lang === 'en' ? `Private tour from ${o[1]} € / group` : `Частный тур от ${o[1]} € / группа`) : lang === 'ro' ? 'Prețurile complete sunt afișate în detaliile turului.' : lang === 'en' ? 'Full customer prices are shown on the tour details page.' : 'Полные цены указаны на странице тура.';
}

export function wa(text) {
  const base = 'https://wa.me/' + settings.whatsapp;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

// Rescrie linkurile interne dintr-un fragment HTML pentru limba dată (+ „/” la final).
export function rewriteLinks(html, lang) {
  return html.replace(/href="(\/[^"]*)"/g, (m, p) => {
    if (/^\/(images|fonts|assets|\.netlify|__forms)/.test(p) || /\.[a-z0-9]{2,5}($|\?|#)/i.test(p)) return m;
    return `href="${L(lang, p.replace(/&amp;/g, '&'))}"`.replace(/&(?!amp;)/g, '&amp;');
  }).replace(/action="\/multumim-rezervare\/"/g, 'action="/multumim-rezervare/"');
}

export { settings };
