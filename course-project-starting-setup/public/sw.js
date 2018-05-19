importScripts('/src/js/idb.js');
importScripts('/src/js/utility.js');

var CACHE_VERSION = 'v25';
var CACHE_STATIC_NAME = 'static-' + CACHE_VERSION;
var CACHE_DYNAMIC_NAME = 'dynamic-' + CACHE_VERSION;

var OFFLINE_PAGE = '/offline.html';
var DATA_REQUEST_URI = 'https://pwagram-b86a4.firebaseio.com/posts.json';
var STATIC_FILES = [
  '/',
  '/index.html',
  OFFLINE_PAGE,
  '/src/js/app.js',
  '/src/js/feed.js',
  '/src/js/idb.js',
  '/src/js/material.min.js',
  '/src/css/app.css',
  '/src/css/feed.css',
  '/src/images/main-image.jpg',
  'https://fonts.googleapis.com/css?family=Roboto:400,700',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
];

function trimCache(cacheName, maxItems) {
	caches.open(cacheName)
		.then(cache =>
			cache.keys()
				.then(keys =>
					(
						(keys.length > maxItems) ?
							cache.delete(keys[0])
								.then(trimCache(cacheName, maxItems)) : null
					)
				)
		);
}

self.addEventListener('install', (event) => {
	console.log('[SERVICE WORKER] Installing service worker');
	// Event has a `waitUntil()` method that awaits promises
	event.waitUntil(
		caches
			.open(CACHE_STATIC_NAME) // Creates one if it doesn't exist
			.then((cache) => {
				console.log('Precaching App Shell');
				cache.addAll(STATIC_FILES);
			})
	);
});
self.addEventListener('activate', (event) => {
	console.log('[SERVICE WORKER] Activating service worker');
	event.waitUntil(
		caches.keys()
			.then(keyList => {
				const deletePromises = keyList.map(key => {
					if (![CACHE_STATIC_NAME, CACHE_DYNAMIC_NAME].includes(key)) {
						return caches.delete(key);
					}
				});
				return Promise.all(deletePromises);
			})
	);
	return self.clients.claim(); // Ensures the service workers are activated properly
});

self.addEventListener('fetch', (event) => { // http fetch
  console.log('[SERVICE WORKER] Fetching request');
  let response;

  if (event.request.url.indexOf(DATA_REQUEST_URI) >= 0) { // This is the data url
		// Fetch the request, cache it and return it (Network first)
		// This supports concurrent requests to cache and fetch as done in feed.js
    response = fetch(event.request)
      .then(response => {
        // trimCache(CACHE_DYNAMIC_NAME, 3);
        // cache.put(event.request, response.clone());
        // indexedDB
        var clonedResponse = response.clone();
        clearAllData('posts')
		  .then(() => clonedResponse.json())
		  .then(data => {
			  for (var key in data) {
			  	console.log(data, key)
				  writeData('posts', data[key])
				  	// .then(() => deleteItemFromData('posts', key)); // delete a single entry
			  }
		  });
        return response;
      });
  } else if (STATIC_FILES.includes(event.request.url)) {
  	// respond with cache-only strategy
		// These files are precached, and every time they're updated, the SW will be too, so the cache will always be fresh
		response = caches.match(event.request);
	} else {
  	// Attempt to respond with the cache first. If it fails, try a fetch. If the fetch succeeds, cache the response and return it.
		// If the fetch fails, send the offline page
		response = caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        } else {
          return fetch(event.request)
            .then((res) => {
              return caches.open(CACHE_DYNAMIC_NAME)
                .then(cache => {
                  cache
                    .put(event.request.url, res.clone()) // Must use res.clone() to avoid consuming the response
                    .catch(e => console.log('Error in cache PUT request: ', e));
                  return res;
                });
            })
            .catch((e) => {
              console.log(e);
              // If a request fails, display the offline page.
              // This may require adjustment to deal with failed API (JSON) requests, for example
              // Maybe check the request url and send a offline page OR a JSON 404 message
              if (event.request.headers.get('accept').includes('text/html')) {
                return caches.open(CACHE_STATIC_NAME)
                  .then(cache => {
                    return cache.match(OFFLINE_PAGE);
                  });
							}
            });
        }
      });
	}

	event.respondWith(response);
});

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
						fetch('https://us-central1-pwagram-b86a4.cloudfunctions.net/storePostData', {
							method: 'POST',
							headers: {
								'Content-Type': 'application/json',
								'Accept': 'application/json'
							},
							body: JSON.stringify({
								id: dt.id,
								title: dt.title,
								location: dt.location,
								image: 'https://firebasestorage.googleapis.com/v0/b/pwagram-b86a4.appspot.com/o/sf-boat.jpg?alt=media&token=54d901a8-b818-4687-be12-5d008ffd9191'
							})
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
	}
  notification.close();
});

self.addEventListener('notificationclose', event => {
	console.log('notification closed', event);
});
