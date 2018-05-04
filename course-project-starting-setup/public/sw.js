self.addEventListener('install', (event) => {
	console.log('[SERVICE WORKER] Installing service worker', event);
});
self.addEventListener('activate', (event) => {
	console.log('[SERVICE WORKER] Activating service worker', event);
	return self.clients.claim(); // Ensures the service workers are activated properly
});
self.addEventListener('fetch', (event) => { // http fetch
	console.log('[SERVICE WORKER] Fetching request', event);
	// Override the response from the fetch
	event.respondWith(fetch(event.request));
})
