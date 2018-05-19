
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

const requestNotificationPermission = (event) => {
  Notification
    .requestPermission(result => {
      if (result !== 'granted') {
        console.log('notifications permission denied');
      } else {

      }
    });
};

if ('Notification' in window) {
  enableNotificationsButtons.forEach(button => {
    button.style.display = 'inline-block';
    button.addEventListener('click', requestNotificationPermission);
  });
}
