const CACHE_NAME = 'fincrypto-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './portfolio.html',
  './info.html',
  './manifest.json',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

// Fasa Pemasangan (Install) - Simpan Fail Statik dalam Cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Fasa Pengaktifan (Activate) - Padam Cache Lama
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fasa Capaian Data (Fetch) - Ambil dari Cache dahulu jika Offline
self.addEventListener('fetch', (event) => {
  // Hanya simpan request HTTP/HTTPS tempatan
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Jika terdapat capaian internet, kemaskini cache
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Jika tiada internet, guna fail simpanan cache
        return caches.match(event.request);
      })
  );
});
