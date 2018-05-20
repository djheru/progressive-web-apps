const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const webpush = require('web-push');
const formidable = require('formidable');
const fs = require('fs');
const UUID = require('uuid-v4');
const os = require('os');
const Busboy = require('busboy');
const path = require('path');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

const serviceAccount = require('./pwagram-firebase-key.json');

const gcconfig = {
  projectId: 'pwagram-b86a4',
  keyFilename: 'pwagram-firebase-key.json'
};

const gcs = require('@google-cloud/storage')(gcconfig);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://pwagram-b86a4.firebaseio.com/'
});

exports.storePostData = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    const uuid = UUID();

    const busboy = new Busboy({ headers: request.headers });
    // These objects will store the values (file + fields) extracted from busboy
    let upload;
    const fields = {};

    // This callback will be invoked for each file uploaded
    busboy.on('file', (fieldName, file, fileName, encoding, mimeType) => {
      console.log(
        `File [${fieldName}] filename: ${fileName}, encoding: ${encoding}, mimetype: ${mimeType}`
      );
      const filePath = path.join(os.tmpdir(), fileName);
      upload = { file: filePath, type: mimeType };
      file.pipe(fs.createWriteStream(filePath));
    });

    // This will invoked on every field detected
    busboy.on('field', (fieldName, val, fieldnameTruncated, valTruncated, encoding, mimetype) => {
      fields[fieldName] = val;
    });

    // This callback will be invoked after all uploaded files are saved.
    busboy.on('finish', () => {
      const bucket = gcs.bucket('pwagram-b86a4.appspot.com');
      bucket.upload(
        upload.file,
        {
          uploadType: 'media',
          metadata: {
            metadata: {
              contentType: upload.type,
              firebaseStorageDownloadTokens: uuid
            }
          }
        },
        (err, uploadedFile) => {
          if (!err) {
            admin
              .database()
              .ref('posts')
              .push({
                id: fields.id,
                title: fields.title,
                location: fields.location,
                rawLocation: {
                  lat: fields.rawLocationLat,
                  lng: fields.rawLocationLng
                },
                image: 'https://firebasestorage.googleapis.com/v0/b/' +
                  bucket.name +
                  '/o/' +
                  encodeURIComponent(uploadedFile.name) +
                  '?alt=media&token=' +
                  uuid
              })
              .then(() => {
                webpush.setVapidDetails(
                  'mailto:pdamra@gmail.com',
                  'BEtDTK3X4gFqvvvDL4QZKGAh8ucMC_rbiG4XgpALkq0jZEEusreGzjPmfYbMQn1crjF6WqT-0Fg1g39e9-Vmsj8',
                  'gaRijR9LtxnDLKVSXzuPgzO4ms2EPXFqcaq8RUQCi7w'
                );
                return admin
                  .database()
                  .ref('subscriptions')
                  .once('value');
              })
              .then((subscriptions) => {
                subscriptions.forEach((sub) => {
                  const pushConfig = {
                    endpoint: sub.val().endpoint,
                    keys: {
                      auth: sub.val().keys.auth,
                      p256dh: sub.val().keys.p256dh
                    }
                  };

                  webpush
                    .sendNotification(
                      pushConfig,
                      JSON.stringify({
                        title: 'New Post',
                        content: 'New Post added!',
                        openUrl: '/help'
                      })
                    )
                    .catch((err) => {
                      console.log(err);
                    });
                });
                response
                  .status(201)
                  .json({ message: 'Data stored', id: fields.id });
                return;
              })
              .catch((err) => {
                response.status(500).json({ error: err });
              });
          } else {
            console.log(err);
          }
        }
      );
    });

    // The raw bytes of the upload will be in request.rawBody.  Send it to busboy, and get
    // a callback when it's finished.
    busboy.end(request.rawBody);
    // formData.parse(request, function(err, fields, files) {
    //   fs.rename(files.file.path, '/tmp/' + files.file.name);
    //   const bucket = gcs.bucket('YOUR_PROJECT_ID.appspot.com');
    // });
  });
});
