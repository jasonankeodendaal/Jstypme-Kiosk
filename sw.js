// Service Worker for Kiosk Pro
const CACHE_NAME = 'kiosk-pro-v5';

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

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match('/index.html');
        })
    );
    return;
  }

  const url = new URL(event.request.url);
  // Improved detection to handle query params (e.g. ?t=123)
  const isPdf = url.pathname.toLowerCase().includes('.pdf');
  const isImage = event.request.destination === 'image';
  const isFont = event.request.destination === 'font';
  const isMedia = isImage || isFont || isPdf;

  if (isMedia) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((response) => {
          const isOpaque = response.type === 'opaque';
          const isOk = response.status === 200;
          
          if (!response || (!isOk && !isOpaque)) {
            return response;
          }

          // Fixed: Removed the async blob size check that was causing silent failures on mobile
          // Standard cloning and caching
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        }).catch(() => {
           return null;
        });
      })
    );
    return;
  }

  // Network First for Data
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (!response || response.status !== 200) {
          return response;
        }
        
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});