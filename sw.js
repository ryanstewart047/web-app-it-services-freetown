// Service Worker for IT Services Freetown PWA
const CACHE_NAME = 'it-services-freetown-v1.0.0';
const OFFLINE_URL = '/index.html';

// Files to cache for offline functionality
const CACHE_FILES = [
  '/',
  '/index.html',
  '/book-appointment.html',
  '/track-repair.html',
  '/chat.html',
  '/troubleshoot.html',
  '/assets/css/output.css',
  '/assets/logo.png',
  '/assets/logo.svg',
  '/assets/favicon-52x52.png',
  '/assets/favicon-16x16.png',
  '/manifest.json',
  // Add Font Awesome for offline use
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Install event - cache files
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install');
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      console.log('[ServiceWorker] Caching app shell');
      try {
        await cache.addAll(CACHE_FILES);
      } catch (error) {
        console.error('[ServiceWorker] Cache addAll failed:', error);
        // Cache files individually to handle failures gracefully
        for (const file of CACHE_FILES) {
          try {
            await cache.add(file);
          } catch (e) {
            console.warn(`[ServiceWorker] Failed to cache ${file}:`, e);
          }
        }
      }
    })()
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate');
  event.waitUntil(
    (async () => {
      // Clean up old caches
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(async (cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
      
      // Take control of all clients
      await self.clients.claim();
    })()
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    (async () => {
      try {
        // Try to fetch from network first (network first strategy for dynamic content)
        const networkResponse = await fetch(event.request);
        
        // If successful, update cache with fresh content
        if (networkResponse.ok) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, networkResponse.clone());
        }
        
        return networkResponse;
      } catch (error) {
        // Network failed, try to serve from cache
        console.log('[ServiceWorker] Network failed, serving from cache:', event.request.url);
        
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // If requesting an HTML page and no cache available, serve offline page
        if (event.request.headers.get('accept')?.includes('text/html')) {
          const offlineResponse = await caches.match(OFFLINE_URL);
          if (offlineResponse) {
            return offlineResponse;
          }
        }
        
        // If all else fails, throw the error
        throw error;
      }
    })()
  );
});

// Handle background sync for form submissions when back online
self.addEventListener('sync', (event) => {
  if (event.tag === 'contact-form-sync') {
    event.waitUntil(syncContactForms());
  }
});

// Function to sync contact forms when back online
async function syncContactForms() {
  try {
    // Get stored form submissions from IndexedDB
    const db = await openDB();
    const forms = await getStoredForms(db);
    
    for (const formData of forms) {
      try {
        await fetch('https://formspree.io/f/mpwjnwrz', {
          method: 'POST',
          body: formData.data
        });
        
        // Remove from storage after successful submission
        await removeStoredForm(db, formData.id);
        
        // Notify client of successful sync
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'FORM_SYNC_SUCCESS',
              formId: formData.id
            });
          });
        });
      } catch (error) {
        console.error('Failed to sync form:', error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// IndexedDB helpers for offline form storage
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ITServicesDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('forms')) {
        db.createObjectStore('forms', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

function getStoredForms(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['forms'], 'readonly');
    const store = transaction.objectStore('forms');
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function removeStoredForm(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['forms'], 'readwrite');
    const store = transaction.objectStore('forms');
    const request = store.delete(id);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

// Push notification handling (for future use)
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/assets/logo.png',
    badge: '/assets/favicon-52x52.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: data.primaryKey || 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details',
        icon: '/assets/favicon-16x16.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/assets/favicon-16x16.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      self.clients.openWindow('/')
    );
  }
});

// Message handling from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
