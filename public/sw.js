const CACHE_NAME = 'vieira-app-FINAL-v13.10.1';
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

// =========================================================================
// SYSTEM PUSH NOTIFICATIONS & LOCK SCREEN CLICK HANDLER
// =========================================================================
self.addEventListener('push', event => {
  let data = {
    title: '🎒 SmartVieira Repartidor',
    body: 'Tienes nuevas contrataciones de mochilas en tu ruta',
    url: '/courier-app.html',
    tag: 'smartvieira-push'
  };

  if (event.data) {
    try {
      data = Object.assign(data, event.data.json());
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: '/icon-courier.png',
    badge: '/icon.png',
    vibrate: [250, 100, 250, 100, 250],
    tag: data.tag || ('smartvieira-' + Date.now()),
    renotify: true,
    requireInteraction: true,
    data: {
      url: data.url || '/courier-app.html',
      time: Date.now()
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/courier-app.html';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      for (let client of windowClients) {
        if (client.url.includes('courier-app') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
