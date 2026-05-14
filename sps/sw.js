const cacheName = 'sps-v1';
const assets = [
  '/',
  '/index.html',
  'https://via.placeholder.com/192'
];

// Install Event
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      cache.addAll(assets);
    })
  );
});

// Fetch Event
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => {
      return res || fetch(e.request);
    })
  );
});