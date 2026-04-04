/* =============================================
   InsureFlow — Service Worker
   Offline-first caching strategy
   ============================================= */

const CACHE_NAME = 'insureflow-v1.0';
const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/app.js',
  '/styles.css',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Sora:wght@400;600;700;800&display=swap',
];

// Install: cache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(SHELL_ASSETS.filter(url => !url.startsWith('http')));
    }).then(() => self.skipWaiting())
  );
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: cache-first for shell, network-first for APIs
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Cache-first for app shell assets
  if (SHELL_ASSETS.includes(url.pathname) || url.pathname.endsWith('.css') || url.pathname.endsWith('.js')) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(c => c.put(request, clone));
          return response;
        });
      })
    );
    return;
  }

  // Network-first for everything else, fallback to cache
  event.respondWith(
    fetch(request).then(response => {
      const clone = response.clone();
      caches.open(CACHE_NAME).then(c => c.put(request, clone));
      return response;
    }).catch(() => caches.match(request).then(cached => cached || new Response('{"offline":true}', {
      headers: { 'Content-Type': 'application/json' }
    })))
  );
});

// Background sync for queued actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-claims') {
    event.waitUntil(syncPendingClaims());
  }
});

async function syncPendingClaims() {
  // In production: flush pending claims from IndexedDB to server
  console.log('[InsureFlow SW] Syncing pending claims...');
}

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'InsureFlow Alert', body: 'Check your earnings shield.' };
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/badge-72.png',
      tag: 'insureflow-alert',
      data: { url: data.url || '/' }
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});
