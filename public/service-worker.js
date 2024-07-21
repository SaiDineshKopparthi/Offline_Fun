const CACHE_NAME = 'offline-cache-v1';
const OFFLINE_URL = '/offline.html';
const ASSETS_TO_CACHE = [
    OFFLINE_URL,
    '/animation.json',
    'https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.7.5/lottie.min.js'
];

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .catch(function(err) {
                console.error('Failed to cache assets:', err);
            })
    );
});

self.addEventListener('fetch', function(event) {
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(function() {
                return caches.open(CACHE_NAME)
                    .then(function(cache) {
                        return cache.match(OFFLINE_URL);
                    });
            })
        );
    } else {
        event.respondWith(
            caches.match(event.request)
                .then(function(response) {
                    return response || fetch(event.request);
                })
                .catch(function(err) {
                    console.error('Failed to fetch resource:', err);
                })
        );
    }
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.filter(function(cacheName) {
                    return cacheName !== CACHE_NAME;
                }).map(function(cacheName) {
                    return caches.delete(cacheName);
                })
            );
        })
    );
});
