
// Service Worker for Kiosk Pro v5.1 (Firefox Optimized)
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
 * Enhanced Range Request Handler
 * Specifically tuned for Firefox and Chrome's media probe behaviors.
 */
const handleRangeRequest = async (request) => {
  const cache = await caches.open(CACHE_NAME);
  let response = await cache.match(request);

  // If not in cache, fetch from network and try to cache it
  if (!response) {
    try {
      response = await fetch(request);
      // We only cache successful full responses or opaque responses
      if (response.status === 200 || response.type === 'opaque') {
        const copy = response.clone();
        cache.put(request, copy);
      }
    } catch (e) {
      return new Response(null, { status: 404 });
    }
  }

  const rangeHeader = request.headers.get('Range');
  if (rangeHeader && response.status !== 206) {
    try {
      const arrayBuffer = await response.arrayBuffer();
      const bytes = rangeHeader.replace(/bytes=/, "").split("-");
      const start = parseInt(bytes[0], 10);
      const total = arrayBuffer.byteLength;
      const end = bytes[1] ? parseInt(bytes[1], 10) : total - 1;
      
      const chunk = arrayBuffer.slice(start, end + 1);
      
      // Firefox requires these specific headers to consider a 206 valid
      return new Response(chunk, {
        status: 206,
        statusText: 'Partial Content',
        headers: new Headers({
          'Content-Type': response.headers.get('Content-Type') || 'video/mp4',
          'Accept-Ranges': 'bytes',
          'Content-Range': `bytes ${start}-${end}/${total}`,
          'Content-Length': chunk.byteLength.toString(),
          'Access-Control-Allow-Origin': '*',
        }),
      });
    } catch (e) {
      // If slicing fails, return original response
      return response;
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

  // Handle Media Requests (Always check for Ranges)
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

  // Assets (Images/Fonts) - Cache First
  if (event.request.destination === 'image' || event.request.destination === 'font') {
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
    return;
  }

  // Everything else: Network First
  event.respondWith(
    fetch(event.request)
      .then(res => res)
      .catch(() => caches.match(event.request))
  );
});
