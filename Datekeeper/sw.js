const CACHE_NAME = 'date-importanti-v2';
const LOCAL_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
];
const FONT_URL = 'https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap';

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      cache.addAll(LOCAL_ASSETS).then(() => cache.add(new Request(FONT_URL, { mode: 'cors' })).catch(() => {}))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Stale-while-revalidate per Google Fonts
  if (url.hostname.includes('fonts.g')) {
    e.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        cache.match(e.request).then(cached => {
          const fresh = fetch(e.request).then(res => { cache.put(e.request, res.clone()); return res; }).catch(() => {});
          return cached || fresh;
        })
      )
    );
    return;
  }

  // Cache-first per assets locali
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
