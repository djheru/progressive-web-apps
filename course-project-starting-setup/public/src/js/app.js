var deferredPrompt;

// check for service worker capability
if('serviceWorker' in navigator) {
	navigator
		.serviceWorker
		.register('/sw.js', {
			// scope: '/somedir/'
		})
		.then(() => {
			console.log('registration complete');
		});

}

window.addEventListener('beforeinstallprompt', (event) => {
	console.log('beforeinstallprompt fired', event);
	event.preventDefault();
	deferredPrompt = event;
	return false;
});
