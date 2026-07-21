/*
 * Mon Jeton — Barre de navigation basse (mobile-first)
 *
 * Objectif : offrir une navigation permanente, simple et intuitive, pensée
 * pour tous les utilisateurs — y compris ceux qui lisent peu. Chaque
 * destination associe TOUJOURS une grande icône ET un mot clair. Le bouton
 * central « Ajouter » est mis en avant car c'est l'action la plus fréquente.
 *
 * Le composant est autonome : il injecte son propre style (aligné sur les
 * variables de thème de theme.css, donc clair/sombre automatique), se place
 * en bas de l'écran, respecte les encoches iOS (safe-area) et décale le
 * contenu pour ne rien masquer.
 *
 * Il suffit d'inclure ce fichier sur une page :
 *     <script src="bottom-nav.js" defer></script>
 */
(function () {
    'use strict';

    // Ne pas afficher la barre sur l'écran de connexion.
    var path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    if (path === 'login.html' || path === '') { /* '' = racine → index */ }
    if (path === 'login.html') return;

    // Destinations principales. `match` liste les pages qui allument l'onglet.
    // Ordre pensé pour le pouce : les deux différenciateurs (épargne, tontine)
    // encadrent le bouton d'action central.
    var ITEMS = [
        {
            label: 'Accueil', href: 'index.html',
            match: ['index.html', 'dashboard.html', 'budgets.html', 'badges.html', 'security.html'],
            icon: '<path d="M4 11.5 12 4l8 7.5"/><path d="M6 10v9a1 1 0 0 0 1 1h3v-5h4v5h3a1 1 0 0 0 1-1v-9"/>'
        },
        {
            label: 'Épargne', href: 'savings.html',
            match: ['savings.html', 'goals.html'],
            icon: '<path d="M4 13a6 6 0 0 1 6-6h3a6 6 0 0 1 6 6v1a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4Z"/><path d="M16 9V7a3 3 0 0 0-3-3"/><circle cx="8.5" cy="12.5" r="1"/><path d="M6 18v2M17 18v2"/>'
        },
        {
            label: 'Ajouter', href: 'transactions.html',
            match: ['transactions.html'], primary: true,
            icon: '<path d="M12 6v12M6 12h12"/>'
        },
        {
            label: 'Tontines', href: 'tontine.html',
            match: ['tontine.html'],
            icon: '<circle cx="9" cy="8" r="3"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><path d="M16 6.2a3 3 0 0 1 0 5.6"/><path d="M17.5 19a5.5 5.5 0 0 0-3-4.9"/>'
        },
        {
            label: 'Aide', href: 'assistant.html',
            match: ['assistant.html', 'tips.html'],
            icon: '<path d="M4 5h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9l-4 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z"/><path d="M9 9h6M9 12h4"/>'
        }
    ];

    function svg(inner) {
        return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
            'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
            inner + '</svg>';
    }

    function injectStyles() {
        if (document.getElementById('mj-bottomnav-style')) return;
        var css = [
            ':root{--mj-bottomnav-h:64px;}',
            'body{padding-bottom:calc(var(--mj-bottomnav-h) + env(safe-area-inset-bottom, 0px) + 8px) !important;}',
            '.mj-bottomnav{position:fixed;left:0;right:0;bottom:0;z-index:1200;display:flex;',
            'justify-content:space-around;align-items:stretch;gap:2px;',
            'padding:6px 6px calc(6px + env(safe-area-inset-bottom, 0px));',
            'background:var(--nav-bg, rgba(255,255,255,.9));',
            '-webkit-backdrop-filter:saturate(180%) blur(16px);backdrop-filter:saturate(180%) blur(16px);',
            'border-top:1px solid var(--border-soft, rgba(0,0,0,.08));',
            'box-shadow:0 -6px 24px rgba(15,40,33,.10);}',
            '.mj-nav-item{flex:1 1 0;min-width:0;display:flex;flex-direction:column;align-items:center;',
            'justify-content:center;gap:3px;padding:6px 2px;text-decoration:none;',
            'color:var(--text-muted, #61726d);border-radius:14px;',
            'transition:color .18s ease, background .18s ease, transform .12s ease;',
            '-webkit-tap-highlight-color:transparent;}',
            '.mj-nav-item:active{transform:scale(.94);}',
            '.mj-nav-item svg{width:26px;height:26px;flex:0 0 auto;}',
            '.mj-nav-label{font-size:.72rem;font-weight:700;line-height:1;letter-spacing:-.01em;',
            'max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
            '.mj-nav-item.is-active{color:var(--primary-color, #00a082);}',
            '.mj-nav-item.is-active svg{filter:drop-shadow(0 2px 5px rgba(0,160,130,.35));}',
            /* Bouton central « Ajouter » mis en avant */
            '.mj-nav-item.mj-primary{color:#fff;}',
            '.mj-nav-item.mj-primary .mj-nav-icon{display:grid;place-items:center;width:56px;height:56px;',
            'margin-top:-22px;border-radius:50%;',
            'background:linear-gradient(135deg,var(--primary-light, #37c4a5),var(--primary-dark, #007a63));',
            'box-shadow:0 8px 20px rgba(0,122,99,.42);border:4px solid var(--card-bg, #fff);}',
            '.mj-nav-item.mj-primary svg{width:28px;height:28px;stroke-width:2.6;}',
            '.mj-nav-item.mj-primary .mj-nav-label{color:var(--primary-dark, #007a63);font-weight:800;margin-top:2px;}',
            '.mj-nav-item.mj-primary:active .mj-nav-icon{transform:scale(.92);}',
            /* Focus clavier accessible */
            '.mj-nav-item:focus-visible{outline:3px solid var(--primary-color, #00a082);outline-offset:2px;}',
            '@media (min-width:820px){.mj-bottomnav{max-width:640px;margin:0 auto;right:0;left:0;',
            'border-radius:22px 22px 0 0;}}',
            '@media (prefers-reduced-motion:reduce){.mj-nav-item,.mj-nav-item .mj-nav-icon{transition:none;}}',
            '@media print{.mj-bottomnav{display:none;}}'
        ].join('');
        var style = document.createElement('style');
        style.id = 'mj-bottomnav-style';
        style.textContent = css;
        document.head.appendChild(style);
    }

    function build() {
        if (document.querySelector('.mj-bottomnav')) return;
        injectStyles();

        var nav = document.createElement('nav');
        nav.className = 'mj-bottomnav';
        nav.setAttribute('aria-label', 'Navigation principale');

        ITEMS.forEach(function (item) {
            var a = document.createElement('a');
            a.className = 'mj-nav-item' + (item.primary ? ' mj-primary' : '');
            a.href = item.href;
            a.setAttribute('aria-label', item.label);
            if (item.match.indexOf(path) !== -1) {
                a.classList.add('is-active');
                a.setAttribute('aria-current', 'page');
            }
            a.innerHTML =
                '<span class="mj-nav-icon">' + svg(item.icon) + '</span>' +
                '<span class="mj-nav-label">' + item.label + '</span>';
            nav.appendChild(a);
        });

        document.body.appendChild(nav);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', build);
    } else {
        build();
    }
})();
