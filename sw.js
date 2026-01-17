
// Service Worker for Kiosk Pro v5.3 (Media Stream Optimized)
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

/**
 * Enhanced Range Request Handler.
 * CRITICAL FIX: Bypasses Service Worker Cache for media files.
 * Caching large video files in SW causes disk I/O contention on tablets,
 * leading to playback freezes. We rely on the browser's native media cache instead.
 */
const handleRangeRequest = async (request) => {
  // Pass through directly to network.
  // The browser's native video player handles Range headers (206 Partial Content) efficiently.
  return fetch(request);
};

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const isMedia = event.request.destination === 'video' || 
                  event.request.destination === 'audio' || 
                  url.pathname.toLowerCase().endsWith('.mp4') || 
                  url.pathname.toLowerCase().endsWith('.webm');

  if (isMedia) {
    event.respondWith(handleRangeRequest(event.request));
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Standard Assets
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then(res => {
        // Only cache valid 200 responses
        if (res.status === 200 && event.request.method === 'GET') {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, copy));
        }
        return res;
      });
    })
  );
});
