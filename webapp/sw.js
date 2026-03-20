// Service Worker for IstiqamahBN PWA
const CACHE_NAME = 'istiqamah-bn-v1.1.0';
const API_CACHE_NAME = 'istiqamah-api-v1';

const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/js/app.js',
    '/js/api.js',
    '/js/prayer-times.js',
    '/js/tasbih.js',
    '/js/quran-tracker.js',
    '/js/qadha.js',
    '/js/hadith.js',
    '/js/notifications.js',
    '/manifest.json',
    '/favicon.ico',
    'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Crimson+Pro:wght@300;400;600&family=Manrope:wght@300;400;500;600;700&display=swap'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('[Service Worker] Installation complete');
                return self.skipWaiting();
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
                            console.log('[Service Worker] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('[Service Worker] Activation complete');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip caching for push/admin API endpoints
    if (url.pathname.startsWith('/api/v1/push/')) {
        event.respondWith(fetch(request));
        return;
    }

    // API requests - network first, fallback to cache
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    const responseClone = response.clone();
                    caches.open(API_CACHE_NAME)
                        .then((cache) => {
                            cache.put(request, responseClone);
                        });
                    return response;
                })
                .catch(() => {
                    return caches.match(request)
                        .then((cachedResponse) => {
                            if (cachedResponse) {
                                console.log('[Service Worker] Serving API from cache:', request.url);
                                return cachedResponse;
                            }
                            return new Response(
                                JSON.stringify({ error: 'Offline and no cached data available' }),
                                {
                                    status: 503,
                                    headers: { 'Content-Type': 'application/json' }
                                }
                            );
                        });
                })
        );
        return;
    }

    // Static assets - cache first, fallback to network
    event.respondWith(
        caches.match(request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                return fetch(request)
                    .then((response) => {
                        if (!response || response.status !== 200 || response.type === 'error') {
                            return response;
                        }
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(request, responseClone);
                            });
                        return response;
                    });
            })
            .catch(() => {
                console.error('[Service Worker] Failed to fetch:', request.url);
                if (request.headers.get('accept').includes('text/html')) {
                    return new Response(
                        '<html><body><h1>Offline</h1><p>IstiqamahBN is offline. Please check your connection.</p></body></html>',
                        { headers: { 'Content-Type': 'text/html' } }
                    );
                }
            })
    );
});

// Background sync for prayer times
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-prayer-times') {
        event.waitUntil(
            fetch('/api/v1/prayer-times/brunei/today')
                .then(response => response.json())
                .then(data => {
                    console.log('[Service Worker] Synced prayer times:', data);
                })
                .catch(err => {
                    console.error('[Service Worker] Failed to sync prayer times:', err);
                })
        );
    }
});

// --- Web Push: receive push notifications from server ---
self.addEventListener('push', (event) => {
    console.log('[Service Worker] Push received');

    let data = { title: 'IstiqamahBN', body: 'Prayer time notification' };

    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            data.body = event.data.text();
        }
    }

    const options = {
        body: data.body,
        icon: data.icon || '/icons/icon-192.png',
        badge: data.badge || '/icons/icon-96.png',
        tag: data.tag || 'prayer-notification',
        vibrate: [200, 100, 200],
        data: data.data || { url: '/' },
        requireInteraction: !!(data.tag && data.tag.includes('end')),
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    console.log('[Service Worker] Notification clicked:', event.notification.tag);

    let urlToOpen = (event.notification.data && event.notification.data.url) || '/';

    // Validate URL — only allow same-origin relative paths
    try {
        const resolved = new URL(urlToOpen, self.location.origin);
        if (resolved.origin !== self.location.origin) {
            urlToOpen = '/';
        } else {
            urlToOpen = resolved.href;
        }
    } catch {
        urlToOpen = '/';
    }

    event.notification.close();

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                for (let client of clientList) {
                    if ('focus' in client) {
                        return client.focus();
                    }
                }
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});
