import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

function loadModule() {
    const storage = new Map();
    const context = {
        localStorage: {
            getItem: key => storage.get(key) || null,
            setItem: (key, value) => storage.set(key, String(value))
        },
        window: {},
        Set
    };
    vm.createContext(context);
    vm.runInContext(readFileSync(new URL('../income-profile.js', import.meta.url), 'utf8'), context);
    return context.window.IncomeProfile;
}

const I = loadModule();
const tx = (type, amount, date, category = 'Divers') => ({ type, amount, date, category });

test('le revenu variable prudent utilise les mois les plus faibles', () => {
    const transactions = [
        tx('revenu', 300000, '2026-02-10'), tx('revenu', 100000, '2026-03-10'),
        tx('revenu', 200000, '2026-04-10'), tx('revenu', 500000, '2026-05-10'),
        tx('revenu', 150000, '2026-06-10'), tx('revenu', 400000, '2026-07-10')
    ];
    const result = I.analyze(transactions, { type: 'variable', cycle: 'hebdomadaire', reserveRate: 10 }, new Date('2026-07-17'));
    assert.equal(result.prudentIncome, 150000);
    assert.ok(Math.abs(result.cycleBudget - (135000 / 4.345)) < 1);
});

test('le profil journalier extrapole les 28 derniers jours', () => {
    const transactions = [tx('revenu', 28000, '2026-07-10')];
    const result = I.analyze(transactions, { type: 'journalier', cycle: 'hebdomadaire', reserveRate: 0 }, new Date('2026-07-17'));
    assert.equal(result.prudentIncome, 30000);
});

test('les jours couverts reposent sur les dépenses essentielles', () => {
    const transactions = [
        tx('revenu', 100000, '2026-07-01'),
        tx('depense', 9000, '2026-07-05', 'Nourriture'),
        tx('depense', 1000, '2026-07-06', 'Loisirs')
    ];
    const result = I.analyze(transactions, I.defaultProfile(), new Date('2026-07-17'));
    assert.equal(result.available, 90000);
    assert.equal(result.coverageDays, 900);
});

test('le profil sauvegardé est validé et borné', () => {
    const saved = I.saveProfile({ type: 'inconnu', cycle: 'autre', reserveRate: 99 });
    assert.equal(saved.type, 'variable');
    assert.equal(saved.cycle, 'hebdomadaire');
    assert.equal(saved.reserveRate, 50);
});
