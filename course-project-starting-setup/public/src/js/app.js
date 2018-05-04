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
