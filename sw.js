
// Service Worker for Kiosk Pro v5.2 (Firefox Stability Enhanced)
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
 * Enhanced Range Request Handler for Firefox.
 * Fixes freezing issues where Firefox media probe hangs on partial content.
 */
const handleRangeRequest = async (request) => {
  const cache = await caches.open(CACHE_NAME);
  let response = await cache.match(request);

  if (!response) {
    try {
      response = await fetch(request);
      // Only cache full successful responses
      if (response.status === 200) {
        const copy = response.clone();
        cache.put(request, copy);
      } else if (response.status === 206) {
          // If network returns 206 directly, just pass it through without caching
          return response;
      }
    } catch (e) {
      return new Response(null, { status: 404 });
    }
  }

  const rangeHeader = request.headers.get('Range');
  if (rangeHeader) {
    try {
      const arrayBuffer = await response.arrayBuffer();
      const bytes = rangeHeader.replace(/bytes=/, "").split("-");
      const start = parseInt(bytes[0], 10);
      const total = arrayBuffer.byteLength;
      const end = bytes[1] ? parseInt(bytes[1], 10) : total - 1;
      
      if (start >= total || end >= total) {
          return new Response(null, { 
              status: 416, 
              headers: { 'Content-Range': `bytes */${total}` } 
          });
      }

      const chunk = arrayBuffer.slice(start, end + 1);
      
      return new Response(chunk, {
        status: 206,
        statusText: 'Partial Content',
        headers: new Headers({
          'Content-Type': response.headers.get('Content-Type') || 'video/mp4',
          'Accept-Ranges': 'bytes',
          'Content-Range': `bytes ${start}-${end}/${total}`,
          'Content-Length': chunk.byteLength.toString(),
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-cache'
        }),
      });
    } catch (e) {
      // Fallback to network if slicing fails
      return fetch(request);
    }
  }

  return response;
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
        if (res.status === 200 && event.request.method === 'GET') {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, copy));
        }
        return res;
      });
    })
  );
});
