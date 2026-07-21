/* Petite interface commune pour rejoindre un groupe et traiter les demandes. */
(function () {
  function mount() {
    if (!window.FirebaseGroups || document.getElementById('group-sync-panel')) return;
    const host = document.querySelector('main') || document.body;
    const panel = document.createElement('section');
    panel.id = 'group-sync-panel';
    const style = document.createElement('style');
    style.textContent = `#group-sync-panel{max-width:1000px;margin:14px auto 18px;padding:18px;border:1px solid #cfe7de;border-radius:18px;background:linear-gradient(135deg,#f4fffb,#e8f7f2);color:#173f36;font:inherit}.sync-top{display:flex;gap:12px;align-items:flex-start}.sync-icon{width:42px;height:42px;display:grid;place-items:center;border-radius:13px;background:#087f67;color:#fff;font-size:1.25rem;flex:0 0 auto}.sync-top h2{font-size:1rem;margin:1px 0 4px}.sync-top p{margin:0;color:#58716b;font-size:.9rem;line-height:1.4}.sync-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:13px}.sync-actions button,.sync-actions a{border:0;border-radius:10px;padding:10px 12px;font:inherit;font-weight:700;text-decoration:none;cursor:pointer}.sync-primary{background:#087f67;color:#fff}.sync-secondary{background:#fff;color:#07594b;border:1px solid #b9ded2!important}.sync-code{display:block;margin-top:13px;padding:10px 12px;border-radius:10px;background:#fff;border:1px dashed #9ccfc0;color:#315b51;font-size:.88rem;line-height:1.65}.sync-code b{color:#07594b}.sync-state{display:inline-flex;align-items:center;gap:6px;margin-left:auto;font-size:.8rem;font-weight:800;padding:6px 9px;border-radius:999px}.sync-state.synced{background:#d9f6e9;color:#087f67}.sync-state.syncing{background:#fff2c7;color:#795800}.sync-state.offline,.sync-state.need-auth,.sync-state.error{background:#fff0ed;color:#a23b2a}@media(max-width:600px){.sync-state{margin-left:0}.sync-top{flex-wrap:wrap}}`;
    document.head.appendChild(style);
    host.insertBefore(panel, host.firstChild);
    const statusCopy = () => FirebaseGroups.getStatus ? FirebaseGroups.getStatus() : { kind: FirebaseGroups.getUser() ? 'synced' : 'need-auth', message: '' };
    const draw = () => {
      const user = FirebaseGroups.getUser();
      const requests = FirebaseGroups.getRequests();
      const groups = (window.TontineModule ? TontineModule.loadTontines() : []).filter(g => g.createdByUid === (user && user.uid));
      const status = statusCopy();
      const title = user ? 'Synchronisation des groupes' : 'Activez le partage entre membres';
      const text = user ? status.message : 'Votre session actuelle reste sur cet appareil. Connectez-vous avec votre e-mail pour partager cette AVEC ou cette tontine.';
      panel.innerHTML = `<div class="sync-top"><div class="sync-icon">${user ? '☁️' : '🔒'}</div><div style="flex:1"><h2>${title}</h2><p>${text}</p></div><span class="sync-state ${status.kind}">${status.kind === 'synced' ? '● À jour' : status.kind === 'syncing' ? '◌ En cours' : status.kind === 'offline' ? '● Hors ligne' : '● À activer'}</span></div><div class="sync-actions">${user ? `<button type="button" id="join-group" class="sync-primary">Rejoindre avec un code</button>${requests.length ? `<button type="button" id="view-requests" class="sync-secondary">Demandes (${requests.length})</button>` : ''}` : `<a class="sync-primary" href="login.html?sync=1">Se connecter pour synchroniser</a><a class="sync-secondary" href="login.html?sync=1">Créer un compte</a>`}</div>${user && groups.length ? `<div class="sync-code"><b>Codes à partager</b><br>${groups.map(g => '<b>' + g.name.replace(/</g, '&lt;') + '</b> : ' + (g.inviteCode || 'Préparation…')).join('<br>')}</div>` : ''}`;
      const join = document.getElementById('join-group');
      if (join) join.onclick = async () => {
        const value = prompt('Entrez le code à 6 caractères donné par le créateur :');
        if (!value) return;
        try { const result = await FirebaseGroups.joinWithCode(value); alert(result.alreadyMember ? 'Vous êtes déjà membre de « ' + result.name + ' ».' : 'Demande envoyée au créateur de « ' + result.name + ' ».'); }
        catch (error) { alert(error.message); }
      };
      const requestsButton = document.getElementById('view-requests');
      if (requestsButton) requestsButton.onclick = async () => {
        for (const request of FirebaseGroups.getRequests()) {
          if (confirm(request.displayName + ' demande à rejoindre « ' + request.groupName + ' ».\n\nOK : accepter · Annuler : ignorer')) {
            try { await FirebaseGroups.approveRequest(request.id); } catch (error) { alert(error.message); }
          }
        }
      };
    };
    draw();
    window.addEventListener('mon-jeton-auth-ready', draw);
    window.addEventListener('mon-jeton-join-requests', draw);
    window.addEventListener('mon-jeton-sync-status', draw);
    window.addEventListener('mon-jeton-groups-updated', () => { draw(); if (typeof window.renderAll === 'function') window.renderAll(); });
  }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', mount) : mount();
})();
