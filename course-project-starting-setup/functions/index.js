const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

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
        response.status(201).json({ message: 'Data stored', id: request.body.id });
        return;
      })
      .catch((err) => {
        response.status(500).json({ error: err });
        return;
      });
  });
});
