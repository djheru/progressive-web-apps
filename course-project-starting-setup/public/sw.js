self.addEventListener('install', (event) => {
	// console.log('[SERVICE WORKER] Installing service worker', event);
	// Event has a `waitUntil()` method that awaits promises
	event.waitUntil(
		caches
			.open('static') // Creates one if it doesn't exist
			.then((cache) => {
				console.log('Precaching App Shell');
				cache.addAll([
					'/',
					'/index.html',
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
	// console.log('[SERVICE WORKER] Activating service worker', event);
	return self.clients.claim(); // Ensures the service workers are activated properly
});
self.addEventListener('fetch', (event) => { // http fetch
	// console.log('[SERVICE WORKER] Fetching request', event);
	// fetch from cache if available
	event.respondWith(
		caches.match(event.request)
			.then((response) => {
				if (response) {
					return response;
				} else {
					return fetch(event.request);
				}
			})
	);
});
