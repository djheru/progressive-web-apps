var deferredPrompt;
if (!window.Promise) {
	window.Promise = Promise;
}
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
fetch('https://swapi.co/api/people/1')
.then(res => {
	console.log(res);
	return res.json(); // Converts the response (stream) into json
})
.then(responseData => console.log(responseData));

 /*
fetch('http://httpbin.org/post', {
	method: 'POST',
	headers: {
		'Content-Type': 'application/json'
	},
	body: JSON.stringify({
		message: 'This is the message'
	})
})
.then(res => {
	console.log(res);
	return res.json(); // Converts the response (stream) into json
})
.then(responseData => console.log(responseData))
*/


window.addEventListener('beforeinstallprompt', (event) => {
	console.log('beforeinstallprompt fired', event);
	event.preventDefault();
	deferredPrompt = event;
	return false;
});
