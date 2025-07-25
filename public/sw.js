// Service Worker for offline functionality and caching

const CACHE_VERSION = '2.0.0';
const CACHE_NAME = `vinahome-v${CACHE_VERSION}`;
const STATIC_CACHE_NAME = `vinahome-static-v${CACHE_VERSION}`;
const DYNAMIC_CACHE_NAME = `vinahome-dynamic-v${CACHE_VERSION}`;
const IMAGE_CACHE_NAME = `vinahome-images-v${CACHE_VERSION}`;

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/community',
  '/manifest.json',
  '/favicon.png',
  '/offline.html',
  // Add other critical assets
];

// API endpoints to cache with different strategies
const API_CACHE_PATTERNS = [
  { pattern: /^\/api\/community\/posts/, strategy: 'networkFirst', ttl: 5 * 60 * 1000 },
  { pattern: /^\/api\/cities/, strategy: 'cacheFirst', ttl: 24 * 60 * 60 * 1000 },
  { pattern: /^\/api\/apartments/, strategy: 'cacheFirst', ttl: 24 * 60 * 60 * 1000 },
  { pattern: /^\/api\/community\/posts\/\d+$/, strategy: 'networkFirst', ttl: 2 * 60 * 1000 },
];

// Image optimization patterns
const IMAGE_PATTERNS = [
  /images\.unsplash\.com/,
  /supabase\.co.*\/storage/,
  /\.(?:png|jpg|jpeg|svg|gif|webp)$/i
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');

  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      caches.open(IMAGE_CACHE_NAME), // Pre-create image cache
      caches.open(DYNAMIC_CACHE_NAME) // Pre-create dynamic cache
    ]).then(() => {
      console.log('Service Worker installed successfully');
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        const currentCaches = [STATIC_CACHE_NAME, DYNAMIC_CACHE_NAME, IMAGE_CACHE_NAME, CACHE_NAME];
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!currentCaches.includes(cacheName)) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker activated successfully');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Handle different types of requests with appropriate strategies
  if (isStaticAsset(request)) {
    // Cache first strategy for static assets
    event.respondWith(cacheFirst(request, STATIC_CACHE_NAME));
  } else if (getAPIRequestConfig(request)) {
    // API requests with configurable strategies
    const config = getAPIRequestConfig(request);
    if (config.strategy === 'networkFirst') {
      event.respondWith(networkFirstWithTTL(request, DYNAMIC_CACHE_NAME, config.ttl));
    } else {
      event.respondWith(cacheFirstWithTTL(request, DYNAMIC_CACHE_NAME, config.ttl));
    }
  } else if (isImageRequest(request)) {
    // Cache first for images with long TTL
    event.respondWith(cacheFirstWithTTL(request, IMAGE_CACHE_NAME, 7 * 24 * 60 * 60 * 1000));
  } else {
    // Network first for other requests
    event.respondWith(networkFirst(request));
  }
});

// Helper functions
function isStaticAsset(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith('/_next/static/') ||
         url.pathname.endsWith('.js') ||
         url.pathname.endsWith('.css') ||
         url.pathname === '/manifest.json' ||
         url.pathname === '/favicon.png';
}

function getAPIRequestConfig(request) {
  const url = new URL(request.url);
  return API_CACHE_PATTERNS.find(config => config.pattern.test(url.pathname));
}

function isImageRequest(request) {
  return request.destination === 'image' ||
         IMAGE_PATTERNS.some(pattern => pattern.test(request.url));
}

// Enhanced caching with TTL support
function isExpired(response) {
  if (!response) return true;

  const cachedTime = response.headers.get('sw-cached-time');
  const ttl = response.headers.get('sw-ttl');

  if (!cachedTime || !ttl) return false;

  return Date.now() - parseInt(cachedTime) > parseInt(ttl);
}

function addCacheHeaders(response, ttl) {
  const newResponse = response.clone();
  const headers = new Headers(newResponse.headers);
  headers.set('sw-cached-time', Date.now().toString());
  headers.set('sw-ttl', ttl.toString());

  return new Response(newResponse.body, {
    status: newResponse.status,
    statusText: newResponse.statusText,
    headers: headers
  });
}

// Caching strategies
async function cacheFirst(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('Cache first strategy failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirstWithCache(request, cacheName) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', error);

    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline.html') ||
             new Response('Offline', { status: 503 });
    }

    return new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request) {
  try {
    return await fetch(request);
  } catch (error) {
    // For navigation requests, try to return cached page
    if (request.mode === 'navigate') {
      const cache = await caches.open(STATIC_CACHE_NAME);
      return cache.match('/') ||
             new Response('Offline', { status: 503 });
    }

    return new Response('Offline', { status: 503 });
  }
}

// Background sync for failed requests
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Implement background sync logic here
  console.log('Background sync triggered');
}

// Push notifications (for future use)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();

    const options = {
      body: data.body,
      icon: '/favicon.png',
      badge: '/favicon.png',
      data: data.data,
      actions: data.actions || []
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action) {
    // Handle action clicks
    console.log('Notification action clicked:', event.action);
  } else {
    // Handle notification click
    event.waitUntil(
      clients.openWindow(event.notification.data?.url || '/')
    );
  }
});

// Message handling for cache updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CACHE_UPDATE') {
    // Force cache update
    event.waitUntil(updateCache());
  }
});

// Enhanced caching strategies with TTL support
async function cacheFirstWithTTL(request, cacheName, ttl) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    if (cachedResponse && !isExpired(cachedResponse)) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const responseWithHeaders = addCacheHeaders(networkResponse, ttl);
      cache.put(request, responseWithHeaders.clone());
      return responseWithHeaders;
    }

    return networkResponse;
  } catch (error) {
    console.error('Cache first with TTL strategy failed:', error);
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    return cachedResponse || new Response('Offline', { status: 503 });
  }
}

async function networkFirstWithTTL(request, cacheName, ttl) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      const responseWithHeaders = addCacheHeaders(networkResponse, ttl);
      cache.put(request, responseWithHeaders.clone());
      return responseWithHeaders;
    }

    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', error);

    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    if (cachedResponse && !isExpired(cachedResponse)) {
      return cachedResponse;
    }

    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline.html') ||
             new Response('Offline', { status: 503 });
    }

    return new Response('Offline', { status: 503 });
  }
}

async function updateCache() {
  const caches_to_clear = [DYNAMIC_CACHE_NAME, IMAGE_CACHE_NAME];

  await Promise.all(caches_to_clear.map(async (cacheName) => {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    await Promise.all(keys.map(key => cache.delete(key)));
  }));

  // Notify clients that cache has been updated
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({ type: 'CACHE_UPDATED' });
  });
}
