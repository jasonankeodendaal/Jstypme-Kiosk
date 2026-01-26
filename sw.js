
// Service Worker for Kiosk Pro v6.2 (API Bypass Update)
const CACHE_NAME = 'kiosk-pro-v6';

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
 */
const handleRangeRequest = async (request) => {
  return fetch(request);
};

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // 1. CRITICAL: Exclude non-GET requests (POST/PUT/DELETE)
  // This ensures API mutations go directly to the network, bypassing the SW.
  // This fixes "message channel closed" errors during large uploads or database saves.
  if (event.request.method !== 'GET') {
    return;
  }

  // 2. CRITICAL: Completely exclude PDF files from Service Worker.
  if (url.pathname.toLowerCase().endsWith('.pdf')) {
    return;
  }

  // 3. Exclude Supabase API calls (REST/Realtime) even if they are GET
  // This ensures we always get fresh data and don't cache API responses incorrectly.
  if (url.hostname.includes('supabase') || url.pathname.includes('/rest/v1/') || url.pathname.includes('/realtime/v1/')) {
      return;
  }

  // Treat heavy media (Video/Audio) to allow Range Requests
  const isMedia = event.request.destination === 'video' || 
                  event.request.destination === 'audio' || 
                  url.pathname.toLowerCase().endsWith('.mp4') || 
                  url.pathname.toLowerCase().endsWith('.webm');

  if (isMedia) {
    event.respondWith(handleRangeRequest(event.request));
    return;
  }

  // Navigation: Network First, Fallback to Index
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Images: Stale-While-Revalidate
  const isImage = event.request.destination === 'image' || 
                  url.pathname.match(/\.(jpg|jpeg|png|webp|gif|svg|ico)$/i);

  if (isImage) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(event.request);
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch((e) => {
           if (!cachedResponse) throw e;
        });

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Standard Static Assets: Cache First
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then(res => {
        if (res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, copy));
        }
        return res;
      });
    })
  );
});
