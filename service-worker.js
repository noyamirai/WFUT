const CORE_CACHE_VERSION = 'core-cache';
const OTHER_CACHE_VERSION = 'other-cache';
const CORE_ASSETS = [
  '/offline',
  '/static/index.css',
  '/static/football-pitch.svg',
  '/static/wfut-logo.svg',
  '/favicon.ico'
]

self.addEventListener('install', event => {
  console.log('Installing service worker')

  event.waitUntil(
    caches.open(CORE_CACHE_VERSION).then((cache) => {
      return cache.addAll(CORE_ASSETS).then(() => self.skipWaiting());
    })
  );
});

self.addEventListener('activate', event => {
  console.log('Activating service worker')
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', event => {
  console.log('Fetch event: ', event.request.url);

  event.respondWith(
    
      fetchAndCache(event.request, CORE_CACHE_VERSION)
      .catch(e => {
        return caches.open(CORE_CACHE_VERSION)
          .then(cache => cache.match('/offline'))
      })

  )
  
});

self.addEventListener('message', (event) => {
    if (event.data === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

const fetchAndCache = async (request, cacheName) => {

 try {

    const isCoreReq = isCoreGetRequest(request);
    const isHtmlReq = isHtmlGetRequest(request);
    const cacheNameToCheck = (isCoreReq ? cacheName : (isHtmlReq ? OTHER_CACHE_VERSION : cacheName));

    const cache = await caches.open(cacheNameToCheck);
    const cachedResponse = await cache.match(request);

    if (!!cachedResponse) {
      // it is cached but we want to update it so request but not await
      const responseFromNetwork = await fetch(request);

      // don't cache non-ok responses
      if (responseFromNetwork.ok && (isCoreReq || isHtmlReq)) {
        const responseClone = responseFromNetwork.clone();
        const cache = await caches.open(cacheNameToCheck);
        await cache.put(request, responseClone);
      }
      
      // return the cached response
      return cachedResponse;

    } else {
       const responseFromNetwork = await fetch(request);

        // don't cache non-ok responses
        if (responseFromNetwork.ok && (isCoreReq || isHtmlReq)) {
          const responseClone = responseFromNetwork.clone();
          const cache = await caches.open(cacheNameToCheck);
          await cache.put(request, responseClone);
        }

        console.log('omg response in service worker!!');
        return responseFromNetwork;
    }

    // if (!!cachedResponse) {
    //   console.log('cached response! ', request.url);
    //   return cachedResponse;
    // }

    // const responseFromNetwork = await fetch(request);

    // // don't cache non-ok responses
    // if (responseFromNetwork.ok && (isCoreReq || isHtmlReq)) {
    //   console.log('saving new response: ', request.url);
    //   const responseClone = responseFromNetwork.clone();
    //   caches.open(cacheNameToCheck)
    //     .then((cache) => {
    //       cache.put(request, responseClone);
    //     });
    // }

    // console.log('retrun response from network: ', request.url );
    // return responseFromNetwork;

  } catch (error) {

    const checkResponse = await caches.match(request);
    if (checkResponse) {
      return checkResponse;
    }

    const fallbackResponse = await caches.match('offline');
    if (fallbackResponse) {
      return fallbackResponse;
    }

    return new Response("Network error happened", {
      status: 408,
      headers: { "Content-Type": "text/plain" },
    });
  }
}

/**
 * Checks if a request is a GET and HTML request
 *
 * @param {Object} request        The request object
 * @returns {Boolean}            Boolean value indicating whether the request is a GET and HTML request
 */
function isHtmlGetRequest(request) {
  return request.method === 'GET' && (request.headers.get('accept') !== null && request.headers.get('accept').indexOf('text/html') > -1);
}

/**
 * Checks if a request is a core GET request
 *
 * @param {Object} request        The request object
 * @returns {Boolean}            Boolean value indicating whether the request is in the core mapping
 */
function isCoreGetRequest(request) {
  return request.method === 'GET' && CORE_ASSETS.includes(getPathName(request.url));
}

/**
 * Get a pathname from a full URL by stripping off domain
 *
 * @param {Object} requestUrl        The request object, e.g. https://www.mydomain.com/index.css
 * @returns {String}                Relative url to the domain, e.g. index.css
 */
function getPathName(requestUrl) {
  const url = new URL(requestUrl);
  return url.pathname;
}