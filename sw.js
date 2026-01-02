
// Service Worker for Kiosk Pro v5
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

// Helper for Range Requests (Critical for Video/Audio playback)
const handleRangeRequest = async (request) => {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    const rangeHeader = request.headers.get('Range');
    if (rangeHeader) {
      const arrayBuffer = await cachedResponse.arrayBuffer();
      const bytes = rangeHeader.replace(/bytes=/, "").split("-");
      const start = parseInt(bytes[0], 10);
      const end = bytes[1] ? parseInt(bytes[1], 10) : arrayBuffer.byteLength - 1;
      
      const chunk = arrayBuffer.slice(start, end + 1);
      return new Response(chunk, {
        status: 206,
        statusText: 'Partial Content',
        headers: new Headers({
          'Content-Range': `bytes ${start}-${end}/${arrayBuffer.byteLength}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunk.byteLength,
          'Content-Type': cachedResponse.headers.get('Content-Type'),
        }),
      });
    }
    return cachedResponse;
  }

  // Fallback to network
  return fetch(request);
};

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const isMedia = event.request.destination === 'video' || 
                  event.request.destination === 'audio' || 
                  url.pathname.toLowerCase().endsWith('.mp4') || 
                  url.pathname.toLowerCase().endsWith('.pdf');

  // Handle Range Requests for Media
  if (isMedia && event.request.headers.get('Range')) {
    event.respondWith(handleRangeRequest(event.request));
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match('/index.html');
        })
    );
    return;
  }

  const isImage = event.request.destination === 'image';
  const isFont = event.request.destination === 'font';

  if (isMedia || isImage || isFont) {
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
          });
          return response;
        }).catch(() => null);
      })
    );
    return;
  }

  // Network First for everything else
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (!response || response.status !== 200) return response;
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
