// service-worker.js
const CACHE_NAME = 'summer-camp-v1';
const urlsToCache = [
    '/',
    '/home.html',
    '/children.html',
    '/luggage.html',
    '/bank.html',
    '/contact.html',
    '/css/bootstrap.min.css',
    '/css/all.min.css',
    '/css/style.css',
    '/js/bootstrap.bundle.min.js',
    '/js/xlsx.full.min.js',
    '/js/home.js',
    '/js/contact.js',
    '/js/app.js',
    '/manifest.json',
    '/assets/icon-192x192.png',
    '/assets/icon-512x512.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});

self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});