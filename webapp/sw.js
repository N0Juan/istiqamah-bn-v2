// Service Worker for IstiqamahBN PWA
const CACHE_NAME = 'istiqamah-bn-v1.0.1';
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

    // API requests - network first, fallback to cache
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Clone the response
                    const responseClone = response.clone();

                    // Cache the response
                    caches.open(API_CACHE_NAME)
                        .then((cache) => {
                            cache.put(request, responseClone);
                        });

                    return response;
                })
                .catch(() => {
                    // Network failed, try cache
                    return caches.match(request)
                        .then((cachedResponse) => {
                            if (cachedResponse) {
                                console.log('[Service Worker] Serving API from cache:', request.url);
                                return cachedResponse;
                            }
                            // No cache available
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

                // Not in cache, fetch from network
                return fetch(request)
                    .then((response) => {
                        // Don't cache non-successful responses
                        if (!response || response.status !== 200 || response.type === 'error') {
                            return response;
                        }

                        // Clone the response
                        const responseClone = response.clone();

                        // Cache it for future use
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(request, responseClone);
                            });

                        return response;
                    });
            })
            .catch(() => {
                // Both cache and network failed
                console.error('[Service Worker] Failed to fetch:', request.url);

                // Return a basic offline page for HTML requests
                if (request.headers.get('accept').includes('text/html')) {
                    return new Response(
                        '<html><body><h1>Offline</h1><p>IstiqamahBN is offline. Please check your connection.</p></body></html>',
                        { headers: { 'Content-Type': 'text/html' } }
                    );
                }
            })
    );
});

// Background sync for future prayer time notifications
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

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    console.log('[Service Worker] Notification clicked:', event.notification.tag);

    event.notification.close();

    // Focus the app window or open it
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // If app is already open, focus it
                for (let client of clientList) {
                    if ('focus' in client) {
                        return client.focus();
                    }
                }

                // Otherwise, open a new window
                if (clients.openWindow) {
                    return clients.openWindow('/');
                }
            })
    );
});
