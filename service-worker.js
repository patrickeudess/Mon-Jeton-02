// Service Worker pour Mon Jeton
//
// Stratégie :
//  - HTML / JS / CSS : réseau d'abord, cache en secours. Les utilisateurs
//    reçoivent toujours la dernière version du code quand ils sont en ligne,
//    et la version en cache hors ligne.
//  - Autres ressources (images, polices…) : cache d'abord, réseau en secours.
const CACHE_NAME = 'mon-jeton-v3.4';

// Chemins relatifs : l'application peut être hébergée à la racine d'un
// domaine ou dans un sous-dossier (ex. GitHub Pages).
const PRECACHE_URLS = [
    './',
    './index.html',
    './transactions.html',
    './budgets.html',
    './savings.html',
    './dashboard.html',
    './tontine.html',
    './tontine.js',
    './firebase-config.js',
    './firebase-groups.js',
    './group-sync-ui.js',
    './avec.html',
    './avec.js',
    './login.html',
    './styles.css',
    './enhanced-styles.css',
    './modern-components.css',
    './theme.css',
    './app.js',
    './api-client.js',
    './auth-manager.js',
    './optimize_application.js',
    './chart.umd.js',
    './common.js',
    './income-profile.js',
    './manifest.json',
    './logo.svg',
    './icon-192.png',
    './icon-512.png'
];

// Installation : pré-cacher les ressources essentielles
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(PRECACHE_URLS))
            .then(() => self.skipWaiting())
            .catch((error) => {
                console.error('Erreur lors de l\'installation du cache:', error);
            })
    );
});

// Activation : supprimer les anciens caches et prendre le contrôle
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            ))
            .then(() => self.clients.claim())
    );
});

function isCodeRequest(request) {
    return request.mode === 'navigate'
        || request.destination === 'document'
        || request.destination === 'script'
        || request.destination === 'style';
}

async function networkFirst(request) {
    try {
        const response = await fetch(request);
        if (response && response.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        const cached = await caches.match(request);
        if (cached) {
            return cached;
        }
        if (request.mode === 'navigate' || request.destination === 'document') {
            return caches.match('./index.html');
        }
        throw error;
    }
}

async function cacheFirst(request) {
    const cached = await caches.match(request);
    if (cached) {
        return cached;
    }
    const response = await fetch(request);
    if (response && response.ok && response.type === 'basic') {
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, response.clone());
    }
    return response;
}

// Interception des requêtes
self.addEventListener('fetch', (event) => {
    // Ignorer les requêtes non-GET et les domaines externes (ex. appels API)
    if (event.request.method !== 'GET') {
        return;
    }
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    if (isCodeRequest(event.request)) {
        event.respondWith(networkFirst(event.request));
    } else {
        event.respondWith(cacheFirst(event.request));
    }
});

// Gestion des messages (mise à jour immédiate)
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Gestion des notifications push
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : 'Nouvelle notification de Mon Jeton',
        icon: './icon-192.png',
        badge: './icon-192.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Voir les détails',
                icon: './icon-192.png'
            },
            {
                action: 'close',
                title: 'Fermer',
                icon: './icon-192.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('Mon Jeton', options)
    );
});

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action !== 'close') {
        event.waitUntil(
            clients.openWindow('./index.html')
        );
    }
});
