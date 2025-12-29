
// Service Worker for Kiosk Pro
const CACHE_NAME = 'kiosk-pro-v5';

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest-kiosk.json',
  '/manifest-admin.json',
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

async function handleMediaFetch(request) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;

    try {
        const response = await fetch(request);
        const isOpaque = response.type === 'opaque';
        const isOk = response.status === 200;

        if (!response || (!isOk && !isOpaque)) {
            return response;
        }

        // Properly await blob check for opaque responses to filter out error fragments
        if (isOpaque) {
            const blob = await response.clone().blob();
            if (blob.size < 500) return response; // Don't cache error shards
        }

        const responseToCache = response.clone();
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, responseToCache);
        return response;
    } catch (e) {
        return null;
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
  const isPdf = url.pathname.toLowerCase().endsWith('.pdf');
  const isImage = event.request.destination === 'image';
  const isFont = event.request.destination === 'font';
  const isMedia = isImage || isFont || isPdf;

  if (isMedia) {
    event.respondWith(handleMediaFetch(event.request));
    return;
  }

  // Network First for Data
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (!response || response.status !== 200) return response;
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseToCache));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
