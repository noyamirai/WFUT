class manifestController {

    constructor (data) {
        this.manifest = {
            'theme_color': data.theme_color,
            'background_color': data.background_color,
            'display': 'standalone',
            'scope': '/',
            'short_name': data.short_name,
            'name': data.manifest_name,
            'description': data.description,
            'orientation': 'portrait',
            'icons': [
                {
                    "src": "/static/icon-192x192.png",
                    "sizes": "192x192",
                    "type": "image/png"
                },
                {
                    "src": "/static/icon-256x256.png",
                    "sizes": "256x256",
                    "type": "image/png"
                },
                {
                    "src": "/static/icon-384x384.png",
                    "sizes": "384x384",
                    "type": "image/png"
                },
                {
                    "src": "/static/icon-512x512.png",
                    "sizes": "512x512",
                    "type": "image/png"
                }
            ]
        };
    }

    setStartUrl()
    {
        this.manifest.start_url = '/';
        // this.manifest.start_url = '/?launcher=true';
    }

    createManifest () {
        this.setStartUrl();
        return this.manifest;
    }
}

export default manifestController;