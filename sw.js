// Service Worker for Kiosk Pro
const CACHE_NAME = 'kiosk-pro-v5';

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest-kiosk.json',
  '/manifest-admin.json',
  // Core Module Dependencies from importmap
  'https://aistudiocdn.com/lucide-react@^0.555.0',
  'https://aistudiocdn.com/@supabase/supabase-js@^2.86.0',
  'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js'
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
  const isPdf = url.pathname.toLowerCase().endsWith('.pdf');
  const isImage = event.request.destination === 'image';
  const isFont = event.request.destination === 'font';
  const isMedia = isImage || isFont || isPdf;

  if (isMedia) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          // If we have a cached version, return it
          return cachedResponse;
        }
        return fetch(event.request).then((response) => {
          // Robust caching check:
          // 1. Must exist
          // 2. If it's a standard response, must be 200 OK
          // 3. If it's an opaque response (cross-origin without CORS), 
          //    only cache if it's not suspiciously small (usually error fragments)
          const isOpaque = response.type === 'opaque';
          const isOk = response.status === 200;
          
          if (!response || (!isOk && !isOpaque)) {
            return response;
          }

          // Don't cache very small opaque responses which are often error messages from Supabase
          if (isOpaque && response.clone().blob().then(b => b.size < 500)) {
             return response;
          }
          
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        }).catch(() => {
           // If network fails and not in cache, return null (browser shows broken image icon)
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