/* AAMNHS attendance PWA service worker */
const CACHE = 'aamnhs-v3';
const OFFLINE_URL = '/offline.html';
// Keep the install payload small: the full 2000px logo is ~4 MB, while these
// icons are the ones the manifest and notifications actually need.
const PRECACHE = [
    OFFLINE_URL,
    '/manifest.webmanifest',
    '/images/icon-192.png',
    '/images/icon-512.png',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches
            .open(CACHE)
            .then((cache) => cache.addAll(PRECACHE))
            .then(() => self.skipWaiting()),
    );
});

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) =>
                Promise.all(
                    keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)),
                ),
            )
            .then(() => self.clients.claim()),
    );
});

function isCacheableAsset(url) {
    return url.pathname.startsWith('/build/') || url.pathname.startsWith('/images/');
}

self.addEventListener('fetch', (event) => {
    const request = event.request;

    if (request.method !== 'GET') {
        return;
    }

    const url = new URL(request.url);

    if (url.origin !== self.location.origin) {
        return;
    }

    // Never serve stale authenticated data from the cache for API-ish routes.
    if (url.pathname.startsWith('/push/') || url.pathname.startsWith('/health')) {
        return;
    }

    if (isCacheableAsset(url)) {
        event.respondWith(
            caches.match(request).then(
                (cached) =>
                    cached ||
                    fetch(request).then((response) => {
                        // Never cache an error page under an asset URL; a cached
                        // 404 would break the hashed chunk that replaced it.
                        if (response.ok) {
                            const copy = response.clone();
                            caches.open(CACHE).then((cache) => cache.put(request, copy));
                        }

                        return response;
                    }),
            ),
        );

        return;
    }

    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    if (response.ok) {
                        const copy = response.clone();
                        caches.open(CACHE).then((cache) => cache.put(request, copy));
                    }

                    return response;
                })
                .catch(async () => (await caches.match(request)) || caches.match(OFFLINE_URL)),
        );
    }
});

// Background Sync: wake the open tabs so they can replay the IndexedDB queue.
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-scans') {
        event.waitUntil(
            self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
                clients.forEach((client) => client.postMessage({ type: 'flush-scans' }));
            }),
        );
    }
});

self.addEventListener('push', (event) => {
    let payload = {};

    try {
        payload = event.data ? event.data.json() : {};
    } catch {
        payload = { title: 'AAMNHS', body: event.data ? event.data.text() : '' };
    }

    const title = payload.title || 'AAMNHS Attendance';
    const options = {
        body: payload.body || '',
        icon: '/images/icon-192.png',
        badge: '/images/icon-192.png',
        tag: payload.tag || 'aamnhs',
        data: { url: payload.url || '/dashboard' },
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const target = event.notification.data?.url || '/dashboard';

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
            const match = clients.find((client) => client.url.includes(target));

            if (match) {
                return match.focus();
            }

            return self.clients.openWindow(target);
        }),
    );
});
