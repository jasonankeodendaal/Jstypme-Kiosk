
// Service Worker for Kiosk Pro v6.2 (Memory Safety Update)
const CACHE_NAME = 'kiosk-pro-v6.2';

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
  // For video/audio, just pass through to network to let browser handle streaming/ranges
  return fetch(request);
};

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const lowerUrl = url.href.toLowerCase();
  
  // CRITICAL SAFETY: Completely exclude PDF files from Service Worker.
  // Cloning large binary blobs (PDFs) for caching causes OOM crashes on legacy Android/Firefox.
  if (lowerUrl.includes('.pdf')) {
    return;
  }

  // Treat heavy media (Video/Audio) to allow Range Requests
  const isMedia = event.request.destination === 'video' || 
                  event.request.destination === 'audio' || 
                  lowerUrl.endsWith('.mp4') || 
                  lowerUrl.endsWith('.webm');

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

  // Images: Stale-While-Revalidate with Memory Safety
  const isImage = event.request.destination === 'image' || 
                  url.pathname.match(/\.(jpg|jpeg|png|webp|gif|svg|ico)$/i);

  if (isImage) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(event.request);
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            // SAFE CLONING: Try/Catch the clone operation
            try {
                const copy = networkResponse.clone();
                cache.put(event.request, copy).catch(e => console.warn("Cache put failed", e));
            } catch (e) {
                // If cloning fails (OOM), just return the network response without caching
                console.warn("Skipping cache for large image to prevent crash");
            }
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

  // Standard Assets: Cache First
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then(res => {
        if (res.status === 200 && event.request.method === 'GET') {
          try {
              const copy = res.clone();
              caches.open(CACHE_NAME).then(c => c.put(event.request, copy));
          } catch(e) {
              console.warn("Cache clone failed", e);
          }
        }
        return res;
      });
    })
  );
});
