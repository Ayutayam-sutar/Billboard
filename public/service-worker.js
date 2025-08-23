// public/service-worker.js


importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');


workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);



workbox.routing.registerRoute(
  ({ request }) => request.destination === 'script' || request.destination === 'style' || request.destination === 'worker',
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'static-resources',
  })
);



workbox.routing.registerRoute(
  ({ request }) => request.destination === 'image',
  new workbox.strategies.CacheFirst({
    cacheName: 'images',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, 
      }),
    ],
  })
);