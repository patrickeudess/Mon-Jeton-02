/*
 * Analyse financière inclusive pour revenus fixes, variables, journaliers
 * et saisonniers. Le moteur reste sans dépendance pour fonctionner hors ligne.
 */
(function () {
    'use strict';

    const STORAGE_KEY = 'income_profile';
    const PROFILE_LABELS = {
        fixe: 'Revenu fixe',
        variable: 'Revenu variable',
        journalier: 'Revenu journalier',
        saisonnier: 'Revenu saisonnier'
    };
    const ESSENTIAL_CATEGORIES = new Set([
        'Nourriture', 'Transport', 'Logement', 'Communication', 'Santé',
        'Éducation', 'Aide familiale', 'Tontine'
    ]);

    function defaultProfile() {
        return { type: 'variable', cycle: 'hebdomadaire', reserveRate: 15 };
    }

    function loadProfile() {
        try {
            return { ...defaultProfile(), ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') };
        } catch (error) {
            return defaultProfile();
        }
    }

    function saveProfile(profile) {
        const safe = {
            type: PROFILE_LABELS[profile.type] ? profile.type : 'variable',
            cycle: ['hebdomadaire', 'quinzaine', 'mensuelle'].includes(profile.cycle)
                ? profile.cycle : 'hebdomadaire',
            reserveRate: Math.max(0, Math.min(50, Number(profile.reserveRate) || 0))
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(safe));
        return safe;
    }

    function validTransactions(transactions) {
        return (transactions || []).filter(item =>
            item && ['revenu', 'depense'].includes(item.type)
            && Number.isFinite(Number(item.amount)) && Number(item.amount) >= 0
            && item.date && !Number.isNaN(new Date(item.date).getTime())
        );
    }

    function monthKey(date) {
        return new Date(date).toISOString().slice(0, 7);
    }

    function monthlyIncomes(transactions, now, months = 6) {
        const values = [];
        for (let offset = months - 1; offset >= 0; offset--) {
            const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
            const key = date.toISOString().slice(0, 7);
            values.push(transactions
                .filter(item => item.type === 'revenu' && monthKey(item.date) === key)
                .reduce((sum, item) => sum + Number(item.amount), 0));
        }
        return values;
    }

    function average(values) {
        return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
    }

    function prudentIncome(transactions, profile, now) {
        const incomes = monthlyIncomes(transactions, now, 6);
        const positive = incomes.filter(value => value > 0);
        if (!positive.length) return 0;

        if (profile.type === 'fixe') return positive[positive.length - 1];
        if (profile.type === 'journalier') {
            const since = new Date(now);
            since.setDate(since.getDate() - 28);
            const recent = transactions
                .filter(item => item.type === 'revenu' && new Date(item.date) >= since)
                .reduce((sum, item) => sum + Number(item.amount), 0);
            return (recent / 28) * 30;
        }
        if (profile.type === 'saisonnier') {
            return Math.min(...positive) * 0.8;
        }
        return average(positive.slice().sort((a, b) => a - b).slice(0, Math.min(3, positive.length)));
    }

    function cycleDivisor(cycle) {
        return cycle === 'mensuelle' ? 1 : cycle === 'quinzaine' ? 2 : 4.345;
    }

    function analyze(transactions, profile = defaultProfile(), now = new Date()) {
        const data = validTransactions(transactions);
        const income = data.filter(item => item.type === 'revenu')
            .reduce((sum, item) => sum + Number(item.amount), 0);
        const expenses = data.filter(item => item.type === 'depense')
            .reduce((sum, item) => sum + Number(item.amount), 0);
        const available = income - expenses;
        const ninetyDaysAgo = new Date(now);
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        const essential90 = data.filter(item =>
            item.type === 'depense' && new Date(item.date) >= ninetyDaysAgo
            && ESSENTIAL_CATEGORIES.has(item.category)
        ).reduce((sum, item) => sum + Number(item.amount), 0);
        const essentialDaily = essential90 / 90;
        const prudent = prudentIncome(data, profile, now);
        const reserve = prudent * ((Number(profile.reserveRate) || 0) / 100);
        const spendable = Math.max(0, prudent - reserve);

        return {
            profileType: profile.type,
            profileLabel: PROFILE_LABELS[profile.type] || PROFILE_LABELS.variable,
            available,
            prudentIncome: prudent,
            reserveRecommendation: reserve,
            cycleBudget: spendable / cycleDivisor(profile.cycle),
            cycle: profile.cycle,
            coverageDays: essentialDaily > 0 ? Math.max(0, Math.floor(available / essentialDaily)) : null,
            essentialDaily,
            needsMoreData: data.filter(item => item.type === 'revenu').length < 3
        };
    }

    function formatCycle(cycle) {
        return cycle === 'mensuelle' ? 'mois' : cycle === 'quinzaine' ? 'quinzaine' : 'semaine';
    }

    const api = { PROFILE_LABELS, defaultProfile, loadProfile, saveProfile, analyze, formatCycle };
    if (typeof window !== 'undefined') window.IncomeProfile = api;
    if (typeof module !== 'undefined') module.exports = api;
})();
