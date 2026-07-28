const cacheName = 'sps-v1';
const assets = [
  '/',
  '/index.html',
  'https://via.placeholder.com/192'
];


self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(cacheName).then((cache) => {
      console.log('BOP Service Worker: Caching App Shell');
      return cache.addAll(assets);
    })
  );
});


self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

   
    if (event.request.method !== 'GET' || 
        url.hash || 
        url.href.includes('access_token') || 
        !url.protocol.startsWith('http')) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                return networkResponse;
            })
            .catch(async () => {
                
                const cachedResponse = await caches.match(event.request);
                if (cachedResponse) {
                    return cachedResponse;
                }
                
                console.log('BOP Offline: Resource not found', event.request.url);
                
                
                return new Response('Offline resource unavailable', {
                    status: 503,
                    statusText: 'Service Unavailable',
                    headers: new Headers({ 'Content-Type': 'text/plain' })
                });
            })
    );
});
