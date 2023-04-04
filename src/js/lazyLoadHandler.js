function lazyLoadHandler(cached = false) {
    if (!window.location.toString().includes("squad")) {
        return
    }

    console.log('lazy loader');
    console.log(cached);

    // if (!cached) {
        console.log('NOT CACHED -> WITH TIMEOUT');
        setTimeout(() => {


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


        }, 1000);
    // } else {

        // console.log(' CACHED -> SHOULD ALREADY BE VISIBLE?');

        // const lazyImages = document.querySelectorAll('img[loading="lazy"]');

        // lazyImages.forEach((img) => {
        //     setStyling(img);
        // });
    // }

}

function setStyling(img) {
    img.classList.remove('hidden');
    const parentEl = img.closest('picture');
    parentEl.classList.add('loaded');

}

if (window.location.toString().includes("squad")) {
    console.log('squad page');
    lazyLoadHandler();
}