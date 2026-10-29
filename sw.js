/* Service worker: la app funciona sin conexión una vez cargada. Cambiad CACHE al publicar una versión nueva. */
var CACHE = 'blackmoor-2.0.1';
var FILES = [
  './', 'index.html', 'manifest.webmanifest', 'css/app.css?v=2.0.1', 'js/app.js?v=2.0.1', 'data/casos.js?v=2.0.1', 'data/caso1.js?v=2.0.1',
  'fonts/cinzel-latin-600-normal.woff2', 'fonts/cinzel-latin-700-normal.woff2',
  'fonts/eb-garamond-latin-400-normal.woff2', 'fonts/eb-garamond-latin-400-italic.woff2',
  'fonts/eb-garamond-latin-600-normal.woff2', 'fonts/eb-garamond-latin-600-italic.woff2',
  'img/caso1_portada.webp', 'img/icon-192.png', 'img/icon-512.png', 'img/apple-touch-icon.png',
  'img/pnj_marsh.webp', 'img/pnj_harold.webp', 'img/pnj_catherine.webp', 'img/pnj_hobbes.webp', 'img/pnj_pemberton.webp', 'img/pnj_whitfield.webp',
  'img/pj_doctor.webp', 'img/pj_institutriz.webp', 'img/pj_inspector.webp', 'img/pj_medium.webp', 'img/pj_mayordomo.webp', 'img/pj_periodista.webp'
];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  // La página principal: primero la red (para recibir versiones nuevas), y si no hay conexión, la copia guardada.
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).then(function (r) {
      var copy = r.clone(); caches.open(CACHE).then(function (c) { c.put('index.html', copy); }); return r;
    }).catch(function () { return caches.match('index.html'); }));
    return;
  }
  e.respondWith(caches.match(e.request).then(function (hit) { return hit || fetch(e.request); }));
});
