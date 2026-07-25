/* Donnees personnelles : un espace local et distant distinct par compte.
 * Les cles habituelles restent utilisees par l'application, mais elles sont
 * videes lors d'un changement de session avant de charger le compte suivant.
 */
(function () {
  'use strict';
  const KEYS = ['transactions', 'budgets', 'goals', 'savings', 'income_profile', 'user_settings', 'categories', 'onboarding_completed'];
  let muted = false, timer = null, unsubscribe = null, activeUid = null;
  const cacheKey = uid => 'mon_jeton_private_cache_' + uid;
  const safeRead = key => {
    const value = localStorage.getItem(key);
    if (value === null) return null;
    try { return JSON.parse(value); } catch (_) { return value; }
  };
  const localState = () => KEYS.reduce((data, key) => { const value = safeRead(key); if (value !== null) data[key] = value; return data; }, {});
  function initialize() {
    if (!window.firebase || !window.MON_JETON_FIREBASE_CONFIG) return null;
    return firebase.apps.length ? firebase.app() : firebase.initializeApp(window.MON_JETON_FIREBASE_CONFIG);
  }
  function writeCache(uid) {
    if (!uid) return;
    localStorage.setItem(cacheKey(uid), JSON.stringify(localState()));
  }
  function replaceLocal(values) {
    muted = true;
    KEYS.forEach(key => localStorage.removeItem(key));
    Object.entries(values || {}).forEach(([key, value]) => {
      if (KEYS.includes(key)) localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
    });
    muted = false;
  }
  function cachedState(uid) {
    try { return JSON.parse(localStorage.getItem(cacheKey(uid)) || '{}'); } catch (_) { return {}; }
  }
  function clearVisibleData() {
    muted = true;
    KEYS.forEach(key => localStorage.removeItem(key));
    muted = false;
    window.dispatchEvent(new CustomEvent('mon-jeton-private-data-updated'));
  }
  function writeRemote(user) {
    if (muted || !navigator.onLine || !user || user.uid !== activeUid) return;
    const db = firebase.firestore();
    writeCache(user.uid);
    db.collection('users').doc(user.uid).collection('data').doc('app').set({
      values: localState(), updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true }).catch(error => console.warn('Sauvegarde personnelle en attente :', error.message));
  }
  function schedule(user) {
    clearTimeout(timer);
    timer = setTimeout(() => writeRemote(user), 450);
  }
  function activate(user) {
    if (unsubscribe) { unsubscribe(); unsubscribe = null; }
    if (activeUid && activeUid !== (user && user.uid)) writeCache(activeUid);
    activeUid = user ? user.uid : null;
    clearVisibleData();
    if (!user || !window.firebase) return;

    // Seul le cache de ce compte peut etre affiche pendant le chargement.
    const cached = cachedState(user.uid);
    if (Object.keys(cached).length) replaceLocal(cached);
    const db = firebase.firestore();
    const ref = db.collection('users').doc(user.uid).collection('data').doc('app');
    unsubscribe = ref.onSnapshot(snapshot => {
      if (!user || user.uid !== activeUid) return;
      if (!snapshot.exists) { writeCache(user.uid); writeRemote(user); return; }
      replaceLocal(snapshot.data().values || {});
      writeCache(user.uid);
      window.dispatchEvent(new CustomEvent('mon-jeton-private-data-updated'));
    }, error => console.warn('Chargement personnel :', error.message));
    schedule(user);
  }
  function boot() {
    const app = initialize();
    if (!app) return;
    const auth = firebase.auth();
    // Evite toute apparition des donnees laissees par une ancienne session
    // avant que Firebase confirme le compte courant.
    clearVisibleData();
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      originalSetItem.call(this, key, value);
      if (!muted && KEYS.includes(key) && auth.currentUser && auth.currentUser.uid === activeUid) schedule(auth.currentUser);
    };
    auth.onAuthStateChanged(activate);
  }
  boot();
})();
