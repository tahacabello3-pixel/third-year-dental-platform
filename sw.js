// DentalEd PWA Service Worker
// Version — bump this string to force cache refresh
const CACHE_VERSION = 'dentix-v1';

const STATIC_ASSETS = [
  './',
  './index.html',
  './signup.html',
  './dashboard.html',
  './subjects.html',
  './subject.html',
  './quiz.html',
  './profile.html',
  './announcements.html',
  './style.css',
  './app.js',
  './supabase.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  // Supabase CDN — cached on first fetch
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
];

// ── Install ────────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(cache => {
      // Cache local assets; skip any that fail (e.g. CDN offline during install)
      return Promise.allSettled(
        STATIC_ASSETS.map(url => cache.add(url).catch(() => {}))
      );
    }).then(() => self.skipWaiting())
  );
});

// ── Activate — clean up old caches ───────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_VERSION)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch — Network-first for API, Cache-first for assets ─
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Always go network-first for Supabase API calls (auth, data)
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  // For navigation requests (HTML pages) use network-first
  if (event.request.mode === 'navigate') {
    event.respondWith(networkFirst(event.request));
    return;
  }

  // For static assets (CSS, JS, images) use cache-first
  event.respondWith(cacheFirst(event.request));
});

// ── Strategies ────────────────────────────────────────────
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response && response.status === 200 && response.type !== 'opaque') {
      const cache = await caches.open(CACHE_VERSION);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || offlineFallback();
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(CACHE_VERSION);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return offlineFallback();
  }
}

function offlineFallback() {
  return new Response(
    `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Offline — DentalEd</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{background:#0f1117;color:#e2e8f0;font-family:system-ui,sans-serif;
      display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center;padding:2rem}
    .icon{font-size:4rem;margin-bottom:1.5rem}
    h1{font-size:1.5rem;margin-bottom:.75rem;color:#fff}
    p{color:#94a3b8;max-width:320px;line-height:1.6;margin:0 auto 1.5rem}
    button{background:#6c63ff;color:#fff;border:none;padding:.75rem 2rem;
      border-radius:.75rem;font-size:1rem;cursor:pointer}
  </style>
</head>
<body>
  <div>
    <div class="icon">🦷</div>
    <h1>You're offline</h1>
    <p>No internet connection. Some pages may still work from cache — try going back or refreshing when you're online.</p>
    <button onclick="location.reload()">Try again</button>
  </div>
</body>
</html>`,
    { headers: { 'Content-Type': 'text/html' } }
  );
}
