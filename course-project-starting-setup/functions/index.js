const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

// https://firebase.google.com/docs/functions/write-firebase-functions


exports.storePostData = functions.https.onRequest((request, response) => {
	// Send headers for the CORS
	cors((request, response) => {
		admin.database().ref('posts').push({
			id: request.body.id || '',
			title: request.body.title || '',
			location: request.body.location || '',
			image: request.body.image || ''
		})
		.then(() => {
			response.status(201).json({ message: 'Data saved', id: request.body.id })
		})
		.catch(error => {
			response.status(500).json({ error })
		})
	})
});
