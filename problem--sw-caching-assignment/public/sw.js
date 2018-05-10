var CACHE_VERSION = 'V2';
var CACHE_STATIC_NAME = 'STATIC-' + CACHE_VERSION;
var CACHE_DYNAMIC_NAME = 'DYNAMIC-' + CACHE_VERSION;

var eLog = (msg) => console.log('[SERVICE WORKER] ' + msg);

var cachedOrFetch = (event) => (response) => {
	if (response) {
		return response;
	} else {
		return fetch(event.request)
			.then(result => {
				return caches
					.open(CACHE_DYNAMIC_NAME)
					.then(cache => {
						cache.put(event.request.url, result.clone());
						return res;
					})
					.catch(e => eLog(e));
			});
	}
};

var clearCaches = (keyList) => {
	const deletePromises = keyList.map(key => {
		if (![CACHE_STATIC_NAME, CACHE_DYNAMIC_NAME].includes(key)) {
			return caches.delete(key);
		}
	});
	return Promise.all(deletePromises);
};

self.addEventListener('install', event => {
	eLog('install event');
	var cachePromise = caches
		.open(CACHE_STATIC_NAME)
		.then(cache => {
			eLog('Precaching app shell');
			cache.addAll([
				'/',
				'/index.html',
				'/src/js/main.js',
				'/src/js/material.min.js',
				'/src/css/app.css',
				'/src/css/dynamic.css',
				'/src/css/main.css',
				'https://fonts.googleapis.com/css?family=Roboto:400,700',
				'https://fonts.googleapis.com/icon?family=Material+Icons',
				'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
			])
		});
	event.waitUntil(cachePromise);
});

self.addEventListener('activate', event => {
	eLog('activate event');
	var cachesClearedPromise = caches.keys()
		.then(clearCaches)
	event.waitUntil(cachesClearedPromise);
	return self.clients.claim();
});

self.addEventListener('fetch', event => {
	eLog('fetch event');
	var cacheOrFetchData = caches
		.match(event.request)
		.then(cachedOrFetch(event));
	event.respondWith(cacheOrFetchData);
});
