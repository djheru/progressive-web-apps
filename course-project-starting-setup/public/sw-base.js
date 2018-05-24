importScripts("https://storage.googleapis.com/workbox-cdn/releases/3.2.0/workbox-sw.js");
importScripts('/src/js/idb.js');
importScripts('/src/js/utility.js');

const googleStaticRoutesRegex = /.*(?:googleapis|gstatic)\.com.*$/;
const googleStaticCacheName = 'google-static';
workbox.routing.registerRoute(
  googleStaticRoutesRegex,
  workbox.strategies.staleWhileRevalidate({
    cacheName: googleStaticCacheName,
    cacheExpiration: {
      maxEntries: 3,
      maxAgeSeconds: 60 * 60 * 24 * 30 // every 30 days
    }
  })
);

const firebaseStaticRoutesRegex = /.*(?:firebasestorage\.googleapis)\.com.*$/;
const firebaseStaticCacheName = 'firebase-static';
workbox.routing.registerRoute(
  firebaseStaticRoutesRegex,
  workbox.strategies.staleWhileRevalidate({ cacheName: firebaseStaticCacheName })
);

const cdnjsRoute = 'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css';
const cdnjsCacheName = 'cdnjs';
workbox.routing.registerRoute(
  cdnjsRoute,
  workbox.strategies.staleWhileRevalidate({ cacheName: cdnjsCacheName })
);

const postsRoute = 'https://pwagram-b86a4.firebaseio.com/posts.json';
const postsCacheName = 'posts';
workbox.routing.registerRoute(
  postsRoute,
  (args) => fetch(args.event.request)
    .then(response => {
      const clonedResponse = response.clone();
      clearAllData(postsCacheName)
        .then(() => clonedResponse.json())
        .then(data => {
          for (const key in data) {
            if (data.hasOwnProperty(key)) {
              writeData(postsCacheName, data[key]);
            }
          }
        });
      return response;
    })
);

workbox.precaching.suppressWarnings();
workbox.precaching.precacheAndRoute([], {});
