const CACHE_NAME = 'szamlalo-cache-v1';

const FILES_TO_CACHE = [
    './',
    './index.html',
    './manifest.json',
    './ikon.png',
    './ikon_kacsinto.png'
];

/*
 * Telepítés
 */
self.addEventListener('install', event => {

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(FILES_TO_CACHE))
            .then(() => self.skipWaiting())
    );

});


/*
 * Aktiválás
 */
self.addEventListener('activate', event => {

    event.waitUntil(

        caches.keys()
            .then(keys => {

                return Promise.all(

                    keys
                        .filter(key => key !== CACHE_NAME)
                        .map(key => caches.delete(key))

                );

            })
            .then(() => self.clients.claim())

    );

});


/*
 * Hálózati kérés kezelése
 *
 * Először megpróbáljuk az aktuális fájlt letölteni,
 * hiba esetén pedig a gyorsítótárból adjuk vissza.
 */
self.addEventListener('fetch', event => {

    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(

        fetch(event.request)
            .then(response => {

                /*
                 * Friss válasz elmentése.
                 */
                const copy = response.clone();

                caches.open(CACHE_NAME)
                    .then(cache => {
                        cache.put(
                            event.request,
                            copy
                        );
                    });

                return response;

            })
            .catch(() => {

                return caches.match(
                    event.request
                );

            })

    );

});