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
var picture;
var locationBtn = document.querySelector('#location-btn');
var locationLoader = document.querySelector('#location-loader');
var fetchedLocation;
var geocodingKey = 'AIzaSyDUiPrn4W5pMBMhtlOqLDefcC885evsTL4';

// var USER_REQUESTED_CACHE = 'user-requested';
var DATA_REQUEST_URI = 'https://pwagram-b86a4.firebaseio.com/posts.json';
var SOME_IMAGE = '/src/images/sf-boat.jpg';

function getLocationText(lat, lng) {
  const url = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + lat + ',' + lng + '&key=' + geocodingKey;
  return fetch(url)
    .then(res => res.json())
    .then(data => {
      console.log('data: ', data);
      if (data && data.results && data.results.length) {
        const results = data.results;
        let result = results.find(res => (res.types.includes('neighborhood') && res.types.includes('political')));
        if (!result) {
          result = results.find(res => (res.types.includes('locality') && res.types.includes('political')));
        }
        if (!result) {
          result = results.find(res => (res.types.includes('postal_code')));
        }
        if (!result) {
          result = results.find(res => (res.types.includes('administrative_area_level_2') && res.types.includes('political')));
        }
        return (result && result.formatted_address) ? result.formatted_address : '[' + lng + ',' + lat + ']';
      } else {
        return '[' + lng + ',' + lat + ']';
      }
    })
    .catch(e => {
      console.log(e);
      return '[' + lng + ',' + lat + ']';
    });
}

locationBtn.addEventListener('click', event => {
  let sawAlert = false;
  locationBtn.style.display = 'none';
  locationLoader.style.display = 'block';
  navigator.geolocation.getCurrentPosition(position => {
    locationBtn.style.display = 'inline';
    locationLoader.style.display = 'none';
    fetchedLocation = { latitude: position.coords.latitude, longitude: position.coords.longitude };
    locationInput.value = '[' + fetchedLocation.longitude + ', ' + fetchedLocation.latitude + ']';
    getLocationText(fetchedLocation.latitude, fetchedLocation.longitude)
      .then((locationString) => {
        locationInput.value = locationString;
      });
    document.querySelector('#manual-location').classList.add('is-focused');
  }, error => {
    console.log(error);
    locationBtn.style.display = 'inline';
    locationLoader.style.display = 'none';
    if (!sawAlert) {
      sawAlert = true;
      alert('Unable to fetch location, please enter manually');
    }

    fetchedLocation = { latitude: null, longitude: null };
  }, {
      timeout: 10000
  });
});

function initializeLocation() {
  if (!('geolocation' in navigator)) {
    locationBtn.style.display = 'none';
  }
}

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
  picture = dataURIToBlob(canvasElement.toDataURL());
});

imagePicker.addEventListener('change', event => {
  picture = event.target.files[0];
});

function openCreatePostModal() {
  setTimeout(function() {
	  createPostArea.style.transform = 'translateY(0)';
  }, 0);
  initializeMedia();
  initializeLocation();

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
  locationBtn.style.display = 'inline';
  captureButton.style.display = 'inline';
  locationLoader.style.display = 'none';
  if (videoPlayer.srcObject) {
    videoPlayer.srcObject.getVideoTracks().forEach(track => track.stop());
  }
  setTimeout(() => {
    createPostArea.style.transform = 'translateY(100vh)';
  }, 10);
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
  cardTitle.style.width = '320px';
  cardTitle.style.height = '240px';
  cardTitle.style.margin = 'auto';
  cardTitle.style.marginTop = '20px';
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
  const postData = new FormData();
  const id = new Date().toISOString();
  const lat = (fetchedLocation) ? fetchedLocation.latitude : '';
  const lng = (fetchedLocation) ? fetchedLocation.longitude : '';
  postData.append('id', id);
  postData.append('title', titleInput.value);
  postData.append('location', locationInput.value);
  postData.append('rawLocationLat', lat);
  postData.append('rawLocationLng', lng);
  postData.append('file', picture, id + '.png');
  fetch('https://us-central1-pwagram-b86a4.cloudfunctions.net/storePostData', {
    method: 'POST',
    body: postData
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
          id: new Date().toISOString(),
          picture: picture,
          rawLocation: fetchedLocation
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
