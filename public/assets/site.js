/* BEE TRAVEL – comportamentul paginilor (meniu, limbă, cookie, galerie, filtre, formulare, recenzii) */
(function () {
  var body = document.body, lang = body.getAttribute('data-lang') || 'ro';
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

  // Meniul de pe telefon
  var mb = document.querySelector('[data-menu]'), mn = document.querySelector('[data-mobile-nav]');
  if (mb && mn) mb.addEventListener('click', function () { var o = mn.hasAttribute('hidden'); if (o) mn.removeAttribute('hidden'); else mn.setAttribute('hidden', ''); mb.setAttribute('aria-expanded', o ? 'true' : 'false'); });

  // Limba aleasă se ține minte (ca pe site-ul vechi)
  document.querySelectorAll('[data-setlang]').forEach(function (a) { a.addEventListener('click', function () { ls('bee-lang', a.getAttribute('data-setlang')); }); });

  // Cookie + Google Analytics
  var GA = body.getAttribute('data-ga');
  function loadGA() { if (!GA || window.gtag) return; var s = document.createElement('script'); s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA; document.head.appendChild(s); window.dataLayer = window.dataLayer || []; window.gtag = function () { window.dataLayer.push(arguments); }; window.gtag('js', new Date()); window.gtag('config', GA, { anonymize_ip: true }); }
  var cb = document.querySelector('[data-cookie]'), consent = ls('bee-cookie-consent-v3');
  if (consent === 'accepted') loadGA(); else if (!consent && cb) cb.removeAttribute('hidden');
  document.querySelectorAll('[data-consent]').forEach(function (b) { b.addEventListener('click', function () { var v = b.getAttribute('data-consent'); ls('bee-cookie-consent-v3', v); if (v === 'accepted') loadGA(); cb.setAttribute('hidden', ''); }); });

  // Galeria turului (fereastra mare cu săgeți)
  var gal = document.querySelector('[data-gallery]');
  if (gal) {
    var imgs = [].map.call(gal.querySelectorAll('button[data-src]'), function (b) { return b.getAttribute('data-src'); });
    var box = document.querySelector('[data-lightbox]'), big = box && box.querySelector('img'), idx = 0;
    function show(i) { idx = (i + imgs.length) % imgs.length; big.src = imgs[idx]; box.removeAttribute('hidden'); box.style.display = ''; }
    function hide() { box.setAttribute('hidden', ''); }
    gal.querySelectorAll('button[data-src]').forEach(function (b, i) { b.addEventListener('click', function () { show(i); }); });
    box.addEventListener('click', hide);
    box.querySelector('[data-close]').addEventListener('click', hide);
    box.querySelector('[data-prev]').addEventListener('click', function (e) { e.stopPropagation(); show(idx - 1); });
    box.querySelector('[data-next]').addEventListener('click', function (e) { e.stopPropagation(); show(idx + 1); });
    big.addEventListener('click', function (e) { e.stopPropagation(); });
    document.addEventListener('keydown', function (e) { if (box.hasAttribute('hidden')) return; if (e.key === 'Escape') hide(); if (e.key === 'ArrowLeft') show(idx - 1); if (e.key === 'ArrowRight') show(idx + 1); });
  }

  // Filtrul de categorii din Destinații (?categorie=...)
  var cats = document.querySelector('[data-cats]');
  if (cats) {
    var c = new URLSearchParams(location.search).get('categorie');
    if (c && document.getElementById(c)) {
      document.querySelectorAll('[data-cat-section]').forEach(function (s) { if (s.id !== c) s.setAttribute('hidden', ''); else s.removeAttribute('hidden'); });
      if (c === 'copii') { cats.setAttribute('hidden', ''); var hd = document.querySelector('[data-list-head]'); if (hd) hd.setAttribute('hidden', ''); var sh = document.getElementById('copii'); if (sh) { sh.classList.remove('mt-14'); var h2 = sh.querySelector('h2'); if (h2) h2.className = 'mb-1 font-serif text-4xl font-bold'; } }
      cats.querySelectorAll('a[data-cat]').forEach(function (a) { var on = a.getAttribute('data-cat') === c; a.className = a.className.replace(/border-\[#b91c1c\] bg-\[#b91c1c\] text-white|border-\[#e7ddc4\] text-neutral-700/, on ? 'border-[#b91c1c] bg-[#b91c1c] text-white' : 'border-[#e7ddc4] text-neutral-700'); });
    }
  }

  // Rezervare: turul din link (?tour=id) se alege automat
  var sel = document.querySelector('select[name="traseu"]');
  if (sel) { var t = new URLSearchParams(location.search).get('tour'); if (t) { var o = sel.querySelector('option[data-id="' + t + '"]'); if (o) sel.value = o.value; } }

  // Formulare Netlify trimise din pagină (contact, tur personalizat)
  document.querySelectorAll('form[data-ajax]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault(); var btn = f.querySelector('button[type=submit],button:not([type])'); if (btn) btn.disabled = true;
      var data = new URLSearchParams(new FormData(f));
      fetch('/__forms.html', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'text/html' }, body: data.toString() })
        .then(function (r) { if (!r.ok) throw new Error(r.status); location.assign('/multumim-rezervare/'); })
        .catch(function () { if (btn) btn.disabled = false; var m = f.querySelector('[data-error]'); if (m) m.removeAttribute('hidden'); });
    });
  });
})();
