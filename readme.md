# Progressive Web Apps

- Progressively enhanced web applications designed to look and feel like native apps
	- Offline access
	- Home screen icon
	- Camera
	- Location
	- Background syncing
	- Push notifications

- Still works on older browser
	- Checking features before calling them

- Should have following characteristics
	- Quick initial load
	- Functions while offline
	- Similar to native experience

## Core Building Blocks

### Service Workers

- Javascript running in a background process
- Running even if closed
- Allows caching and offline support
- Background Sync
- Web push notifications

### Application Manifest

- Allows addition to home screen

### Responsive Design

- Reformats to different devices

### Geolocation API

- GPS integration

### Media API

- Device camera and microphone


## Course Outline

### Application Manifest

- https://developer.mozilla.org/en-US/docs/Web/Manifest
- Provides data to the browser, can be used to install on a device
- Define the homescreen icon
- named `manifest.json`
- Include a link to the manifest in every html page
- <link rel="manifest" href="/manifest.json">
- Properties:
	- name - Used as the "long name" of the device
	- short_name - Used as the short name
	- start_url - page to load on startup
	- scope - which pages are included in PWA experience, i.e. which pages are configured by this manifest
	- display - e.g. "standalne": dont see browser controls
	- background_color - loading/splash screen (hex color)
	- theme_color - top bar in task switcher, etc
	- description - For browser, etc
	- dir - text direction default ltr
	- lang - default en-US
	- orientation - default orientation, can be enforced
	- icons - array of icons for homescreen etc
		- src - Icon path
		- type - file type
		- sizes - actually a single size in pixel resolution
			- 48x48 to 512x512
	- related applications - array of native applications suggestions
		- e.g.
			```JSON
			"related_applications": {
				"platform": "play",
				"url": "https://play.google.com/store/apps/details?id=com.example.app1",
				"id": "com.example.app1"
			}
			```

##### Example

```json
{
	"name": "Instagram Clone as a Progressive Web App (PWA)",
	"short_name": "PWAGram",
  	"icons": [
	  { "src": "/src/images/icons/app-icon-48x48.png", "type": "image/png", "sizes": "48x48"},
	  { "src": "/src/images/icons/app-icon-96x96.png", "type": "image/png", "sizes": "96x96"},
	  { "src": "/src/images/icons/app-icon-144x144.png", "type": "image/png", "sizes": "144x144"},
	  { "src": "/src/images/icons/app-icon-192x192.png", "type": "image/png", "sizes": "192x192"},
	  { "src": "/src/images/icons/app-icon-256x256.png", "type": "image/png", "sizes": "256x256"},
	  { "src": "/src/images/icons/app-icon-384x384.png", "type": "image/png", "sizes": "384x384"},
	  { "src": "/src/images/icons/app-icon-512x512.png", "type": "image/png", "sizes": "512x512"}
	],
  "start_url": "/index.html",
  "scope": ".",
  "display": "standalone",
  "orientation": "portrait-primary",
  "background_color": "#fff",
  "theme_color": "#3f51b5",
  "description": "A simple Instagram clone implementing PWA features",
  "dir": "ltr",
  "lang": "en-US"
}
```
- View manifest data in the "Application" tab of dev tools
- NOTE: Safari/webkit/old IE does not support application manifests. Must use a combination of link/meta tags to provide PWA config
```html
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-set-status-bar-style" content="black">
  <meta name="apple-mobile-web-app-title" content="PWAGram">
  <link rel="apple-touch-icon" href="/src/images/icons/apple-icon-57x57.png" sizes="57x57">
  <link rel="apple-touch-icon" href="/src/images/icons/apple-icon-60x60.png" sizes="60x60">
  <link rel="apple-touch-icon" href="/src/images/icons/apple-icon-72x72.png" sizes="72x72">
  <link rel="apple-touch-icon" href="/src/images/icons/apple-icon-114x114.png" sizes="114x114">
  <link rel="apple-touch-icon" href="/src/images/icons/apple-icon-120x120.png" sizes="120x120">
  <link rel="apple-touch-icon" href="/src/images/icons/apple-icon-144x144.png" sizes="144x144">
  <link rel="apple-touch-icon" href="/src/images/icons/apple-icon-152x152.png" sizes="152x152">
  <link rel="apple-touch-icon" href="/src/images/icons/apple-icon-180x180.png" sizes="180x180">

  <meta name="msapplication-TileImage" content="/src/images/icons/app-icon-144x144.png">
  <meta name="msapplication-TileColor" content="#fff">

  <meta name="theme-color" content="#3f51b5">
```

### Service Worker Basics

- Run on a separate thread than the web page
- Run in background
- Have a scope within a given domain
- Continue to run after pages have been closed
- Listen for events emitted by different sources
	- fetch
		- Triggered by http requests (image, css)
		- Not AJAX/axios
		- Can use to return cached files, block, etc
	- push notification
		- Sent from a server
		- Web Push Notification
		- Since service worker is running in background, can respond to push even if browser is not open
	- notification interaction
		- Respond to interactions with the notifications
	- background sync
		- If an action cannot be performed (due to network), it can be saved and processed later
		- Browser emits an event that the service worker can respond to, re-processing the saved action
	- lifecycle events
		- Service worker phase changes (installation, etc)

#### Service Worker Lifecycle

- A js app loaded by the browser registers a js module as a service worker
- Installing the SW emits an `install` event
	- when the installation is done, emits an `activate` event
- Service worker now controls all pages of `scope`
- For existing SWs, the registration process happens on every page load
	- The SW is only re-installed if the module has changed since the last install
- Enters Idle mode
- Terminated
	- Re-awaken if one of the events are detected

#### Non-Lifecycle Events

- e.g. fetch

### Setting up Debugging

Connect to android device from chrome devtools:
1. Enable "developer mode" by clicking on the Android build number 7 times
2. In developer options, make sure debug options are selected
3. Connect the device
4. In chrome dev tools, open the menu and go to "more tools -> remote devices"
5. In settings, check the "Port forwarding" option and add the port for the local app
6. Select the device on the left
7. In the "new tab" field, enter the url
8. It should open the page on the device
9. Click "Inspect" for the page
10. It should open a new developer tools window with remote debug access to the device. Touches, etc will be mirrored between the device and the inspect window

### Web App Install Banners

- In a remote debugging session, go to the "Application" tab in dev tools
- In the "Manifest" section, click the "Add to homescreen link"
- See?!?
- Cancel it
	- Sometimes you want to defer the "Add to homescreen" option until later
- Register an event listener to the app

```javascript
window.addEventListener('beforeinstallprompt', (event) => {
	console.log('beforeinstallprompt fired', event);
	event.preventDefault();
});
```

### Promise & Fetch API

Promises are the thing. Promises and stuff.

#### Fetch

- Sends HTTP requests
- `fetch('http://httpbin.org/ip').then(res => console.log(res));`

```javascript
fetch('http://httpbin.org/ip')
.then(res => {
	console.log(res);
	return res.json(); // Converts the response (stream) into json
})
.then(responseData => console.log(responseData));

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
```
### Service Worker Caching (Offline Access)

#### Providing offline support

- Use cases
	- Poor/no connection - bad service areas, tunnels, elevator, poor wifi
	- Network congestion in highly-populated areas

#### Cache API

- Server cache is reliant on network connection
- Browser cache is managed by browser, so you can't specify assets, etc
- Cache API also lives in the browser, but is managed by the developer
- Simple key-value store
- Key: request, Value: response
- Accessed from service workers and JS on web pages
- Service worker can load assets to fill the cache in the background
- Service worker can use fetch to try for network assets, then fall back to cache

#### Implementing Caching

- Determine what the application shell consists of. Any static assets such as markup, images, stylesheets, js, etc
- Set up precaching in the `install` event
- Listen for the `fetch` event and try to retrieve the item from the cache, then fallback to fetch if it isn't cached
- Invalidate the cache in the `activate` event. Iterate over the cache keys and delete
any of the keys that are not the current key
	- Update the cache key name any time you update an asset that is stored in the cache key
- Set up dynamic caching by using the `fetch` event. If the item does not exist in the cache,
we are falling back to fetch. After fetch gets the response, add a `then()` and store it in the cache


### Advanced Caching Strategies

#### Caching triggered by user action
- Turn off dynamic cache temporarily by commenting out the `cache.put` call in the service worker 'fetch' event listener
- Create a "Save for Offline" type button on some element that is not part of the app shell
    - Like an item in a list
    - This is what we'll save for offline view
- Clear cache (by updating version) and reload
- See the app? The dynamic caching is turned off, so the element is being loaded every time
- Add a listener to the button
- In the listener, check for `('caches' in window)`
- If so, open a new cache (e.g. 'user_requested_cache' or some such) and save (cache.add) it there

#### Offline fallback page
- Create a new file in the main directory, offline.html
- In the service worker `fetch` listener, we are looking for requests in cache, then falling back to `fetch`
- If fetch fails, in the `catch` block, we can return the offline.html file
- `.catch(e => caches.open('static-cache').then(cache => cache.match('/offline.html')));`

### Caching Dynamic Data with IndexedDB

- IndexedDB is designed for key-value (json) data
- Instead of caching the whole HTTP response, it's for the response data
- Can store data like blobs
- Can be accessed asynchronously
- Typically one db per app
- Can have multiple object store (collection)
- use npm package idb @jakearchibald

### Responsive Design

##### Media Queries

##### Image Responsiveness

#### Animations

### Background Sync

- Store requests in indexedDB when offline till you're online
- `sync` event emitted on service worker when network availability
- Service worker can retrieve the data and send on sync event

https://firebase.google.com/docs/functions/write-firebase-functions

### Web Push Notifications

- Show up even when app/browser are closed
- Increase engagement
- Workflow:
    - User enables notification
    - Display notifications
    - Trigger from js
    - Subscription based
    - Per device subscription
    - Pushed from external server from the browser
    - Creating the subscription retrieves the API endpoint to the browser vendor push server
    - Our backend server calls the API endpoint to push subscription

#### Web Push Notification

1. Create a key pair using the `web-push` npm lib
2. The app sends then public key in the app when using the pushManager to subscribe (using the browser vendor)
3. After the subscription, send the subscription to the server for saving
4. When a push-worthy event happens, the server iterates over the saved subscriptions, using web-push to send them

#### Resources

https://developers.google.com/web/updates/2016/07/web-push-interop-wins

https://github.com/web-push-libs/web-push

https://developer.mozilla.org/en/docs/Web/API/notification

https://developer.mozilla.org/en/docs/Web/API/Push_API



### Media API and Geolocation

### Automated Service Worker Management
