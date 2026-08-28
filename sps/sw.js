/*
  Copyright (C) 2026 Joshua Steel. All rights reserved.
  This code is source-available. You must submit a GitHub Issue form before using.
*/
const cacheName = 'sps-v2'; // Bumped version to force update
const assets = [
  './',
  './index.html'
  // Removed external placeholder image URL to avoid CORS/fetch crashes
];

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
});

// 2. Network-First Fetch Strategy with Safe Offline Fallbacks
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
