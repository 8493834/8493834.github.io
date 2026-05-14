const cacheName = 'sps-v1';
const assets = [
  '/',
  '/index.html',
  'https://via.placeholder.com/192'
];

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => {
      // Return cached file OR try to fetch from internet
      return res || fetch(e.request).catch(() => {
        // If both fail, this prevents the error you saw
        console.log("BOP Offline: Resource not found");
      });
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
