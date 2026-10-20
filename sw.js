const CACHE_NAME = 'kids-pet-games-v8';
const ASSETS = [
  './',
  './index.html',
  './style.css?v=8',
  './app.js?v=8',
  './manifest.json?v=8',
  './assets/corie.png',
  './assets/duncan.png',
  './assets/shannon.png',
  './assets/friends.png',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS).catch(() => {}))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 網路優先策略（有網路時永遠抓最新版，沒網路時使用快取離線玩）
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone)).catch(() => {});
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
