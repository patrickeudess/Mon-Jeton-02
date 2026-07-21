/* Petite interface commune pour rejoindre un groupe et traiter les demandes. */
(function () {
  function mount() {
    if (!window.FirebaseGroups || document.getElementById('group-sync-panel')) return;
    const host = document.querySelector('main') || document.body;
    const panel = document.createElement('section');
    panel.id = 'group-sync-panel';
    panel.style.cssText = 'max-width:1000px;margin:14px auto;padding:14px 18px;border:1px solid #bce5d8;border-radius:14px;background:#effaf6;color:#174b40;font:inherit;display:flex;gap:12px;align-items:center;flex-wrap:wrap';
    host.insertBefore(panel, host.firstChild);
    const draw = () => {
      const user = FirebaseGroups.getUser();
      const requests = FirebaseGroups.getRequests();
      const groups = (window.TontineModule ? TontineModule.loadTontines() : []).filter(g => g.createdByUid === (user && user.uid));
      panel.innerHTML = user ? `<strong>☁️ Groupes synchronisés</strong><span style="flex:1">${user.email}</span><button type="button" id="join-group">Rejoindre avec un code</button>${requests.length ? `<button type="button" id="view-requests">Demandes (${requests.length})</button>` : ''}${groups.length ? `<small>Code${groups.length > 1 ? 's' : ''} : ${groups.map(g => '<b>' + g.name.replace(/</g, '&lt;') + ' — ' + g.inviteCode + '</b>').join(' · ')}</small>` : ''}` : '<span>Connexion requise pour synchroniser les groupes.</span>';
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
    window.addEventListener('mon-jeton-groups-updated', () => { draw(); if (typeof window.renderAll === 'function') window.renderAll(); });
  }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', mount) : mount();
})();
