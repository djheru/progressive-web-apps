importScripts("https://storage.googleapis.com/workbox-cdn/releases/3.2.0/workbox-sw.js");

const googleStaticRoutesRegex = /.*(?:googleapis|gstatic)\.com.*$/;
const googleStaticRoutesCacheConfig = {
  cacheName: 'google-static'
};
workbox.routing.registerRoute(
  googleStaticRoutesRegex,
  workbox.strategies.staleWhileRevalidate(googleStaticRoutesCacheConfig)
);

workbox.precaching.suppressWarnings();
workbox.precaching.precacheAndRoute([], {});
