var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
var sharedMomentsArea = document.querySelector('#shared-moments');
var form = document.querySelector('form');
var titleInput = document.querySelector('#title');
var locationInput = document.querySelector('#location');
var videoPlayer = document.querySelector('#player');
var canvasElement = document.querySelector('#canvas');
var captureButton = document.querySelector('#capture-btn');
var imagePicker = document.querySelector('#image-picker');
var imagePickerArea = document.querySelector('#pick-image');

// var USER_REQUESTED_CACHE = 'user-requested';
var DATA_REQUEST_URI = 'https://pwagram-b86a4.firebaseio.com/posts.json';
var SOME_IMAGE = '/src/images/sf-boat.jpg';

function initializeMedia() {
  if (!('mediaDevices' in navigator)) {
    navigator.mediaDevices = {};
  }

  if (!('getUserMedia' in navigator.mediaDevices)) {
    navigator.mediaDevices.getUserMedia = (constraints) => {
      const getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

      if (!getUserMedia) {
        return Promise.reject(new Error('getUserMedia is not implemented'));
      }

      return new Promise((resolve, reject) => {
        getUserMedia.call(navigator, constraints, resolve, reject);
      });
    }
  }

  const constraints = {
    video: true
  };
  navigator.mediaDevices.getUserMedia(constraints)
    .then(stream => {
      videoPlayer.srcObject = stream;
      videoPlayer.style.display = 'block';
    })
    .catch(e => {
      imagePickerArea.style.display = 'block';
    });
}

captureButton.addEventListener('click', event => {
  canvasElement.style.display = 'block';
  videoPlayer.style.display = 'none';
  captureButton.style.display = 'none';
  const context = canvasElement.getContext('2d');
  context.drawImage(videoPlayer, 0, 0, canvas.width, videoPlayer.videoHeight / (videoPlayer.videoWidth / canvas.width));
  videoPlayer.srcObject.getVideoTracks().forEach(track => track.stop());
});

function openCreatePostModal() {
  setTimeout(function() {
	  createPostArea.style.transform = 'translateY(0)';
	  initializeMedia();
  }, 0);

  if (deferredPrompt) {
    deferredPrompt.prompt();

    deferredPrompt.userChoice.then(function(choiceResult) {
      console.log(choiceResult.outcome);

      if (choiceResult.outcome === 'dismissed') {
        console.log('User cancelled installation');
      } else {
        console.log('User added to home screen');
      }
    });

    deferredPrompt = null;
  }
}

function closeCreatePostModal() {
  createPostArea.style.transform = 'translateY(100vh)';
  imagePickerArea.style.display = 'none';
  videoPlayer.style.display = 'none';
  canvasElement.style.display = 'none';
}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);

/*
// User triggered caching
var onSaveButtonClick = (request) => (e) => {
  console.log('save button clicked');
  if ('caches' in window) {
    caches.open(USER_REQUESTED_CACHE)
      .then(cache => {
        cache.add(DATA_REQUEST_URI);
        cache.add(request);
      });
  }
};
*/

function clearCards() {
  while(sharedMomentsArea.hasChildNodes()) {
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild)
  }
}

var updateUI = (dataArray) => {
  clearCards();
  dataArray.forEach(item => createCard(item));
};

function createCard(data) {
  var cardWrapper = document.createElement('div');
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
  var cardTitle = document.createElement('div');
  cardTitle.className = 'mdl-card__title';
  cardTitle.style.backgroundImage = 'url("' + data.image + '")';
  cardTitle.style.backgroundSize = 'cover';
  cardTitle.style.height = '180px';
  cardWrapper.appendChild(cardTitle);
  var cardTitleTextElement = document.createElement('h2');
  cardTitleTextElement.style.color = 'white';
  cardTitleTextElement.className = 'mdl-card__title-text';
  cardTitleTextElement.textContent = data.title;
  cardTitle.appendChild(cardTitleTextElement);
  var cardSupportingText = document.createElement('div');
  cardSupportingText.className = 'mdl-card__supporting-text';
  cardSupportingText.textContent = data.location;
  cardSupportingText.style.textAlign = 'center';
/* User triggered caching example
  var cardSaveButton = document.createElement('button');
  cardSaveButton.textContent = 'Save Card';
  cardSaveButton.addEventListener('click', onSaveButtonClick(SOME_IMAGE));
  cardSupportingText.append(cardSaveButton);
*/
  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}

// Data request strategy
// Attempt to retrieve the data from the network and the cache in parallel
// Only get from the cache if it's not already received from the network

var networkDataReceived = false;
/*
if ('caches' in window) {
  caches.match(DATA_REQUEST_URI)
    .then(response => {
      if (response) {
        return response.json();
      }
    })
    .then(data => {
      console.log('from cache', data);
      if (!networkDataReceived && data) {
        const dataArray = [];
        for (var key in data) {
          dataArray.push(data[key]);
        }
        updateUI(dataArray);
      }
    });
}*/

if ('indexedDB' in window) {
  readAllData('posts')
    .then(data => {
      console.log('from cache', data);
      if (!networkDataReceived && data) {
        updateUI(data);
      }
    });
}

fetch(DATA_REQUEST_URI)
  .then(function(res) {
    return res.json();
  })
  .then(function(data) {
    console.log('from network', data);
    networkDataReceived = true;
    const dataArray = [];
    for (var key in data) {
      dataArray.push(data[key]);
    }
    updateUI(dataArray);
  });

function sendData() {
  fetch('https://us-central1-pwagram-b86a4.cloudfunctions.net/storePostData', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
        id: new Date().toISOString(),
        title: titleInput.value,
        location: locationInput.value,
        image: 'https://firebasestorage.googleapis.com/v0/b/pwagram-b86a4.appspot.com/o/sf-boat.jpg?alt=media&token=54d901a8-b818-4687-be12-5d008ffd9191'
    })
  })
    .then(res => {
      console.log('sendData', res);
      updateUI();
    })
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (titleInput.value.trim() === '' || locationInput.value.trim() === '') {
    alert('Please enter a title and location');
    return;
  }
  closeCreatePostModal();

  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.ready
      .then(sw => {
        var post = {
          title: titleInput.value,
          location: locationInput.value,
          id: new Date().toISOString()
        };
        writeData('sync-posts', post)
          .then(() => {
            return sw.sync.register('sync-new-post'); // register a sync task with the service worker
          })
          .then(() => {
            var snackbarContainer = document.querySelector('#confirmation-toast');
            var data = { message: 'Your post was submitted for syncing!'};
            snackbarContainer.MaterialSnackbar.showSnackbar(data);
          })

      });
  } else {
    sendData();
  }
});
