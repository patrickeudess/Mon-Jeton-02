// Tests unitaires de la logique tontine (tontine.js)
// Exécution : node --test tests/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

// tontine.js est un script navigateur : on l'exécute dans un contexte
// isolé avec un localStorage simulé.
function loadModule() {
    const code = readFileSync(new URL('../tontine.js', import.meta.url), 'utf8');
    const storage = new Map();
    const context = {
        localStorage: {
            getItem: (key) => storage.has(key) ? storage.get(key) : null,
            setItem: (key, value) => storage.set(key, String(value)),
            removeItem: (key) => storage.delete(key)
        },
        window: {}
    };
    vm.createContext(context);
    vm.runInContext(code, context);
    return context.window.TontineModule;
}

const T = loadModule();

const rotative = {
    id: 't1',
    name: 'Tontine test',
    type: 'rotative',
    amount: 10000,
    frequency: 'hebdomadaire',
    startDate: '2026-07-01',
    target: null,
    members: [
        { id: 'm0', name: 'Moi', isMe: true },
        { id: 'm1', name: 'Awa', isMe: false },
        { id: 'm2', name: 'Karim', isMe: false }
    ],
    contributions: []
};

test('getCycleIndex hebdomadaire', () => {
    assert.equal(T.getCycleIndex(rotative, new Date('2026-07-01T12:00:00')), 0);
    assert.equal(T.getCycleIndex(rotative, new Date('2026-07-08T12:00:00')), 1);
    assert.equal(T.getCycleIndex(rotative, new Date('2026-07-17T12:00:00')), 2);
});

test('getCycleIndex mensuelle', () => {
    const mensuelle = { ...rotative, frequency: 'mensuelle', startDate: '2026-05-10' };
    assert.equal(T.getCycleIndex(mensuelle, new Date('2026-05-15T12:00:00')), 0);
    assert.equal(T.getCycleIndex(mensuelle, new Date('2026-07-17T12:00:00')), 2);
    // Avant le jour anniversaire du mois, le cycle précédent est toujours en cours
    assert.equal(T.getCycleIndex(mensuelle, new Date('2026-07-05T12:00:00')), 1);
});

test('getCycleIndex avant le démarrage', () => {
    assert.equal(T.getCycleIndex(rotative, new Date('2026-06-15T12:00:00')), -1);
});

test('getNextDueDate hebdomadaire', () => {
    const due = T.getNextDueDate(rotative, 2);
    assert.equal(due.toISOString().slice(0, 10), '2026-07-22');
});

test('getBeneficiary tourne selon le cycle (modulo)', () => {
    assert.equal(T.getBeneficiary(rotative, 0).name, 'Moi');
    assert.equal(T.getBeneficiary(rotative, 1).name, 'Awa');
    assert.equal(T.getBeneficiary(rotative, 2).name, 'Karim');
    assert.equal(T.getBeneficiary(rotative, 3).name, 'Moi');
});

test('getBeneficiary vaut null pour une épargne collective', () => {
    const collective = { ...rotative, type: 'collective' };
    assert.equal(T.getBeneficiary(collective, 0), null);
});

test('createTontine, cotisations et cumuls', () => {
    const created = T.createTontine({
        name: 'Tabaski',
        type: 'collective',
        amount: 5000,
        frequency: 'hebdomadaire',
        startDate: '2026-07-01',
        target: 150000,
        members: 'Moi\nAwa\n\n  Karim  '
    });

    assert.equal(created.members.length, 3);
    assert.equal(created.members[0].isMe, true);
    assert.equal(created.members[2].name, 'Karim');
    assert.equal(created.target, 150000);

    // Cotisation de "Moi" au cycle 0
    T.toggleContribution(created.id, 'm0', 0);
    let stored = T.loadTontines().find(t => t.id === created.id);
    assert.equal(T.getTotalCollected(stored), 5000);
    assert.equal(T.hasContributed(stored, 'm0', 0), true);
    assert.equal(T.getMyTotalContributed(stored), 5000);

    // Second appel = annulation (toggle)
    T.toggleContribution(created.id, 'm0', 0);
    stored = T.loadTontines().find(t => t.id === created.id);
    assert.equal(T.getTotalCollected(stored), 0);
});

test('createTontine sans membres crée au moins « Moi »', () => {
    const created = T.createTontine({
        name: 'Solo',
        type: 'collective',
        amount: 1000,
        frequency: 'mensuelle',
        startDate: '2026-07-01',
        target: '',
        members: '   \n  '
    });
    assert.equal(created.members.length, 1);
    assert.equal(created.members[0].name, 'Moi');
    assert.equal(created.target, null);
});

test('getTontinesSummary agrège compte, cotisations et prochaine échéance', () => {
    const now = new Date('2026-07-17T12:00:00');
    const tontines = T.loadTontines();
    const summary = T.getTontinesSummary(tontines, now);
    assert.equal(summary.count, tontines.length);
    // NB: le Date vient du contexte vm (autre realm), instanceof ne s'applique pas
    assert.ok(summary.nextDue && typeof summary.nextDue.getTime === 'function');
    assert.ok(summary.nextDue.getTime() > now.getTime());
});

test('deleteTontine supprime la tontine et son historique', () => {
    const before = T.loadTontines();
    T.deleteTontine(before[0].id);
    assert.equal(T.loadTontines().length, before.length - 1);
});
