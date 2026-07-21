/* Synchronise les données personnelles avec le compte Firebase connecté.
 * Les données de groupe restent dans les collections groups/invites ; ce
 * module ne touche qu'aux données privées de l'utilisateur connecté.
 */
(function () {
  'use strict';
  const KEYS = ['transactions', 'budgets', 'goals', 'savings', 'income_profile', 'user_settings', 'categories', 'onboarding_completed'];
  let muted = false, timer = null, unsubscribe = null;
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
  function writeRemote(user) {
    if (muted || !navigator.onLine || !user) return;
    const db = firebase.firestore();
    db.collection('users').doc(user.uid).collection('data').doc('app').set({
      values: localState(), updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true }).catch(error => console.warn('Sauvegarde personnelle en attente :', error.message));
  }
  function schedule(user) {
    clearTimeout(timer);
    timer = setTimeout(() => writeRemote(user), 450);
  }
  function activate(user) {
    if (!user || !window.firebase) return;
    const db = firebase.firestore();
    if (unsubscribe) unsubscribe();
    const ref = db.collection('users').doc(user.uid).collection('data').doc('app');
    unsubscribe = ref.onSnapshot(snapshot => {
      if (!snapshot.exists) { writeRemote(user); return; }
      const values = snapshot.data().values || {};
      muted = true;
      Object.entries(values).forEach(([key, value]) => {
        if (!KEYS.includes(key)) return;
        localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
      });
      muted = false;
      window.dispatchEvent(new CustomEvent('mon-jeton-private-data-updated'));
    }, error => console.warn('Chargement personnel :', error.message));
    schedule(user);
  }
  function boot() {
    const app = initialize();
    if (!app) return;
    const auth = firebase.auth();
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      originalSetItem.call(this, key, value);
      if (!muted && KEYS.includes(key) && auth.currentUser) schedule(auth.currentUser);
    };
    auth.onAuthStateChanged(user => activate(user));
  }
  boot();
})();
