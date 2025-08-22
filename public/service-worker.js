// public/service-worker.js

// Import the Workbox library from Google's CDN
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');


workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);

// --- Caching Strategies ---

// 1. Cache CSS, JS, and Web Worker files with a "Stale While Revalidate" strategy.

workbox.routing.registerRoute(
  ({ request }) => request.destination === 'script' || request.destination === 'style' || request.destination === 'worker',
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'static-resources',
  })
);

// 2. Cache images with a "Cache First" strategy.

workbox.routing.registerRoute(
  ({ request }) => request.destination === 'image',
  new workbox.strategies.CacheFirst({
    cacheName: 'images',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
      }),
    ],
  })
);