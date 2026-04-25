const CACHE_NAME = 'datekeeper-v3';

// BASE si calcola dal percorso del SW → funziona su qualsiasi deployment
const BASE = self.location.pathname.replace('sw.js', '');

const CORE_ASSETS = [
  BASE,
  BASE + 'index.html',
  BASE + 'manifest.json',
  BASE + 'icon-192.png',
  BASE + 'icon-512.png',
];

// Install: precache solo gli asset locali (font cachati lazily al primo accesso)
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: rimuove cache vecchie e prende controllo immediato
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const { request } = e;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Google Fonts: stale-while-revalidate (serve dalla cache, aggiorna in background)
  if (url.hostname.includes('fonts.g')) {
    e.respondWith(staleWhileRevalidate(request));
    return;
  }

  // Navigazione HTML: network-first, fallback offline all'index cachato
  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request)
        .then(res => {
          if (res.ok) caches.open(CACHE_NAME).then(c => c.put(request, res.clone()));
          return res;
        })
        .catch(() => caches.match(BASE + 'index.html'))
    );
    return;
  }

  // Asset statici: cache-first, poi network (e aggiorna la cache)
  e.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(res => {
        if (res.ok) caches.open(CACHE_NAME).then(c => c.put(request, res.clone()));
        return res;
      });
    })
  );
});

function staleWhileRevalidate(request) {
  return caches.open(CACHE_NAME).then(cache =>
    cache.match(request).then(cached => {
      const fresh = fetch(request)
        .then(res => { if (res.ok) cache.put(request, res.clone()); return res; })
        .catch(() => null);
      return cached || fresh;
    })
  );
}
