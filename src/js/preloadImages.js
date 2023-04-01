async function getModifiedHtmlAfterLoad(doc, allPlayerImageElements) {

    console.log('PRELOADING');

    // Extract the URLs from the src attributes
    const srcUrls = Array.from(allPlayerImageElements).map((el) => el.getAttribute("data-src"));

    try {
        const images = await preloadImages(srcUrls)
        console.log(`All images preloaded successfully:`, images);

        images.forEach((image, i) => {
            allPlayerImageElements[i].src = image.url;
        });

        const modifiedHtmlString = doc.body.innerHTML;
        return modifiedHtmlString;
    } catch (error) {
        allPlayerImageElements.forEach((imageEl, i) => {
            imageEl.src = srcUrls[i];
        });

        return doc.body.innerHTML;
    }
   
}

document.addEventListener('DOMContentLoaded', async function() {
    if (window.location.pathname.includes('team-details') && window.location.pathname.includes('squad')) {
        console.log('INITIAL LOAD ON SQUAD PAGE');
        
        const cache = await caches.open('other-cache');
        const cachedResponse = await cache.match(window.location.pathname);

        if (!cachedResponse) {
            console.log('SQUAD PAGE NOT IN CACHE');
            const allPlayerImageElements = document.querySelectorAll('[data-player-image]');

            // Extract the URLs from the src attributes
            const srcUrls = Array.from(allPlayerImageElements).map((el) => el.getAttribute("data-src"));

            try {
                const images = await preloadImages(srcUrls)
                console.log(`All images preloaded successfully:`, images);

                images.forEach((image, i) => {
                    allPlayerImageElements[i].src = image.url;
                });

            } catch (error) {
                allPlayerImageElements.forEach((imageEl, i) => {
                    imageEl.src = srcUrls[i];
                });
            }
        }
       
    }
});

function preloadImages(imageUrls) {
    const promises = [];

    for (const [index, url] of imageUrls.entries()) {
        const image = new Image();
        const promise = new Promise((resolve, reject) => {
        image.onload = () => {
            resolve({ url, index });
        };
        image.onerror = () => {
            reject(`Failed to preload image ${url}`);
        };
        });

        image.src = url;
        promises.push(promise);

    }

    return Promise.all(promises);
}

