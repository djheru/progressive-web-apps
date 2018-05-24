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

const routeFcn = (routeData) => routeData.event.request.headers.get('accept').includes('text/html');
const dynamicCacheName = 'dynamicCache';
workbox.routing.registerRoute(
  routeFcn,
  (args) => caches.match(args.event.request)
    .then((response) => {
      if (response) {
        return response;
      } else {
        return fetch(args.event.request)
          .then((res) => {
            return caches.open(dynamicCacheName)
              .then(cache => {
                cache
                  .put(args.event.request.url, res.clone()) // Must use res.clone() to avoid consuming the response
                  .catch(e => console.log('Error in cache PUT request: ', e));
                return res;
              });
          })
          .catch((e) => {
            // If a request fails, display the offline page.
            // This may require adjustment to deal with failed API (JSON) requests, for example
            // Maybe check the request url and send a offline page OR a JSON 404 message
            return caches.match('/offline.html').then(res => res);
          });
      }
    })
);

workbox.precaching.suppressWarnings();
workbox.precaching.precacheAndRoute([
  {
    "url": "404.html",
    "revision": "0a27a4163254fc8fce870c8cc3a3f94f"
  },
  {
    "url": "favicon.ico",
    "revision": "2cab47d9e04d664d93c8d91aec59e812"
  },
  {
    "url": "index.html",
    "revision": "708488c2dd1106e5c6aa143ca1a8af3b"
  },
  {
    "url": "manifest.json",
    "revision": "c3202bdcbb7128e11a3b469742bca5a1"
  },
  {
    "url": "offline.html",
    "revision": "d1bca1a1820b243e906c9069abb56d87"
  },
  {
    "url": "src/css/app.css",
    "revision": "59d917c544c1928dd9a9e1099b0abd71"
  },
  {
    "url": "src/css/feed.css",
    "revision": "22b449aa37f8444123dc01b7a340f5a3"
  },
  {
    "url": "src/css/help.css",
    "revision": "1c6d81b27c9d423bece9869b07a7bd73"
  },
  {
    "url": "src/js/app.js",
    "revision": "e34afc8cff5b48cacf1d6d654e7af8f7"
  },
  {
    "url": "src/js/feed.js",
    "revision": "09a4d2c992d01cfb3bd2dbd49a18274b"
  },
  {
    "url": "src/js/fetch.js",
    "revision": "6b82fbb55ae19be4935964ae8c338e92"
  },
  {
    "url": "src/js/idb.js",
    "revision": "ece273ebfe24fa7cb44aa0f5c3fe0aaa"
  },
  {
    "url": "src/js/material.min.js",
    "revision": "713af0c6ce93dbbce2f00bf0a98d0541"
  },
  {
    "url": "src/js/promise.js",
    "revision": "10c2238dcd105eb23f703ee53067417f"
  },
  {
    "url": "src/js/utility.js",
    "revision": "d486b6924f8c5fc2e028cedd0cf5e874"
  },
  {
    "url": "sw-base.js",
    "revision": "690dbdb12f478a9bb53c4b6c32963e14"
  },
  {
    "url": "sw.js",
    "revision": "e3ad8f35ced16d5a1900f76a21ccb716"
  },
  {
    "url": "src/images/main-image-lg.jpg",
    "revision": "31b19bffae4ea13ca0f2178ddb639403"
  },
  {
    "url": "src/images/main-image-sm.jpg",
    "revision": "c6bb733c2f39c60e3c139f814d2d14bb"
  },
  {
    "url": "src/images/main-image.jpg",
    "revision": "5c66d091b0dc200e8e89e56c589821fb"
  },
  {
    "url": "src/images/sf-boat.jpg",
    "revision": "0f282d64b0fb306daf12050e812d6a19"
  }
], {});
