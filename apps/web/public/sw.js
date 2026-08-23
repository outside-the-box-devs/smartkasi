// Minimal PWA service worker — SmartKasi offline
// For full Workbox build, run next build --webpack with @ducanh2912/next-pwa
const CACHE = 'smartkasi-v1';
const URLS = ['/', '/admin/shops', '/manifest.json'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(URLS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then((hit) => {
      const fetchPromise = fetch(e.request)
        .then((res) => {
          if (res.ok && e.request.url.startsWith(self.location.origin)) {
            const clone = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, clone));
          }
          return res;
        })
        .catch(() => hit ?? Response.error());
      return hit ?? fetchPromise;
    }),
  );
});
self.addEventListener('message', (e) => {
  if (e.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
