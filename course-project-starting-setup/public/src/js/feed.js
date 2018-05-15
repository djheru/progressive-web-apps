var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
var sharedMomentsArea = document.querySelector('#shared-moments');

// var USER_REQUESTED_CACHE = 'user-requested';
var DATA_REQUEST_URI = 'https://pwagram-b86a4.firebaseio.com/posts.json';
var SOME_IMAGE = '/src/images/sf-boat.jpg';

function openCreatePostModal() {
  setTimeout(function() {
	  createPostArea.style.transform = 'translateY(0)';
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
