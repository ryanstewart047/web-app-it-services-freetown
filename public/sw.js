// Service Worker for IT Services Freetown PWA
const CACHE_NAME = 'it-services-freetown-v2.0.0';
const OFFLINE_URL = '/offline';

const ASSET_CACHE = 'assets-cache-v1';
const IMAGE_CACHE = 'image-cache-v1';

// Initial files to cache for offline functionality
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/favicon.svg',
  '/favicon.ico',
  '/apple-touch-icon.png',
  '/assets/logo.png',
  '/assets/logo.svg',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pre-caching offline assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (![CACHE_NAME, ASSET_CACHE, IMAGE_CACHE].includes(key)) {
            console.log('[ServiceWorker] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  
  // Ignore non-HTTP/HTTPS schemes (like chrome-extension://)
  if (!url.protocol.startsWith('http')) return;

  // 1. Navigation requests (Pages) - Network First, fallback to Offline
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  // 2. Static Assets (CSS, JS) - Cache First
  if (
    event.request.destination === 'style' || 
    event.request.destination === 'script' || 
    event.request.destination === 'font'
  ) {
    event.respondWith(
      caches.open(ASSET_CACHE).then((cache) => {
        return cache.match(event.request).then((response) => {
          const fetchPromise = fetch(event.request).then((networkResponse) => {
            if (networkResponse.ok) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          });
          return response || fetchPromise;
        });
      })
    );
    return;
  }

  // 3. Images - Cache First
  if (event.request.destination === 'image') {
    event.respondWith(
      caches.open(IMAGE_CACHE).then((cache) => {
        return cache.match(event.request).then((response) => {
          const fetchPromise = fetch(event.request).then((networkResponse) => {
            if (networkResponse.ok) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          });
          return response || fetchPromise;
        });
      })
    );
    return;
  }

  // 4. Everything else - Generic match
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// Push notification handling
self.addEventListener('push', (event) => {
  if (!event.data) return;
  try {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: data.icon || '/assets/logo.svg',
      badge: data.badge || '/favicon.svg',
      vibrate: [100, 50, 100],
      data: { url: data.data?.url || '/forum' }
    };
    event.waitUntil(self.registration.showNotification(data.title || 'ITS Freetown', options));
  } catch (err) {
    console.error('Push error:', err);
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/forum';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url === urlToOpen && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(urlToOpen);
    })
  );
});
