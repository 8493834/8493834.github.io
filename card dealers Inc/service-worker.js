const CACHE_NAME = 'card-dealers-v1';
const urlsToCache = [
    '/',
    'index.html',
    'style.css',
    'nav.js',
    'manage.js',
    'ads.html',
    'shop.html',
    'games.html',
    'terms.html',
    'manage.html',
    'other-businesses.html',
    // Add paths to any specific images if you want them cached
    // 'https://via.placeholder.com/400x300.png?text=Professional+Dealer',
    // ...
];

// Install: Cache all necessary assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// Activate: Clean up old caches
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch: Serve content from cache, falling back to network
self.addEventListener('fetch', (event) => {
    // Strategy: Cache-first for static assets, Network-first for dynamic content (API)
    
    // Check if the request is for the dynamic JSONBin API
    if (event.request.url.includes('api.jsonbin.io')) {
        // We will handle JSONBin fallback/sync in manage.js, 
        // but for the service worker, we try network first.
        event.respondWith(
            fetch(event.request).catch(() => {
                // If API fetch fails, the main script (manage.js) will detect the failure 
                // and use its Local Storage fallback.
                console.log('Service Worker: API fetch failed (relying on JS fallback).');
            })
        );
    } else {
        // For all other static assets (HTML, CSS, JS, etc.): Cache-first
        event.respondWith(
            caches.match(event.request)
                .then((response) => {
                    // Cache hit - return response
                    if (response) {
                        return response;
                    }
                    // No cache hit - fetch from network
                    return fetch(event.request);
                }
            )
        );
    }
});
