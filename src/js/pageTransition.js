import { getPageContent, onLinkNavigate } from '/scripts/utils.js';

onLinkNavigate(async ({ toPath }) => {
  console.log('ONLINKNAV');

  let content;
  let preloadImages = false;

  const cache = await caches.open('other-cache');
  const cachedResponse = await cache.match(toPath);

  if (!cachedResponse) {
    showLoader();
  }

  console.log(cachedResponse);

  if (!cachedResponse && toPath.includes('team-details') && toPath.includes('squad')) {
    preloadImages = true;
  }

  content = await getPageContent(toPath);

  startViewTransition(async () => {

    // const parser = new DOMParser();
    // const doc = parser.parseFromString(content, "text/html");
    // const allPlayerImageElements = doc.querySelectorAll('[data-player-image]');
    
    // console.log('preload img: ', preloadImages);

    // if (preloadImages && allPlayerImageElements.length > 0) {
    //   content = await getModifiedHtmlAfterLoad(doc, allPlayerImageElements, toPath);
    //   console.log('SET IMAGE CONTENT');
    // }
    
    hideLoader();
    document.body.innerHTML = content; 

  });
});


// A little helper function like this is really handy
// to handle progressive enhancement.
function startViewTransition(callback) {
  if (!document.startViewTransition) {
    callback();
    return;
  }
  
  document.startViewTransition(callback);
}

function showLoader() {
  // Create and show the loader element
  const loaderElement = document.createElement('div');
  loaderElement.innerText = 'Loading...';
  loaderElement.style.position = 'fixed';
  loaderElement.style.top = 0;
  loaderElement.style.left = 0;
  loaderElement.style.width = '100%';
  loaderElement.style.height = '100%';
  loaderElement.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  loaderElement.style.color = '#fff';
  loaderElement.style.display = 'flex';
  loaderElement.style.justifyContent = 'center';
  loaderElement.style.alignItems = 'center';
  loaderElement.style.zIndex = '1000';
  loaderElement.className = "loader";

  document.body.appendChild(loaderElement);
}

function hideLoader() {
  // Remove the loader element
  const loaderElement = document.querySelector('.loader');
  if (loaderElement) {
    loaderElement.remove();
  }
}