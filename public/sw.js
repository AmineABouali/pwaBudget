const CACHE_NAME = "budget-pwa-v3";
const APP_SHELL = "/";
const OFFLINE_FALLBACK = "/offline.html";
const STATIC_ASSETS = [
  APP_SHELL,
  OFFLINE_FALLBACK,
  "/manifest.webmanifest",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(event.request.url);
  const isSameOrigin = requestUrl.origin === self.location.origin;
  const isNavigationRequest = event.request.mode === "navigate";

  if (!isSameOrigin) {
    return;
  }

  if (isNavigationRequest) {
    event.respondWith(handleNavigationRequest(event.request));
    return;
  }

  const isStaticAsset = STATIC_ASSETS.includes(requestUrl.pathname);

  if (isStaticAsset) {
    event.respondWith(cacheFirst(event.request));
  }
});

async function handleNavigationRequest(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const networkResponse = await fetch(request);

    if (networkResponse && networkResponse.ok) {
      await cache.put(APP_SHELL, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    const cachedShell = await cache.match(APP_SHELL);
    if (cachedShell) {
      return cachedShell;
    }

    const offlineResponse = await cache.match(OFFLINE_FALLBACK);
    if (offlineResponse) {
      return offlineResponse;
    }

    throw error;
  }
}

async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  const networkResponse = await fetch(request);
  if (networkResponse && networkResponse.ok) {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, networkResponse.clone());
  }
  return networkResponse;
}
