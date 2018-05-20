const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const webpush = require('web-push');

const serviceAccount = require('./pwagram-firebase-key.json');

// https://firebase.google.com/docs/functions/write-firebase-functions
admin.initializeApp({
  databaseURL: 'https://pwagram-b86a4.firebaseio.com/',
	credential: admin.credential.cert(serviceAccount)
});

exports.storePostData = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    admin.database().ref('posts').push({
      id: request.body.id,
      title: request.body.title,
      location: request.body.location,
      image: request.body.image
    })
      .then(() => {
        webpush.setVapidDetails(
          'mailto:pdamra@gmail.com',
          'BEtDTK3X4gFqvvvDL4QZKGAh8ucMC_rbiG4XgpALkq0jZEEusreGzjPmfYbMQn1crjF6WqT-0Fg1g39e9-Vmsj8',
          'gaRijR9LtxnDLKVSXzuPgzO4ms2EPXFqcaq8RUQCi7w'
          );
        return admin.database().ref('subscriptions').once('value');
      })
      .then((subscriptions) => {
        subscriptions.forEach((subscription) => {
          console.log('Pushing subscription: ', subscription);
          const pushConfig = {
            endpoint: subscription.val().endpoint,
            keys: {
              auth: subscription.val().keys.auth,
              p256dh: subscription.val().keys.p256dh
            }
          };
          webpush.sendNotification(pushConfig, JSON.stringify({
            title: 'New Post',
            content: 'New post added!',
            openUrl: '/help'
          }))
            .catch(e => console.log('Web Push error: ', e));
        });

        response.status(201).json({ message: 'Data stored', id: request.body.id });
        return;
      })
      .catch((err) => {
      console.log(err);
        response.status(500).json({ error: err });
        return;
      });
  });
});
