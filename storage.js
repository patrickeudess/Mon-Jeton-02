/*
 * storage.js — Espace de données par utilisateur (Mon Jeton)
 *
 * Chaque utilisateur connecté dispose de son propre espace : ses transactions,
 * budgets, objectifs, tontines, épargne, badges, etc. ne sont jamais visibles
 * par un autre compte utilisé sur le même navigateur.
 *
 * Fonctionnement : on enveloppe localStorage pour préfixer de façon
 * transparente les clés de DONNÉES par l'identité de l'utilisateur courant
 * (`mj:<email>:<clé>`). Les clés d'IDENTITÉ et de préférences d'appareil
 * (jeton, e-mail, thème…) restent partagées.
 *
 * Rétro-compatibilité : en mode invité (personne de connecté), les clés
 * restent globales comme avant — aucune donnée existante n'est perdue. À la
 * première connexion, les données locales héritées sont adoptées dans
 * l'espace de l'utilisateur, puis retirées du niveau global pour éviter
 * qu'un autre compte ne les récupère.
 *
 * IMPORTANT : ce script doit être chargé AVANT tout autre script de la page.
 */
(function () {
    'use strict';

    if (window.__MON_JETON_STORAGE__) return;
    window.__MON_JETON_STORAGE__ = true;

    const proto = Storage.prototype;
    const rawGet = proto.getItem;
    const rawSet = proto.setItem;
    const rawRemove = proto.removeItem;
    const rawClear = proto.clear;
    const rawKey = proto.key;

    // Clés qui restent PARTAGÉES (identité, session, préférences d'appareil).
    const GLOBAL_KEYS = new Set([
        'auth_token', 'user_email', 'user_name', 'user_phone', 'login_provider',
        'api_base_url', 'selected-theme', 'last_login_date'
    ]);

    // Clés de session à effacer lors d'un reset complet de l'espace courant.
    const SESSION_KEYS = ['auth_token', 'user_email', 'user_name', 'user_phone', 'login_provider'];

    function rawGetItem(key) { return rawGet.call(localStorage, key); }

    // Identifiant de l'espace de l'utilisateur courant (null = invité).
    function spaceId() {
        const email = (rawGetItem('user_email') || '').trim().toLowerCase();
        if (email) return email;
        const phone = (rawGetItem('user_phone') || '').trim();
        if (phone) return phone;
        return null;
    }

    // Une clé déjà préfixée ou globale n'est pas cloisonnée.
    function isGlobal(key) {
        return GLOBAL_KEYS.has(key) || String(key).startsWith('mj:');
    }

    function nsKey(key) {
        const id = spaceId();
        return id ? ('mj:' + id + ':' + key) : key;
    }

    // --- Enveloppe transparente de localStorage ---

    proto.getItem = function (key) {
        if (this === localStorage && !isGlobal(key)) return rawGet.call(this, nsKey(key));
        return rawGet.call(this, key);
    };

    proto.setItem = function (key, value) {
        if (this === localStorage && !isGlobal(key)) return rawSet.call(this, nsKey(key), value);
        return rawSet.call(this, key, value);
    };

    proto.removeItem = function (key) {
        if (this === localStorage && !isGlobal(key)) return rawRemove.call(this, nsKey(key));
        return rawRemove.call(this, key);
    };

    // clear() : n'efface que l'espace de l'utilisateur courant (ses données +
    // sa session), jamais les autres comptes ni les préférences d'appareil.
    proto.clear = function () {
        if (this !== localStorage) return rawClear.call(this);
        const id = spaceId();
        const prefix = id ? ('mj:' + id + ':') : null;
        const toRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const k = rawKey.call(localStorage, i);
            if (!k) continue;
            if (prefix) {
                if (k.startsWith(prefix)) toRemove.push(k);
            } else if (!isGlobal(k)) {
                toRemove.push(k); // invité : données locales non partagées
            }
        }
        toRemove.forEach(k => rawRemove.call(localStorage, k));
        SESSION_KEYS.forEach(k => rawRemove.call(localStorage, k));
    };

    // --- Adoption unique des données héritées (niveau global → espace user) ---

    const ADOPTABLE = [
        'transactions', 'budgets', 'goals', 'objectifs_epargne', 'savings',
        'savings_transactions', 'tontines', 'tontine_sync_queue', 'badges',
        'challenges', 'achievements', 'epargnes_regulieres', 'security_pin_hash',
        'security_pin', 'security_settings', 'mobileMoneyTransactions',
        'mobileMoneyAccounts', 'educationProgress', 'onboarding_completed',
        'appSettings', 'enhancements-config', 'assistant_conversation'
    ];

    function adoptLegacyDataIfEmpty() {
        if (rawGetItem('mj:__legacy_migrated')) return;
        const id = spaceId();
        if (!id) return; // on attend qu'un utilisateur soit connecté
        ADOPTABLE.forEach(key => {
            const legacy = rawGetItem(key);
            if (legacy == null) return;
            const nsk = 'mj:' + id + ':' + key;
            if (rawGetItem(nsk) == null) rawSet.call(localStorage, nsk, legacy);
            rawRemove.call(localStorage, key); // retire la donnée globale héritée
        });
        rawSet.call(localStorage, 'mj:__legacy_migrated', new Date().toISOString());
    }

    adoptLegacyDataIfEmpty();

    // API publique (facultative) pour le débogage / les scripts.
    window.MonJetonSpace = {
        current: spaceId,
        isGuest: function () { return spaceId() === null; },
        adoptLegacyDataIfEmpty: adoptLegacyDataIfEmpty
    };
})();
