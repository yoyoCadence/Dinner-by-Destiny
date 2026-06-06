/* 今晚吃命 — Service Worker（離線快取）
   改版時把 CACHE 後面的版號 +1，使用者下次開啟就會更新。 */
const CACHE = 'dinner-by-destiny-v3';

const APP_SHELL = [
  'index.html',
  'manifest.webmanifest',
  'data.js',
  'theme.js',
  'import-util.js',
  'tweaks-panel.jsx',
  'store.jsx',
  'icons.jsx',
  'bits.jsx',
  'App.jsx',
  'screens/Explore.jsx',
  'screens/Dice.jsx',
  'screens/Diary.jsx',
  'screens/Stats.jsx',
  'screens/Group.jsx',
  'screens/ImportSheet.jsx',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
  'icons/apple-touch-icon.png',
  'icons/favicon-32.png',
];

// 外部相依（React / ReactDOM / Babel / 字型）— 盡量預先快取，失敗不影響安裝
const VENDOR = [
  'https://unpkg.com/react@18.3.1/umd/react.development.js',
  'https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js',
  'https://unpkg.com/@babel/standalone@7.29.0/babel.min.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(APP_SHELL);
    await Promise.allSettled(VENDOR.map((u) => cache.add(new Request(u, { mode: 'no-cors' }))));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  // 導覽請求：離線時回退到 index.html
  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      try { return await fetch(req); }
      catch (err) { return (await caches.match('index.html')) || Response.error(); }
    })());
    return;
  }

  // 跨源 vendor（React / Babel CDN，穩定且大）：快取優先
  const sameOrigin = new URL(req.url).origin === self.location.origin;
  if (!sameOrigin) {
    e.respondWith((async () => {
      const cached = await caches.match(req);
      if (cached) return cached;
      try {
        const res = await fetch(req);
        if (res && (res.ok || res.type === 'opaque')) {
          const cache = await caches.open(CACHE);
          cache.put(req, res.clone());
        }
        return res;
      } catch (err) {
        return cached || Response.error();
      }
    })());
    return;
  }

  // 同源 app 檔案：網路優先（強制繞過 HTTP 快取抓最新並更新快取，離線才回退）
  e.respondWith((async () => {
    try {
      const res = await fetch(req, { cache: 'reload' });
      if (res && res.ok) {
        const cache = await caches.open(CACHE);
        cache.put(req, res.clone());
      }
      return res;
    } catch (err) {
      const cached = await caches.match(req, { ignoreSearch: false });
      return cached || Response.error();
    }
  })());
});
