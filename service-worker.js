// public/service-worker.js

// Import the Workbox library from Google's CDN
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');

// This line is important - it tells Workbox that it's loaded.
workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);

// --- Caching Strategies ---

// 1. Cache CSS, JS, and Web Worker files with a "Stale While Revalidate" strategy.
// This means the app will load instantly from the cache, and then check for updates in the background.
workbox.routing.registerRoute(
  ({ request }) => request.destination === 'script' || request.destination === 'style' || request.destination === 'worker',
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'static-resources',
  })
);

// 2. Cache images with a "Cache First" strategy.
// The app will look for the image in the cache first. If it's not there, it will fetch it from the network
// and save it to the cache for next time. Images will be kept for 30 days.
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