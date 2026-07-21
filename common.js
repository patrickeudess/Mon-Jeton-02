/*
 * Utilitaires partagés Mon Jeton
 *
 * Regroupe le code commun aux pages : formatage monétaire, échappement HTML,
 * helpers de graphiques (Chart.js) et enregistrement du service worker.
 * Exposé via l'objet global `MonJeton`.
 */
(function () {
    'use strict';

    // --- Formatage ---

    function formatCurrency(amount) {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0
        }).format(amount);
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, c => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[c]));
    }

    // --- Graphiques (Chart.js) ---
    //
    // Les pages utilisaient Plotly (4,5 Mo) ; ces helpers couvrent les mêmes
    // besoins avec Chart.js (~200 Ko). Chaque conteneur ne peut porter qu'une
    // instance Chart à la fois : l'instance précédente est détruite avant un
    // nouveau rendu (indispensable pour les graphiques dans les modals).

    const chartInstances = {};

    function getChartContext(containerId, height) {
        const container = document.getElementById(containerId);
        if (!container || typeof Chart === 'undefined') return null;

        if (chartInstances[containerId]) {
            chartInstances[containerId].destroy();
            delete chartInstances[containerId];
        }

        let canvas;
        if (container.tagName === 'CANVAS') {
            canvas = container;
        } else {
            container.innerHTML = '';
            container.style.position = 'relative';
            container.style.height = (height || 300) + 'px';
            canvas = document.createElement('canvas');
            container.appendChild(canvas);
        }
        return canvas.getContext('2d');
    }

    function axisTitles(options) {
        return {
            x: {
                title: { display: !!options.xTitle, text: options.xTitle || '' }
            },
            y: {
                beginAtZero: true,
                title: { display: !!options.yTitle, text: options.yTitle || '' }
            }
        };
    }

    // datasets : [{ label, data, color }]
    function renderLineChart(containerId, labels, datasets, options = {}) {
        const ctx = getChartContext(containerId, options.height);
        if (!ctx) return null;

        chartInstances[containerId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets.map(d => ({
                    label: d.label,
                    data: d.data,
                    borderColor: d.color,
                    backgroundColor: d.color,
                    borderWidth: 3,
                    pointRadius: 4,
                    tension: 0.2,
                    fill: false
                }))
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: { display: !!options.title, text: options.title || '' },
                    legend: { display: datasets.length > 1 }
                },
                scales: axisTitles(options)
            }
        });
        return chartInstances[containerId];
    }

    // datasets : [{ label, data, color }] — barres groupées si plusieurs datasets
    function renderBarChart(containerId, labels, datasets, options = {}) {
        const ctx = getChartContext(containerId, options.height);
        if (!ctx) return null;

        chartInstances[containerId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: datasets.map(d => ({
                    label: d.label,
                    data: d.data,
                    backgroundColor: d.color,
                    borderRadius: 4
                }))
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: { display: !!options.title, text: options.title || '' },
                    legend: { display: datasets.length > 1 }
                },
                scales: axisTitles(options)
            }
        });
        return chartInstances[containerId];
    }

    function renderDoughnutChart(containerId, labels, values, colors, options = {}) {
        const ctx = getChartContext(containerId, options.height);
        if (!ctx) return null;

        chartInstances[containerId] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: colors
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '40%',
                plugins: {
                    title: { display: !!options.title, text: options.title || '' },
                    legend: { position: 'bottom' }
                }
            }
        });
        return chartInstances[containerId];
    }

    // --- Utilisateur ---

    // Transforme un identifiant brut en nom lisible et accueillant :
    //   « awa.kone@gmail.com » → « Awa Kone »,  « comptable » → « Comptable ».
    // On garde uniquement la partie avant « @ », on remplace les séparateurs
    // par des espaces et on met une majuscule au début de chaque mot.
    function formatDisplayName(raw) {
        let name = String(raw || '').trim();
        if (!name) return 'Utilisateur';
        if (name.includes('@')) name = name.split('@')[0];
        name = name.replace(/[._+-]+/g, ' ').replace(/\s+/g, ' ').trim();
        name = name.replace(/(^|\s)\p{L}/gu, (m) => m.toUpperCase());
        return name || 'Utilisateur';
    }

    function displayUserInfo(elementId = 'display-name') {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = formatDisplayName(localStorage.getItem('user_name'));
        }
    }

    // --- Service worker (PWA) ---
    // Nécessite HTTPS ou localhost ; ignoré en ouverture directe (file://).

    if ('serviceWorker' in navigator &&
        (location.protocol === 'https:' || ['localhost', '127.0.0.1'].includes(location.hostname))) {
        window.addEventListener('load', () => {
            // Une version distincte et updateViaCache évitent qu'un ancien cache
            // HTTP bloque la découverte de la mise à jour.
            navigator.serviceWorker.register('service-worker.js?v=3.6', { updateViaCache: 'none' })
                .then((registration) => {
                    const activateUpdate = (worker) => {
                        if (worker) worker.postMessage({ type: 'SKIP_WAITING' });
                    };
                    if (registration.waiting) activateUpdate(registration.waiting);
                    registration.addEventListener('updatefound', () => {
                        const worker = registration.installing;
                        if (!worker) return;
                        worker.addEventListener('statechange', () => {
                            if (worker.state === 'installed' && navigator.serviceWorker.controller) {
                                activateUpdate(worker);
                            }
                        });
                    });
                    registration.update().catch(() => {});
                })
                .catch((error) => console.error('Échec de l\'enregistrement du service worker:', error));

            // Une fois la mise à jour activée, recharger une seule fois suffit.
            // L'utilisateur reçoit la dernière version sans Ctrl+F5.
            let refreshing = false;
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                if (refreshing) return;
                refreshing = true;
                window.location.reload();
            });
        });
    }

    // --- Export global ---

    window.MonJeton = {
        formatCurrency,
        escapeHtml,
        renderLineChart,
        renderBarChart,
        renderDoughnutChart,
        displayUserInfo,
        formatDisplayName
    };
})();
