
var deferredPrompt;
var enableNotificationsButtons = document.querySelectorAll('.enable-notifications');

if (!window.Promise) {
  window.Promise = Promise;
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .then(function () {
      console.log('Service worker registered!');
    })
    .catch(function(err) {
      console.log(err);
    });
}

/*
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations()
    .then(registrations => {
      for (var i = 0; i < registrations.length; i++) {
        registrations[i].unregister();
      }
    });
}
*/

window.addEventListener('beforeinstallprompt', function(event) {
  console.log('beforeinstallprompt fired');
  event.preventDefault();
  deferredPrompt = event;
  return false;
});

const displayConfirmationNotification = () => {
  const options = {
    body: `You successfully subscribed to our Notification service`,
    icon: '/src/images/icons/app-icon-96x96.png',
    image: '/src/images/sf-boat.jpg',
    dir: 'ltr',
    lang: 'en-US',
    vibrate: [100, 50, 200],
    badge: '/src/images/icons/app-icon-96x96.png',
    tag: 'confirm-notification', // identifier for the notification,
    renotify: true
  };

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then(swRegistration => {
        swRegistration.showNotification('Subscribed Successfully! (From ServiceWorker)', options);
      })
  } else {
    new Notification('Subscribed Successfully!', options);
  }
};

const requestNotificationPermission = (event) => {
  Notification
    .requestPermission(result => {
      if (result !== 'granted') {
        console.log('notifications permission denied');
      } else {
        console.log('notifications permission granted');
        displayConfirmationNotification();
      }
    });
};

if ('Notification' in window) {
  enableNotificationsButtons.forEach(button => {
    button.style.display = 'inline-block';
    button.addEventListener('click', requestNotificationPermission);
  });
}
