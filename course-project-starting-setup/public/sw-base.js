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
workbox.precaching.precacheAndRoute([], {});


// Listen for sync event
// sync is emitted when network connectivity is reestablished
// if network connectivity is consistent, it's emitted as soon as the task is registered
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] background sync', event);
  if (event.tag === 'sync-new-post') {
    console.log('[Service Worker] syncing new post');
    event.waitUntil(
      readAllData('sync-posts')
        .then(data => {
          for (const dt of data) {
            const postData = new FormData();
            postData.append('id', dt.id);
            postData.append('title', dt.title);
            postData.append('location', dt.location);
            postData.append('rawLocationLat', (dt.rawLocation) ? dt.rawLocation.lat : '');
            postData.append('rawLocationLng', (dt.rawLocation) ? dt.rawLocation.lng : '');
            postData.append('file', dt.picture, dt.id + '.png');
            fetch('https://us-central1-pwagram-b86a4.cloudfunctions.net/storePostData', {
              method: 'POST',
              body: postData
            })
              .then(res => {
                console.log('[Service Worker] sync-new-post', res);
                if (res.ok) {
                  res.json().then(resData => {
                    deleteItemFromData('sync-posts', resData.id)
                  });
                }
              })
              .catch(e => console.log('[Service Worker] error syncing: ', e));
          }
        })
    )
  }
});

self.addEventListener('notificationclick', event => {
  const notification = event.notification;
  const action = event.action;
  console.log('notificationclick', event);
  if (action === 'confirm') {
    console.log('confirm was chosen');
  } else {
    console.log('not confirmed');
    event.waitUntil(
      clients.matchAll() // Get all clients managed by this sw
        .then(clients => {
          const client = clients.find(c => (c.visibilityState === 'visible'));
          if (client) {
            client.navigate(notification.data.url);
            client.focus();
          } else {
            clients.openWindow(notification.data.url);
          }
        })
    )
  }
  notification.close();
});

self.addEventListener('notificationclose', event => {
  console.log('notification closed', event);
});

self.addEventListener('push', event => {
  console.log('push notification received', event);
  const data = (event.data) ? JSON.parse(event.data.text()) : {
    title: 'OHAI!',
    content: 'supdawg',
    openUrl: '/'
  };
  const options = {
    body: data.content,
    icon: '/src/images/icons/app-icon-96x96.png',
    badge: '/src/images/icons/app-icon-96x96.png',
    data: {
      url: data.openUrl
    }
  };
  event.waitUntil(
    self.registration // The registration is what we need to access to interact with the browser
      .showNotification(data.title, options)
  );
});
