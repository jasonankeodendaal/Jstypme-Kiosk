// Service Worker for Kiosk Pro with LRU Cache Management
const CACHE_NAME = 'kiosk-pro-v4';
const MAX_CACHE_ENTRIES = 200; // Limit entries to prevent storage leak

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest-kiosk.json',
  '/manifest-admin.json'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

async function trimCache(cacheName, maxItems) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    if (keys.length > maxItems) {
        // Delete oldest items
        for (let i = 0; i < keys.length - maxItems; i++) {
            await cache.delete(keys[i]);
        }
    }
}

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  const url = new URL(event.request.url);
  const isMedia = url.pathname.toLowerCase().match(/\.(pdf|jpg|jpeg|png|webp|gif|mp4|webm)$/) || 
                  event.request.destination === 'image' || 
                  event.request.destination === 'font';

  if (isMedia) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(event.request).then((response) => {
          const isOpaque = response.type === 'opaque';
          const isOk = response.status === 200;
          if (!response || (!isOk && !isOpaque)) return response;
          
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
            trimCache(CACHE_NAME, MAX_CACHE_ENTRIES);
          });
          return response;
        }).catch(() => null);
      })
    );
    return;
  }

  // Network First for everything else
  event.respondWith(
    fetch(event.request).then((response) => {
        if (!response || response.status !== 200) return response;
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
        return response;
    }).catch(() => caches.match(event.request))
  );
});