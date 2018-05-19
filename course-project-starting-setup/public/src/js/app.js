
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
    renotify: true,
    action: [
      { action: 'confirm', title: 'Okay player', icon: '/src/images/icons/app-icon-96x96.png'},
      { action: 'cancel', title: 'Cancel', icon: '/src/images/icons/app-icon-96x96.png'}
    ]
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

const configureSubscription = () => {
  if ('serviceWorker' in navigator) {
    let swReg;

    navigator.serviceWorker.ready
      .then(swRegistration => {
        swReg = swRegistration;
        swRegistration.pushManager.getSubscription();
      })
      .then(subscription => {
        const vapidPublicKey = 'BEtDTK3X4gFqvvvDL4QZKGAh8ucMC_rbiG4XgpALkq0jZEEusreGzjPmfYbMQn1crjF6WqT-0Fg1g39e9-Vmsj8';
        const convertedKey = urlBase64ToUint8Array(vapidPublicKey);
        if (!subscription) {
          const options = {
            userVisibleOnly: true,
            applicationServerKey: convertedKey
          };
          return swReg.pushManager.subscribe(options); //create new subscription
        } else {
          // use/update existing sub
        }
      })
      .then(newSubscription => {
        return fetch('https://pwagram-b86a4.firebaseio.com/subscriptions.json', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(newSubscription)
        })
      })
      .then(res => {
        if (res.ok) {
          displayConfirmationNotification();
        }

      })
      .catch(e => console.log(e));
  } else {
    return;
  }
};

const requestNotificationPermission = (event) => {
  Notification
    .requestPermission(result => {
      if (result !== 'granted') {
        console.log('notifications permission denied');
      } else {
        console.log('notifications permission granted');
        // displayConfirmationNotification();
        configureSubscription();
      }
    });
};

if ('Notification' in window) {
  enableNotificationsButtons.forEach(button => {
    button.style.display = 'inline-block';
    button.addEventListener('click', requestNotificationPermission);
  });
}
