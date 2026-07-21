/* Synchronisation des groupes Tontine et AVEC avec Cloud Firestore.
 * Les données personnelles (transactions, budgets) restent uniquement sur
 * l'appareil : seuls les groupes partagés sont envoyés dans Firestore.
 */
(function () {
  'use strict';
  const state = { user: null, groupsUnsubscribe: null, requestsUnsubscribe: null, muted: false, pending: [] };
  const code = () => Math.random().toString(36).slice(2, 8).toUpperCase();
  const clean = value => String(value || '').trim();
  const emit = (name, detail) => window.dispatchEvent(new CustomEvent(name, { detail }));

  function configured() { return Boolean(window.firebase && window.MON_JETON_FIREBASE_CONFIG); }
  function app() {
    if (!configured()) return null;
    return firebase.apps.length ? firebase.app() : firebase.initializeApp(window.MON_JETON_FIREBASE_CONFIG);
  }
  function auth() { return app() && firebase.auth(); }
  function db() { return app() && firebase.firestore(); }
  function displayName(user) { return user && (user.displayName || (user.email || '').split('@')[0]) || 'Membre'; }
  function toLocal(group, uid) {
    const copy = JSON.parse(JSON.stringify(group));
    delete copy.updatedAt;
    copy.members = (copy.members || []).map(member => ({ ...member, isMe: member.uid === uid }));
    return copy;
  }
  function toRemote(group, user) {
    const copy = JSON.parse(JSON.stringify(group));
    const ownerUid = copy.createdByUid || user.uid;
    // On conserve aussi ces identifiants localement : l'organisateur peut
    // afficher et partager son code sans attendre le prochain rechargement.
    group.createdByUid = ownerUid;
    group.inviteCode = group.inviteCode || code();
    copy.createdByUid = ownerUid;
    copy.inviteCode = group.inviteCode;
    copy.members = (copy.members || []).map((member, index) => ({
      ...member,
      uid: member.uid || (index === 0 ? ownerUid : null),
      isMe: undefined
    }));
    copy.memberUids = [...new Set(copy.members.map(member => member.uid).filter(Boolean))];
    if (!copy.memberUids.includes(ownerUid)) copy.memberUids.unshift(ownerUid);
    copy.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
    return copy;
  }
  function saveLocal(groups) {
    state.muted = true;
    localStorage.setItem('tontines', JSON.stringify(groups));
    state.muted = false;
    emit('mon-jeton-groups-updated', { groups });
  }
  async function persist(groups) {
    if (!state.user || !db() || state.muted) return;
    const batch = db().batch();
    // Un appareil peut servir à plusieurs comptes. On ne réécrit jamais un
    // groupe appartenant à un autre compte localement resté dans le navigateur.
    const eligible = groups.filter(group => !group.createdByUid
      || group.createdByUid === state.user.uid
      || (group.memberUids || []).includes(state.user.uid)
      || (group.members || []).some(member => member.uid === state.user.uid));
    eligible.forEach(group => {
      const remote = toRemote(group, state.user);
      batch.set(db().collection('groups').doc(group.id), remote, { merge: true });
      batch.set(db().collection('invites').doc(remote.inviteCode), {
        groupId: group.id, ownerUid: remote.createdByUid, groupName: remote.name || 'Groupe'
      }, { merge: true });
    });
    if (eligible.length) await batch.commit();
  }
  function subscribeGroups() {
    if (!state.user || !db()) return;
    if (state.groupsUnsubscribe) state.groupsUnsubscribe();
    state.groupsUnsubscribe = db().collection('groups').where('memberUids', 'array-contains', state.user.uid)
      .onSnapshot(snapshot => {
        const remote = snapshot.docs.map(doc => toLocal({ id: doc.id, ...doc.data() }, state.user.uid));
        saveLocal(remote);
        emit('mon-jeton-sync-status', { connected: true });
      }, error => { console.warn('Synchronisation des groupes :', error.message); emit('mon-jeton-sync-status', { connected: false, error: error.message }); });
    if (state.requestsUnsubscribe) state.requestsUnsubscribe();
    state.requestsUnsubscribe = db().collection('joinRequests').where('ownerUid', '==', state.user.uid)
      .onSnapshot(snapshot => {
        state.pending = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        emit('mon-jeton-join-requests', { requests: state.pending });
      }, () => {});
  }
  async function joinWithCode(inviteCode) {
    if (!state.user) throw new Error('Connectez-vous d’abord avec votre compte.');
    const value = clean(inviteCode).toUpperCase();
    if (!value) throw new Error('Entrez le code du groupe.');
    const invite = await db().collection('invites').doc(value).get();
    if (!invite.exists) throw new Error('Code introuvable. Vérifiez les 6 caractères.');
    const inviteData = invite.data();
    const group = await db().collection('groups').doc(inviteData.groupId).get();
    if (!group.exists) throw new Error('Ce groupe n’est plus disponible.');
    const data = group.data();
    if ((data.memberUids || []).includes(state.user.uid)) return { alreadyMember: true, name: data.name };
    const requestId = group.id + '_' + state.user.uid;
    await db().collection('joinRequests').doc(requestId).set({
      groupId: group.id, groupName: data.name || 'Groupe', ownerUid: data.createdByUid,
      uid: state.user.uid, displayName: displayName(state.user), inviteCode: value,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    return { requested: true, name: data.name };
  }
  async function approveRequest(requestId) {
    if (!state.user) throw new Error('Connexion requise.');
    const requestRef = db().collection('joinRequests').doc(requestId);
    const request = await requestRef.get();
    if (!request.exists) throw new Error('Demande introuvable.');
    const data = request.data();
    if (data.ownerUid !== state.user.uid) throw new Error('Seul le créateur peut valider cette demande.');
    const groupRef = db().collection('groups').doc(data.groupId);
    await db().runTransaction(async tx => {
      const groupDoc = await tx.get(groupRef);
      if (!groupDoc.exists) throw new Error('Groupe introuvable.');
      const group = groupDoc.data();
      const memberUids = [...new Set([...(group.memberUids || []), data.uid])];
      const members = [...(group.members || [])];
      const pendingMember = members.find(member => !member.uid && clean(member.name).toLocaleLowerCase('fr-FR') === clean(data.displayName).toLocaleLowerCase('fr-FR'));
      if (pendingMember) pendingMember.uid = data.uid;
      else members.push({ id: 'm_' + Date.now().toString(36), name: data.displayName, uid: data.uid, isMe: false });
      tx.update(groupRef, { members, memberUids, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
      tx.delete(requestRef);
    });
  }
  async function rejectRequest(requestId) { await db().collection('joinRequests').doc(requestId).delete(); }

  async function signIn(email, password) { const result = await auth().signInWithEmailAndPassword(email, password); return result.user; }
  async function register(name, email, password) {
    const result = await auth().createUserWithEmailAndPassword(email, password);
    await result.user.updateProfile({ displayName: name });
    return result.user;
  }
  async function resetPassword(email) { return auth().sendPasswordResetEmail(email); }
  async function signOut() { return auth().signOut(); }

  window.FirebaseGroups = {
    configured, persist, joinWithCode, approveRequest, rejectRequest,
    getUser: () => state.user, getRequests: () => state.pending.slice(), signIn, register, resetPassword, signOut
  };
  if (configured()) {
    auth().onAuthStateChanged(user => {
      state.user = user || null;
      if (user) {
        let existing = [];
        try { existing = JSON.parse(localStorage.getItem('tontines') || '[]'); } catch (_) {}
        // Importation douce des anciens groupes locaux au premier compte.
        persist(existing).catch(error => console.warn('Import des groupes :', error.message)).finally(subscribeGroups);
      }
      else {
        if (state.groupsUnsubscribe) state.groupsUnsubscribe();
        if (state.requestsUnsubscribe) state.requestsUnsubscribe();
        state.groupsUnsubscribe = state.requestsUnsubscribe = null; state.pending = [];
      }
      emit('mon-jeton-auth-ready', { user: state.user });
    });
  }
})();
