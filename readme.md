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

#### Application Manifest

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
- NOTE: Safari/webkit does not support application manifests. Must use a combination of link/meta tags to provide PWA config
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
```

#### Service Worker Basics

#### Promise & Fetch API

#### Service Worker Caching (Offline Access)

#### Advanced Caching Strategies

#### Caching Dynamic Data with IndexedDB

#### Responsive Design

#### Background Sync

#### Web Push Notifications

#### Media API and Geolocation

#### Automated Service Worker Management
