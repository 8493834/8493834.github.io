/*
  Copyright (C) 2026 Joshua Steel. All rights reserved.
  This code is source-available. You must submit a GitHub Issue form before using.
*/
const cacheName = 'sps-v3'; // Bumped version to force update
const assets = [
  './',
  './index.html',
  './snailflix.html'
  // Removed external placeholder image URL to avoid CORS/fetch crashes
];

// Only these origins are cached at runtime. The Supabase API is deliberately NOT cached,
// so signed-in data never ends up in a shared cache.
const CACHEABLE_ORIGINS = [self.location.origin, 'https://cdn.jsdelivr.net'];

// 1. Pre-cache initial app assets safely
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(cacheName).then((cache) => {
      console.log('BOP Service Worker: Caching App Shell');
      // cache.addAll fails completely if 1 asset fails, so we add error handling
      return Promise.allSettled(
        assets.map(url => cache.add(url).catch(err => console.log('Failed to cache asset:', url, err)))
      );
    })
  );
  self.skipWaiting();
});

// 2. Delete old caches when a new version takes over
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== cacheName).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// 3. Network-First Fetch Strategy with Safe Offline Fallbacks
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Ignore non-GET, URL hashes (#), Supabase auth tokens, or Chrome extensions
    if (event.request.method !== 'GET' ||
        url.hash ||
        url.href.includes('access_token') ||
        !url.protocol.startsWith('http')) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                // Keep a copy of pages and scripts so the app still loads offline
                // (before, only the two precached files were ever stored, so the
                // Supabase script was missing offline and the whole page broke).
                // (cross-origin <script> requests come back "opaque", so allow those too)
                if ((networkResponse.ok || networkResponse.type === 'opaque') && CACHEABLE_ORIGINS.includes(url.origin)) {
                    const copy = networkResponse.clone();
                    caches.open(cacheName).then(cache => cache.put(event.request, copy));
                }
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
