/*
 * Module Tontine — Mon Jeton
 *
 * Gestion des tontines rotatives (chaque cycle, un membre reçoit la cagnotte
 * à tour de rôle) et des épargnes collectives (cagnotte commune pour un
 * événement : Tabaski, rentrée scolaire, mariage…).
 *
 * Données stockées dans localStorage sous la clé 'tontines' :
 * {
 *   id, name, type: 'rotative'|'collective', amount, frequency,
 *   startDate: 'YYYY-MM-DD', target, members: [{id, name, isMe}],
 *   contributions: [{memberId, cycle, date, amount}], createdAt
 * }
 */

const TONTINE_TEMPLATES = {
    familiale: {
        name: 'Tontine familiale',
        type: 'rotative',
        amount: 10000,
        frequency: 'mensuelle',
        members: 'Moi\nMaman\nTante Awa\nOncle Karim'
    },
    tabaski: {
        name: 'Épargne Tabaski',
        type: 'collective',
        amount: 5000,
        frequency: 'hebdomadaire',
        target: 150000,
        members: 'Moi'
    },
    rentree: {
        name: 'Rentrée scolaire',
        type: 'collective',
        amount: 10000,
        frequency: 'mensuelle',
        target: 120000,
        members: 'Moi'
    },
    mariage: {
        name: 'Cagnotte mariage',
        type: 'collective',
        amount: 25000,
        frequency: 'mensuelle',
        target: 500000,
        members: 'Moi\nFamille\nAmis'
    }
};

// --- Stockage ---

function loadTontines() {
    try {
        return JSON.parse(localStorage.getItem('tontines') || '[]');
    } catch (e) {
        return [];
    }
}

function saveTontines(tontines) {
    localStorage.setItem('tontines', JSON.stringify(tontines));
}

// Chaque tontine possède son propre espace communautaire. Les anciennes
// tontines reçoivent automatiquement cette structure au premier usage.
function ensureCommunity(tontine) {
    if (!tontine.community || typeof tontine.community !== 'object') {
        tontine.community = {};
    }
    if (!Array.isArray(tontine.community.announcements)) tontine.community.announcements = [];
    if (!Array.isArray(tontine.community.activity)) tontine.community.activity = [];
    return tontine.community;
}

function addCommunityActivity(tontine, message) {
    const community = ensureCommunity(tontine);
    community.activity.unshift({ id: 'a_' + Date.now(), message, date: new Date().toISOString() });
    community.activity = community.activity.slice(0, 50);
}

function getCommunity(tontine) {
    return ensureCommunity(tontine);
}

function canManageMembers(tontine) {
    const me = getMyMember(tontine);
    const creatorId = tontine.createdByMemberId || (tontine.members[0] && tontine.members[0].id);
    return Boolean(me && creatorId && me.id === creatorId);
}

function addMember(tontineId, name) {
    const cleanName = String(name || '').trim().replace(/\s+/g, ' ');
    if (!cleanName) return { error: 'Le nom du membre est requis.' };
    const tontines = loadTontines();
    const tontine = tontines.find(item => item.id === tontineId);
    if (!tontine) return { error: 'Tontine introuvable.' };
    if (!canManageMembers(tontine)) return { error: 'Seul le créateur peut ajouter un membre.' };
    if (tontine.members.some(member => member.name.toLocaleLowerCase('fr-FR') === cleanName.toLocaleLowerCase('fr-FR'))) {
        return { error: 'Ce membre est déjà dans la tontine.' };
    }
    const member = { id: 'm_' + Date.now().toString(36), name: cleanName.slice(0, 80), isMe: false };
    tontine.members.push(member);
    addCommunityActivity(tontine, member.name + ' a été ajouté(e) à la tontine.');
    saveTontines(tontines);
    return { tontine, member };
}

function addAnnouncement(tontineId, author, message) {
    const text = String(message || '').trim();
    if (!text) return null;
    const tontines = loadTontines();
    const tontine = tontines.find(item => item.id === tontineId);
    if (!tontine) return null;
    const community = ensureCommunity(tontine);
    const safeAuthor = String(author || 'Membre').trim().slice(0, 80) || 'Membre';
    community.announcements.unshift({
        id: 'm_' + Date.now(), author: safeAuthor, message: text.slice(0, 500), date: new Date().toISOString()
    });
    community.announcements = community.announcements.slice(0, 50);
    addCommunityActivity(tontine, safeAuthor + ' a publié une annonce.');
    saveTontines(tontines);
    return tontine;
}

function isAvec(group) { return group && group.type === 'avec'; }

function ensureAvec(group) {
    if (!isAvec(group)) return null;
    group.avec = group.avec || {};
    group.avec.shareValue = Math.max(100, Number(group.avec.shareValue || group.amount) || 100);
    group.avec.socialFundValue = Math.max(0, Number(group.avec.socialFundValue) || 0);
    group.avec.serviceRate = Math.max(0, Math.min(100, Number(group.avec.serviceRate) || 0));
    group.avec.loanMonths = Math.max(1, Math.min(3, Number(group.avec.loanMonths) || 3));
    if (!Array.isArray(group.avec.shares)) group.avec.shares = [];
    if (!Array.isArray(group.avec.socialFund)) group.avec.socialFund = [];
    if (!Array.isArray(group.avec.loans)) group.avec.loans = [];
    return group.avec;
}

function getMemberShares(group, memberId) {
    const avec = ensureAvec(group);
    return avec ? avec.shares.filter(item => item.memberId === memberId).reduce((sum, item) => sum + item.units, 0) : 0;
}

function getAvecFund(group) {
    const avec = ensureAvec(group);
    if (!avec) return 0;
    const savings = avec.shares.reduce((sum, item) => sum + item.units * avec.shareValue, 0);
    const repaid = avec.loans.reduce((sum, loan) => sum + (loan.repayments || []).reduce((total, item) => total + item.amount, 0), 0);
    const lent = avec.loans.filter(loan => loan.status === 'approved').reduce((sum, loan) => sum + loan.amount, 0);
    return Math.max(0, savings + repaid - lent);
}

function addAvecShare(groupId, memberId, units = 1) {
    const groups = loadTontines();
    const group = groups.find(item => item.id === groupId);
    const avec = ensureAvec(group);
    const count = Math.max(1, Math.min(5, Number(units) || 1));
    const member = group && group.members.find(item => item.id === memberId);
    if (!avec || !member) return null;
    avec.shares.push({ id: 's_' + Date.now(), memberId, units: count, date: new Date().toISOString() });
    if (avec.socialFundValue) avec.socialFund.push({ id: 'sf_' + Date.now(), memberId, amount: avec.socialFundValue, date: new Date().toISOString() });
    addCommunityActivity(group, member.name + ' a enregistré ' + count + ' part(s) d’épargne.');
    saveTontines(groups);
    return group;
}

function requestAvecLoan(groupId, memberId, amount, purpose) {
    const groups = loadTontines();
    const group = groups.find(item => item.id === groupId);
    const avec = ensureAvec(group);
    const member = group && group.members.find(item => item.id === memberId);
    const value = Number(amount) || 0;
    const limit = member ? getMemberShares(group, memberId) * avec.shareValue * 3 : 0;
    if (!avec || !member || value <= 0 || value > limit) return { error: 'Le prêt doit être positif et ne pas dépasser 3 fois votre épargne.' };
    const loan = { id: 'l_' + Date.now(), memberId, amount: value, purpose: String(purpose || '').slice(0, 160), rate: avec.serviceRate, months: avec.loanMonths, status: 'requested', repayments: [], date: new Date().toISOString() };
    avec.loans.push(loan);
    addCommunityActivity(group, member.name + ' a demandé un prêt de ' + value.toLocaleString('fr-FR') + ' FCFA.');
    saveTontines(groups);
    return { group, loan };
}

function approveAvecLoan(groupId, loanId) {
    const groups = loadTontines(); const group = groups.find(item => item.id === groupId); const avec = ensureAvec(group);
    const loan = avec && avec.loans.find(item => item.id === loanId);
    if (!loan || !canManageMembers(group) || loan.status !== 'requested' || loan.amount > getAvecFund(group)) return null;
    loan.status = 'approved'; loan.approvedAt = new Date().toISOString();
    const borrower = group.members.find(item => item.id === loan.memberId);
    addCommunityActivity(group, 'Prêt de ' + loan.amount.toLocaleString('fr-FR') + ' FCFA approuvé pour ' + (borrower ? borrower.name : 'un membre') + '.');
    saveTontines(groups); return group;
}

// --- Calculs de cycles ---

const MS_PER_WEEK = 7 * 24 * 3600 * 1000;

function parseDate(dateString) {
    return new Date(dateString + 'T00:00:00');
}

// Index du cycle en cours (0 = premier cycle). -1 si la tontine n'a pas commencé.
function getCycleIndex(tontine, now = new Date()) {
    const start = parseDate(tontine.startDate);
    if (now < start) return -1;

    if (tontine.frequency === 'hebdomadaire') {
        return Math.floor((now - start) / MS_PER_WEEK);
    }
    let months = (now.getFullYear() - start.getFullYear()) * 12
        + (now.getMonth() - start.getMonth());
    if (now.getDate() < start.getDate()) months -= 1;
    return Math.max(0, months);
}

// Date de fin du cycle en cours = prochaine échéance de cotisation.
function getNextDueDate(tontine, cycleIndex) {
    const start = parseDate(tontine.startDate);
    if (tontine.frequency === 'hebdomadaire') {
        return new Date(start.getTime() + (cycleIndex + 1) * MS_PER_WEEK);
    }
    const due = new Date(start);
    due.setMonth(due.getMonth() + cycleIndex + 1);
    return due;
}

// Bénéficiaire du tour (tontine rotative uniquement).
function getBeneficiary(tontine, cycleIndex) {
    if (tontine.type !== 'rotative' || tontine.members.length === 0) return null;
    return tontine.members[cycleIndex % tontine.members.length];
}

function getContributionsForCycle(tontine, cycleIndex) {
    return tontine.contributions.filter(c => c.cycle === cycleIndex);
}

function hasContributed(tontine, memberId, cycleIndex) {
    return tontine.contributions.some(c => c.memberId === memberId && c.cycle === cycleIndex);
}

function getTotalCollected(tontine) {
    return tontine.contributions.reduce((sum, c) => sum + c.amount, 0);
}

function getMyMember(tontine) {
    return tontine.members.find(m => m.isMe) || tontine.members[0] || null;
}

function getMyTotalContributed(tontine) {
    const me = getMyMember(tontine);
    if (!me) return 0;
    return tontine.contributions
        .filter(c => c.memberId === me.id)
        .reduce((sum, c) => sum + c.amount, 0);
}

// --- Actions ---

function generateTontineId() {
    return 'tontine_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function createTontine(data) {
    const memberNames = data.members
        .split('\n')
        .map(name => name.trim())
        .filter(name => name.length > 0);

    if (memberNames.length === 0) {
        memberNames.push('Moi');
    }

    const tontine = {
        id: generateTontineId(),
        name: data.name,
        type: data.type,
        amount: Number(data.amount),
        frequency: data.frequency,
        startDate: data.startDate,
        target: data.type === 'collective' && data.target ? Number(data.target) : null,
        avec: data.type === 'avec' ? { shareValue: Number(data.amount), socialFundValue: Number(data.socialFund) || 0, serviceRate: Number(data.serviceRate) || 0, loanMonths: Number(data.loanMonths) || 3, shares: [], socialFund: [], loans: [] } : null,
        members: memberNames.map((name, index) => ({
            id: 'm' + index,
            name: name,
            isMe: index === 0
        })),
        contributions: [],
        community: {
            announcements: [],
            activity: [{ id: 'a_' + Date.now(), message: 'Tontine créée. Les membres peuvent suivre les actions ici.', date: new Date().toISOString() }]
        },
        createdAt: new Date().toISOString()
    };

    const tontines = loadTontines();
    tontines.push(tontine);
    saveTontines(tontines);
    return tontine;
}

function loadTransactions() {
    try {
        return JSON.parse(localStorage.getItem('transactions') || '[]');
    } catch (e) {
        return [];
    }
}

function saveTransactions(transactions) {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

function linkedTransactionId(tontineId, kind, cycleIndex, memberId = '') {
    return ['tontine', tontineId, kind, cycleIndex, memberId].filter(Boolean).join(':');
}

function syncContributionTransaction(tontine, member, cycleIndex, contributed) {
    if (!member || !member.isMe) return;
    const id = linkedTransactionId(tontine.id, 'cotisation', cycleIndex, member.id);
    let transactions = loadTransactions().filter(t => t.id !== id);
    if (contributed) {
        const contribution = tontine.contributions.find(
            c => c.memberId === member.id && c.cycle === cycleIndex
        );
        transactions.push({
            id,
            type: 'depense',
            amount: tontine.amount,
            category: 'Tontine',
            date: (contribution ? contribution.date : new Date().toISOString()).slice(0, 10),
            description: `Cotisation - ${tontine.name} (cycle ${cycleIndex + 1})`,
            paymentMethod: 'autre',
            createdAt: new Date().toISOString(),
            source: 'tontine',
            tontineId: tontine.id,
            tontineCycle: cycleIndex,
            tontineKind: 'cotisation'
        });
    }
    saveTransactions(transactions);
}

function hasRecordedPayout(tontineId, cycleIndex) {
    const id = linkedTransactionId(tontineId, 'cagnotte', cycleIndex);
    return loadTransactions().some(t => t.id === id);
}

function togglePayoutTransaction(tontineId, cycleIndex) {
    const tontine = loadTontines().find(t => t.id === tontineId);
    if (!tontine || tontine.type !== 'rotative') return null;
    const beneficiary = getBeneficiary(tontine, cycleIndex);
    if (!beneficiary || !beneficiary.isMe) return null;

    const id = linkedTransactionId(tontine.id, 'cagnotte', cycleIndex);
    let transactions = loadTransactions();
    const existing = transactions.findIndex(t => t.id === id);
    if (existing >= 0) {
        transactions.splice(existing, 1);
    } else {
        transactions.push({
            id,
            type: 'revenu',
            amount: tontine.amount * tontine.members.length,
            category: 'Tontine',
            date: new Date().toISOString().slice(0, 10),
            description: `Cagnotte reçue - ${tontine.name} (cycle ${cycleIndex + 1})`,
            paymentMethod: 'autre',
            createdAt: new Date().toISOString(),
            source: 'tontine',
            tontineId: tontine.id,
            tontineCycle: cycleIndex,
            tontineKind: 'cagnotte'
        });
    }
    saveTransactions(transactions);
    addCommunityActivity(tontine, existing >= 0
        ? 'La cagnotte du cycle ' + (cycleIndex + 1) + ' a été annulée.'
        : beneficiary.name + ' a été marqué comme bénéficiaire du cycle ' + (cycleIndex + 1) + '.');
    saveTontines(loadTontines().map(item => item.id === tontine.id ? tontine : item));
    return existing < 0;
}

function deleteTontine(tontineId) {
    const tontines = loadTontines().filter(t => t.id !== tontineId);
    saveTontines(tontines);
    saveTransactions(loadTransactions().filter(t => t.tontineId !== tontineId));
}

// Enregistre ou annule la cotisation d'un membre pour un cycle donné.
function toggleContribution(tontineId, memberId, cycleIndex) {
    const tontines = loadTontines();
    const tontine = tontines.find(t => t.id === tontineId);
    if (!tontine) return null;

    const existing = tontine.contributions.findIndex(
        c => c.memberId === memberId && c.cycle === cycleIndex
    );

    const member = tontine.members.find(m => m.id === memberId);
    let contributed;
    if (existing >= 0) {
        tontine.contributions.splice(existing, 1);
        contributed = false;
    } else {
        tontine.contributions.push({
            memberId: memberId,
            cycle: cycleIndex,
            date: new Date().toISOString(),
            amount: tontine.amount
        });
        contributed = true;
    }

    if (member) {
        addCommunityActivity(tontine, member.name + (contributed ? ' a été marqué comme ayant cotisé.' : ' a été remis en attente de cotisation.'));
    }

    saveTontines(tontines);
    syncContributionTransaction(tontine, member, cycleIndex, contributed);
    return tontine;
}

function setContributionReminder(tontineId, enabled, daysBefore = 2) {
    const tontines = loadTontines();
    const tontine = tontines.find(t => t.id === tontineId);
    if (!tontine) return null;
    tontine.reminder = {
        enabled: Boolean(enabled),
        daysBefore: Math.max(0, Math.min(30, Number(daysBefore) || 0))
    };
    saveTontines(tontines);
    return tontine.reminder;
}

function getPendingContributionReminders(tontines, now = new Date()) {
    const reminders = [];
    tontines.forEach(tontine => {
        if (!tontine.reminder || !tontine.reminder.enabled) return;
        const cycle = getCycleIndex(tontine, now);
        const me = getMyMember(tontine);
        if (cycle < 0 || !me || hasContributed(tontine, me.id, cycle)) return;

        const due = getNextDueDate(tontine, cycle);
        const daysUntilDue = Math.ceil((due.getTime() - now.getTime()) / (24 * 3600 * 1000));
        if (daysUntilDue < 0 || daysUntilDue > tontine.reminder.daysBefore) return;

        reminders.push({
            id: `${tontine.id}:${cycle}`,
            tontineId: tontine.id,
            cycle,
            title: `Cotisation bientôt due - ${tontine.name}`,
            body: `${tontine.amount.toLocaleString('fr-FR')} FCFA à verser avant le ${due.toLocaleDateString('fr-FR')}`,
            dueDate: due
        });
    });
    return reminders;
}

function toApiPayload(tontine) {
    return {
        client_id: tontine.id,
        name: tontine.name,
        type: tontine.type,
        amount: tontine.amount,
        frequency: tontine.frequency,
        start_date: new Date(tontine.startDate + 'T00:00:00').toISOString(),
        target: tontine.target,
        reminder_enabled: Boolean(tontine.reminder && tontine.reminder.enabled),
        reminder_days_before: tontine.reminder ? tontine.reminder.daysBefore : 2,
        created_at: tontine.createdAt,
        members: tontine.members.map((member, position) => ({
            client_id: member.id,
            name: member.name,
            is_me: member.isMe,
            position
        })),
        createdByMemberId: 'm0',
        contributions: tontine.contributions.map(item => ({
            member_client_id: item.memberId,
            cycle: item.cycle,
            amount: item.amount,
            date: item.date
        }))
    };
}

function fromApiTontine(item) {
    return {
        id: item.client_id,
        name: item.name,
        type: item.type,
        amount: item.amount,
        frequency: item.frequency,
        startDate: item.start_date.slice(0, 10),
        target: item.target,
        reminder: {
            enabled: item.reminder_enabled,
            daysBefore: item.reminder_days_before
        },
        members: item.members
            .slice()
            .sort((a, b) => a.position - b.position)
            .map(member => ({ id: member.client_id, name: member.name, isMe: member.is_me })),
        contributions: item.contributions.map(contribution => ({
            memberId: contribution.member_client_id,
            cycle: contribution.cycle,
            amount: contribution.amount,
            date: contribution.date
        })),
        createdAt: item.created_at
    };
}

// --- Résumé global (cartes du haut de page) ---

function getTontinesSummary(tontines, now = new Date()) {
    let totalContributed = 0;
    let nextDue = null;
    let nextDueTontine = null;

    tontines.forEach(tontine => {
        totalContributed += getMyTotalContributed(tontine);

        const cycle = getCycleIndex(tontine, now);
        const due = cycle >= 0
            ? getNextDueDate(tontine, cycle)
            : parseDate(tontine.startDate);
        if (!nextDue || due < nextDue) {
            nextDue = due;
            nextDueTontine = tontine;
        }
    });

    return {
        count: tontines.length,
        totalContributed: totalContributed,
        nextDue: nextDue,
        nextDueTontine: nextDueTontine
    };
}

// Export pour les tests et la page
if (typeof window !== 'undefined') {
    window.TontineModule = {
        TONTINE_TEMPLATES,
        loadTontines,
        saveTontines,
        getCycleIndex,
        getNextDueDate,
        getBeneficiary,
        getContributionsForCycle,
        hasContributed,
        getTotalCollected,
        getMyMember,
        getMyTotalContributed,
        createTontine,
        deleteTontine,
        toggleContribution,
        loadTransactions,
        hasRecordedPayout,
        togglePayoutTransaction,
        setContributionReminder,
        getCommunity,
        canManageMembers,
        addMember,
        isAvec,
        ensureAvec,
        getMemberShares,
        getAvecFund,
        addAvecShare,
        requestAvecLoan,
        approveAvecLoan,
        addAnnouncement,
        getPendingContributionReminders,
        toApiPayload,
        fromApiTontine,
        getTontinesSummary
    };
}
