const CACHE_NAME = 'vieira-app-FINAL-v13.8.4';
const urlsToCache = [
  '/',
  '/pilgrim-app.html',
  '/courier-app.html',
  '/admin.html',
  '/downloads.html'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Intentionally wrapped in catch so a 404 doesn't abort install
      return cache.addAll(urlsToCache).catch(err => console.warn('Cache warning:', err));
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Borrando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Estrategia NETWORK-FIRST para garantizar siempre la última versión
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseToCache));
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

// Listener preparado para Notificaciones Push en segundo plano (Opción B)
self.addEventListener('push', event => {
  let data = { title: '🎒 SmartVieira', body: 'Novedades sobre tu mochila en ruta' };
  if (event.data) {
    try { data = event.data.json(); } catch(e) { data.body = event.data.text(); }
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon-pilgrim.png',
      badge: '/icon-pilgrim.png',
      vibrate: [200, 100, 200]
    })
  );
});
