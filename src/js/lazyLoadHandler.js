function lazyLoadHandler() {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');

    lazyImages.forEach((img) => {
        img.addEventListener('load', () => {
            console.log('The image has finished loading');
            setStyling(img);
        });

      if (img.complete) {
        console.log('The image has already finished loading');
        setStyling(img);
      }
    });
}

function setStyling(img) {
    const parentEl = img.closest('picture');
    parentEl.classList.add('loaded');
}

lazyLoadHandler();