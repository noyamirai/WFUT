import { getPageContent, onLinkNavigate } from './utils.js';

onLinkNavigate(async ({ toPath, fromPath }) => {
  let content;
  let loaderShown = false;

  const cache = await caches.open('other-cache');
  const cachedResponse = await cache.match(toPath);
  let loaderType = 'main';

  if (!cachedResponse) {

    if (toPath.includes('team-details') && fromPath.includes('team-details')) {
      loaderType = 'widget';
    }

    loaderShown = true;
    showLoader(loaderType);
  }

  console.log('initiating fetch');
  content = await getPageContent(toPath);

  console.log('cached content: ', cachedResponse);

  if (loaderShown) {

    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");

    if (loaderType == 'widget') {
      const loaderEl = doc.querySelector('.loader--widget');
      const parentEl = loaderEl.closest('.widget');
      const widgetContent = parentEl.querySelector('[data-widget-content]');

      widgetContent.classList.add('hide');

    } else {
      const bodyEl = doc.querySelector('body');
      bodyEl.classList.add('loading');
    }

    content = doc.body.innerHTML;
  }

  startViewTransition(async () => {

    document.body.innerHTML = content; 

    if (loaderShown) {
      hideLoader(loaderType);
    }

    lazyLoadHandler(cachedResponse);

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

function showLoader(type = 'main') {
  const loaderElement = document.querySelector(`.loader--${ type }`);

  if (type == 'widget') {
    const parentEl = loaderElement.closest('.widget');
    const widgetContent = parentEl.querySelector('[data-widget-content]');
  
    widgetContent.classList.add('hide');
  } else {
      const bodyEl = document.querySelector('body');
      bodyEl.classList.add('loading');
  }

  if (loaderElement && loaderElement.className.includes('hide')) {
    loaderElement.classList.remove('hide');
  }

}

function hideLoader(type = 'main') {
  // Remove the loader element
  const loaderElement = document.querySelector(`.loader--${ type }`);

  if (type == 'widget') {
    const parentEl = loaderElement.closest('.widget');
    const widgetContent = parentEl.querySelector('[data-widget-content]');
  
    widgetContent.classList.remove('hide');
  } else {
    const bodyEl = document.querySelector('body');
    bodyEl.classList.remove('loading');
  }

  if (loaderElement && !loaderElement.className.includes('hide')) {
    loaderElement.classList.add('hide');
  }
}