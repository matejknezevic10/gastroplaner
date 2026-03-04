// ==========================================
// GASTRO PLANER PRO — Service Worker
// Offline-Caching + Push-Notifications
// ==========================================

const CACHE_NAME = 'gastroplaner-v1';
const OFFLINE_URL = '/offline.html';

// Dateien die immer gecacht werden sollen (App Shell)
const APP_SHELL = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/js/firebase-multi-tenancy.js',
  '/js/admin-push-notifications.js'
];

// ==========================================
// INSTALL: Cache App Shell
// ==========================================
self.addEventListener('install', (event) => {
  console.log('[SW] Install');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching App Shell');
      return cache.addAll(APP_SHELL);
    })
  );
  // Sofort aktivieren, nicht auf offene Tabs warten
  self.skipWaiting();
});

// ==========================================
// ACTIVATE: Alte Caches aufräumen
// ==========================================
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Lösche alten Cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  // Übernehme sofort die Kontrolle über offene Tabs
  self.clients.claim();
});

// ==========================================
// FETCH: Network-First mit Cache-Fallback
// ==========================================
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Nur GET-Requests cachen
  if (request.method !== 'GET') return;

  // Firebase/API-Requests NICHT cachen
  if (
    request.url.includes('firestore.googleapis.com') ||
    request.url.includes('firebase') ||
    request.url.includes('googleapis.com') ||
    request.url.includes('gstatic.com') ||
    request.url.includes('stripe.com')
  ) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Gültige Antworten in Cache speichern
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(async () => {
        // Offline: Versuche aus Cache
        const cached = await caches.match(request);
        if (cached) {
          return cached;
        }

        // Navigation-Requests → Offline-Seite
        if (request.mode === 'navigate') {
          return caches.match(OFFLINE_URL);
        }

        // Sonst leere Antwort
        return new Response('Offline', {
          status: 503,
          statusText: 'Service Unavailable'
        });
      })
  );
});

// ==========================================
// PUSH: Empfange Push-Nachrichten
// ==========================================
self.addEventListener('push', (event) => {
  console.log('[SW] Push empfangen');

  let data = {
    title: '🍽️ Gastro Planer',
    body: 'Neue Benachrichtigung',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: 'gastroplaner',
    url: '/'
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data = { ...data, ...payload };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: data.badge,
      tag: data.tag,
      data: { url: data.url },
      vibrate: [200, 100, 200],
      requireInteraction: false
    })
  );
});

// ==========================================
// NOTIFICATION CLICK: Öffne App
// ==========================================
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification geklickt');
  event.notification.close();

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Falls App schon offen → fokussieren
      for (const client of clientList) {
        if (client.url.includes('gastroplaner') && 'focus' in client) {
          return client.focus();
        }
      }
      // Sonst neues Fenster öffnen
      return clients.openWindow(url);
    })
  );
});

console.log('[SW] Service Worker geladen');
