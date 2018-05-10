var CACHE_VERSION = 'v18';
var CACHE_STATIC_NAME = 'static-' + CACHE_VERSION;
var CACHE_DYNAMIC_NAME = 'dynamic-' + CACHE_VERSION;

var OFFLINE_PAGE = '/offline.html';
var DATA_REQUEST_URI = 'https://httpbin.org/get';

self.addEventListener('install', (event) => {
	console.log('[SERVICE WORKER] Installing service worker');
	// Event has a `waitUntil()` method that awaits promises
	event.waitUntil(
		caches
			.open(CACHE_STATIC_NAME) // Creates one if it doesn't exist
			.then((cache) => {
				console.log('Precaching App Shell');
				cache.addAll([
					'/',
					'/index.html',
					OFFLINE_PAGE,
					'/src/js/app.js',
					'/src/js/feed.js',
					'/src/js/material.min.js',
					'/src/css/app.css',
					'/src/css/feed.css',
					'/src/images/main-image.jpg',
					'https://fonts.googleapis.com/css?family=Roboto:400,700',
					'https://fonts.googleapis.com/icon?family=Material+Icons',
					'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
				]);
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
		response = caches.open(CACHE_DYNAMIC_NAME)
      .then(cache => {
        return fetch(event.request)
          .then(response => {
            cache.put(event.request, response.clone());
            return response;
          });
      });
	} else {
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
              return caches.open(CACHE_STATIC_NAME)
                .then(cache => {
                  return cache.match(OFFLINE_PAGE);
                });
            });
        }
      });
	}

	event.respondWith(response);
});
