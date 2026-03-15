// ── SERVICE WORKER — auto-actualización al detectar nueva versión ──────────────
const CACHE_NAME = 'blackmoor-v74';
const BASE = '/blackmoor-hall';

const ASSETS = [
  BASE + '/',
  BASE + '/index.html',
  BASE + '/css/main.css',
  BASE + '/js/app.js',
  BASE + '/js/state.js',
  BASE + '/js/ui.js',
  BASE + '/js/mapa.js',
  BASE + '/js/config.js',
  BASE + '/js/personajes.js',
  BASE + '/js/exploracion.js',
  BASE + '/js/pasivas.js',
  BASE + '/js/confidencias.js',
  BASE + '/js/sucesos.js',
  BASE + '/js/pistas.js',
  BASE + '/js/notificaciones.js',
  BASE + '/js/avatares.js',
  BASE + '/data/blackmoor_losetas.json',
  BASE + '/data/blackmoor_distribuciones.json',
  BASE + '/data/caso_1.json',
  BASE + '/data/caso_1_variante_A.json',
  BASE + '/data/caso_1_variante_B.json',
  BASE + '/data/caso_1_variante_C.json',
  BASE + '/data/sucesos.json',
  BASE + '/data/cartas_exploracion_caso_1.json',
  BASE + '/data/pistas_caso_1.json',
  BASE + '/manifest.json',
  BASE + '/icons/icon-192x192.png',
  BASE + '/icons/icon-512x512.png',
  BASE + '/icons/apple-touch-icon.png',
  BASE + '/icons/favicon-32x32.png',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => {
      return self.clients.matchAll({ type: 'window' }).then(clients => {
        clients.forEach(client => client.postMessage({ type: 'SW_UPDATED' }));
      });
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = e.request.url;
  // Imágenes: nunca desde caché, siempre desde red/disco
  if (url.includes('/assets/')) {
    e.respondWith(fetch(e.request));
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
