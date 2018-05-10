var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
var sharedMomentsArea = document.querySelector('#shared-moments');

// var USER_REQUESTED_CACHE = 'user-requested';
var DATA_REQUEST_URI = 'https://httpbin.org/get';
var SOME_IMAGE = '/src/images/sf-boat.jpg';

function openCreatePostModal() {
  createPostArea.style.display = 'block';
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
  createPostArea.style.display = 'none';
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

function createCard() {
  var cardWrapper = document.createElement('div');
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
  var cardTitle = document.createElement('div');
  cardTitle.className = 'mdl-card__title';
  cardTitle.style.backgroundImage = 'url("' + SOME_IMAGE + '")';
  cardTitle.style.backgroundSize = 'cover';
  cardTitle.style.height = '180px';
  cardWrapper.appendChild(cardTitle);
  var cardTitleTextElement = document.createElement('h2');
  cardTitleTextElement.style.color = 'white';
  cardTitleTextElement.className = 'mdl-card__title-text';
  cardTitleTextElement.textContent = 'San Francisco Trip';
  cardTitle.appendChild(cardTitleTextElement);
  var cardSupportingText = document.createElement('div');
  cardSupportingText.className = 'mdl-card__supporting-text';
  cardSupportingText.textContent = 'In San Francisco';
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

fetch(DATA_REQUEST_URI)
  .then(function(res) {
    return res.json();
  })
  .then(function(data) {
    createCard();
  });
