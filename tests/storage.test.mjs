// Tests unitaires du cloisonnement par utilisateur (storage.js)
// Exécution : node --test tests/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

// Environnement navigateur simulé : une classe Storage minimale + localStorage.
function makeEnv() {
    class Storage {
        constructor() { this._m = new Map(); }
        getItem(k) { return this._m.has(k) ? this._m.get(k) : null; }
        setItem(k, v) { this._m.set(String(k), String(v)); }
        removeItem(k) { this._m.delete(String(k)); }
        clear() { this._m.clear(); }
        key(i) { return Array.from(this._m.keys())[i] ?? null; }
        get length() { return this._m.size; }
    }
    const localStorage = new Storage();
    const context = { window: {}, localStorage, Storage, Date, console };
    vm.createContext(context);
    const code = readFileSync(new URL('../storage.js', import.meta.url), 'utf8');
    vm.runInContext(code, context);
    return {
        localStorage,
        space: context.window.MonJetonSpace,
        raw: (k) => localStorage._m.get(k) ?? null
    };
}

test('mode invité : les clés restent globales (rétro-compatible)', () => {
    const { localStorage, raw } = makeEnv();
    localStorage.setItem('transactions', '[1,2]');
    assert.equal(raw('transactions'), '[1,2]'); // pas de préfixe
    assert.equal(localStorage.getItem('transactions'), '[1,2]');
});

test('deux utilisateurs ont des espaces isolés', () => {
    const { localStorage, raw } = makeEnv();

    // Utilisateur A
    localStorage.setItem('user_email', 'awa@test.ci');
    localStorage.setItem('transactions', 'DATA_A');
    assert.equal(raw('mj:awa@test.ci:transactions'), 'DATA_A');
    assert.equal(localStorage.getItem('transactions'), 'DATA_A');

    // Bascule vers l'utilisateur B : il ne voit rien de A
    localStorage.setItem('user_email', 'ben@test.ci');
    assert.equal(localStorage.getItem('transactions'), null);
    localStorage.setItem('transactions', 'DATA_B');
    assert.equal(localStorage.getItem('transactions'), 'DATA_B');
    assert.equal(raw('mj:ben@test.ci:transactions'), 'DATA_B');

    // Retour à A : ses données sont intactes
    localStorage.setItem('user_email', 'awa@test.ci');
    assert.equal(localStorage.getItem('transactions'), 'DATA_A');
});

test('l\'e-mail est normalisé (casse/espaces)', () => {
    const { localStorage } = makeEnv();
    localStorage.setItem('user_email', 'Awa@Test.CI');
    localStorage.setItem('budgets', 'B1');
    localStorage.setItem('user_email', '  awa@test.ci ');
    assert.equal(localStorage.getItem('budgets'), 'B1');
});

test('les clés d\'identité restent partagées', () => {
    const { localStorage, raw } = makeEnv();
    localStorage.setItem('user_email', 'awa@test.ci');
    localStorage.setItem('auth_token', 'tok123');
    localStorage.setItem('selected-theme', 'dark');
    assert.equal(raw('auth_token'), 'tok123'); // pas de préfixe
    assert.equal(raw('selected-theme'), 'dark');
});

test('removeItem cible le bon espace', () => {
    const { localStorage } = makeEnv();
    localStorage.setItem('user_email', 'awa@test.ci');
    localStorage.setItem('goals', 'G');
    localStorage.removeItem('goals');
    assert.equal(localStorage.getItem('goals'), null);
});

test('clear() n\'efface que l\'espace courant, pas les autres comptes', () => {
    const { localStorage, raw } = makeEnv();

    localStorage.setItem('user_email', 'awa@test.ci');
    localStorage.setItem('transactions', 'A');
    localStorage.setItem('user_email', 'ben@test.ci');
    localStorage.setItem('transactions', 'B');

    // Ben efface ses données
    localStorage.clear();
    assert.equal(localStorage.getItem('transactions'), null);
    assert.equal(raw('mj:ben@test.ci:transactions'), null);
    // La session de Ben est retirée aussi
    assert.equal(raw('user_email'), null);

    // Les données d'Awa sont préservées
    assert.equal(raw('mj:awa@test.ci:transactions'), 'A');
});

test('adoption unique des données héritées à la première connexion', () => {
    const { localStorage, space, raw } = makeEnv();

    // Données existantes en mode invité (avant la mise à jour)
    localStorage.setItem('transactions', 'LEGACY');
    assert.equal(raw('transactions'), 'LEGACY');

    // L'utilisateur se connecte puis l'adoption se déclenche
    localStorage.setItem('user_email', 'awa@test.ci');
    space.adoptLegacyDataIfEmpty();

    // La donnée est passée dans l'espace d'Awa, et retirée du global
    assert.equal(raw('mj:awa@test.ci:transactions'), 'LEGACY');
    assert.equal(raw('transactions'), null);
    assert.equal(localStorage.getItem('transactions'), 'LEGACY');

    // Un second utilisateur n'hérite de rien (migration déjà effectuée)
    localStorage.setItem('user_email', 'ben@test.ci');
    space.adoptLegacyDataIfEmpty();
    assert.equal(localStorage.getItem('transactions'), null);
});

test('MonJetonSpace expose l\'état invité / connecté', () => {
    const { localStorage, space } = makeEnv();
    assert.equal(space.isGuest(), true);
    assert.equal(space.current(), null);
    localStorage.setItem('user_email', 'awa@test.ci');
    assert.equal(space.isGuest(), false);
    assert.equal(space.current(), 'awa@test.ci');
});
