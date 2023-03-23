// check window url

(function() {

    window.addEventListener('load', (e) => {
        const url = window.location.pathname;
        
        fetch(url)
        .then(res => res.text())
        .then(html => {
            console.log('fetched');
            // console.log(html);
            // document.querySelector('[data-widget-teamlist]').innerHTML = html
        })

    });

}())