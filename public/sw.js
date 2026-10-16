// Ambrosia Service Worker (PWA & Offline Cache)
const CACHE_NAME = "ambrosia-v1";
const STATIC_ASSETS = [
  "/",
  "/dashboard",
  "/scan",
  "/water",
  "/log",
  "/swap",
  "/manifest.webmanifest",
];

// 1. Install
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        // Continue even if some routes aren't pre-cached
      });
    })
  );
  self.skipWaiting();
});

// 2. Activate
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// 3. Fetch
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Never cache API calls
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  // Network-first for HTML page navigations
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request).then((cached) => {
          return cached || caches.match("/dashboard");
        });
      })
    );
    return;
  }

  // Cache-first for static assets (scripts, styles, fonts, images)
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request).then((response) => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
      );
    })
  );
});

// 4. Notification Click: opens /water
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow("/water");
      }
    })
  );
});
