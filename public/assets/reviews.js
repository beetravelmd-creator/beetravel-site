/* Recenzii: listă publică, trimitere, administrare (aceeași funcție Netlify „bee-reviews” ca până acum) */
(function () {
  var root = document.querySelector('[data-reviews]'); if (!root) return;
  var admin = root.getAttribute('data-reviews') === 'admin', lang = document.body.getAttribute('data-lang') || 'ro';
  var T = {
    ro: { reload: 'Reîncarcă lista', logout: 'Ieșire', loading: 'Se încarcă…', adminEmpty: 'Nu sunt recenzii primite.', publicEmpty: 'Momentan nu sunt recenzii publicate.', sending: 'Se trimite…', approved: 'Publicată', pending: 'În așteptare', hidden: 'Ascunsă', publish: 'Publică', hide: 'Ascunde', del: 'Șterge definitiv', deleted: 'Recenzia a fost ștearsă.', approvedMsg: 'Recenzia este publică.', hiddenMsg: 'Recenzia este ascunsă.', submitMsg: 'Mulțumim! Recenzia a fost trimisă și așteaptă aprobarea. Nu este încă publicată.', confirm: 'Ștergi definitiv această recenzie din site și din administrare?', fail: 'Cererea nu a reușit.' },
    en: { reload: 'Reload reviews', logout: 'Log out', loading: 'Loading…', adminEmpty: 'There are no received reviews.', publicEmpty: 'There are currently no published reviews.', sending: 'Sending…', approved: 'Published', pending: 'Pending', hidden: 'Hidden', publish: 'Publish', hide: 'Hide', del: 'Delete permanently', deleted: 'The review was deleted.', approvedMsg: 'The review is public.', hiddenMsg: 'The review is hidden.', submitMsg: 'Thank you! Your review has been submitted and is awaiting approval. It is not published yet.', confirm: 'Delete this review permanently?', fail: 'The request failed.' },
    ru: { reload: 'Обновить отзывы', logout: 'Выйти', loading: 'Загрузка…', adminEmpty: 'Полученных отзывов пока нет.', publicEmpty: 'Опубликованных отзывов пока нет.', sending: 'Отправка…', approved: 'Опубликован', pending: 'На рассмотрении', hidden: 'Скрыт', publish: 'Опубликовать', hide: 'Скрыть', del: 'Удалить навсегда', deleted: 'Отзыв удалён.', approvedMsg: 'Отзыв опубликован.', hiddenMsg: 'Отзыв скрыт.', submitMsg: 'Спасибо! Ваш отзыв отправлен и ожидает одобрения. Пока он не опубликован.', confirm: 'Удалить этот отзыв навсегда?', fail: 'Запрос не выполнен.' }
  }[lang];
  var API = '/.netlify/functions/bee-reviews';
  var list = root.querySelector('[data-list]'), msg = root.querySelector('[data-msg]');
  function say(t) { if (!t) { msg.setAttribute('hidden', ''); msg.textContent = ''; return; } msg.textContent = t; msg.removeAttribute('hidden'); }
  function api(action, data) {
    return fetch(API + '?action=' + action, data === undefined ? { cache: 'no-store', credentials: 'same-origin' } : { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok) { var e = new Error(j.error || T.fail); e.status = r.status; throw e; } return j; }); });
  }
  function el(tag, attrs, text) { var e = document.createElement(tag); for (var k in attrs || {}) e.setAttribute(k, attrs[k]); if (text != null) e.textContent = text; return e; }
  function tourName(x) { if (x === 'Pelerinaj Curchi, Orheiul vechi') return lang === 'ru' ? 'Паломничество в Курки и Старый Орхей' : lang === 'en' ? 'Pilgrimage to Curchi and Orheiul Vechi' : x; if (x === 'Pelerinaj la 9 mănăstiri') return lang === 'ru' ? 'Паломничество по 9 монастырям' : lang === 'en' ? 'Pilgrimage to 9 monasteries' : x; return x; }
  var busy = false;
  function render(items) {
    list.innerHTML = '';
    if (!items.length) { list.appendChild(el('div', { class: 'panel' }, admin ? T.adminEmpty : T.publicEmpty)); return; }
    items.forEach(function (x) {
      var a = el('article', { class: 'panel' });
      a.appendChild(el('h2', {}, x.name));
      a.appendChild(el('p', { class: 'stars', 'aria-label': x.rating + (lang === 'ru' ? ' из 5 звёзд' : lang === 'en' ? ' out of 5 stars' : ' din 5 stele') }, '★'.repeat(x.rating) + '☆'.repeat(5 - x.rating)));
      if (x.tour) a.appendChild(el('p', {}, tourName(x.tour)));
      a.appendChild(el('p', { class: 'review-text' }, x.text));
      a.appendChild(el('small', {}, new Date(x.created).toLocaleDateString(lang === 'ru' ? 'ru-RU' : lang === 'en' ? 'en-GB' : 'ro-RO')));
      if (admin) {
        a.appendChild(el('small', {}, (x.email || '') + ' · ' + (x.status === 'pending' ? T.pending : x.status === 'approved' ? T.approved : T.hidden)));
        [['approved', T.publish, ''], ['hidden', T.hide, ''], ['deleted', T.del, 'danger']].forEach(function (b) {
          var btn = el('button', { type: 'button', class: b[2] }, b[1]); if (x.status === b[0]) btn.disabled = true;
          btn.addEventListener('click', function () { moderate(x.id, b[0]); }); a.appendChild(btn);
        });
      }
      list.appendChild(a);
    });
  }
  function load() {
    return api(admin ? 'admin' : 'public').then(function (items) { if (admin) loggedIn(true); render(items); })
      .catch(function (e) { if (admin && e.status === 401) loggedIn(false); else if (admin) say(e.message); });
  }
  function moderate(id, status) {
    if (busy) return; if (status === 'deleted' && !confirm(T.confirm)) return; busy = true; say('');
    api('moderate', { id: id, status: status }).then(load).then(function () { say(status === 'deleted' ? T.deleted : status === 'approved' ? T.approvedMsg : T.hiddenMsg); })
      .catch(function (e) { say(e.message); }).then(function () { busy = false; });
  }
  if (admin) {
    var login = root.querySelector('[data-login]'), tools = root.querySelector('[data-admin-tools]');
    var rl = tools.querySelector('[data-reload]'), lo = tools.querySelector('[data-logout]'); rl.textContent = T.reload; lo.textContent = T.logout;
    window.loggedIn = function () {};
    var loggedIn = function (on) { if (on) { login.setAttribute('hidden', ''); tools.removeAttribute('hidden'); } else { login.removeAttribute('hidden'); tools.setAttribute('hidden', ''); list.innerHTML = ''; } };
    login.addEventListener('submit', function (e) { e.preventDefault(); var b = login.querySelector('button'); b.disabled = true; say('');
      api('login', { password: new FormData(login).get('password') }).then(function () { login.reset(); return load(); }).catch(function (er) { say(er.message); }).then(function () { b.disabled = false; }); });
    rl.addEventListener('click', function () { load(); });
    lo.addEventListener('click', function () { api('logout', {}).then(function () { loggedIn(false); }).catch(function (er) { say(er.message); }); });
    say(T.loading); load().then(function () { if (msg.textContent === T.loading) say(''); });
  } else {
    var loggedIn = function () {};
    load();
    var f = root.querySelector('[data-submit]');
    f.addEventListener('submit', function (e) {
      e.preventDefault(); var d = new FormData(f), b = f.querySelector('button'), old = b.textContent; b.disabled = true; b.textContent = T.sending; say('');
      api('submit', { name: d.get('name'), email: d.get('email'), tour: d.get('tour'), rating: Number(d.get('rating')), text: d.get('text'), website: d.get('website'), consent: d.get('consent') === 'on' })
        .then(function () { f.reset(); say(T.submitMsg); }).catch(function (er) { say(er.message); }).then(function () { b.disabled = false; b.textContent = old; });
    });
  }
})();
