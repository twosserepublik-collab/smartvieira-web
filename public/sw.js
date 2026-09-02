const CACHE_NAME = 'vieira-app-v1788362089230';
const urlsToCache = [
  '/',
  '/pilgrim-app.html',
  '/courier-app.html',
  '/downloads.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
