(function () {
  const T = window.TontineModule;
  const esc = MonJeton.escapeHtml;
  const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('mon-jeton-avec') : null;
  let openId = null;
  const money = n => new Intl.NumberFormat('fr-FR').format(Number(n) || 0) + ' FCFA';
  const mine = group => T.getMyMember(group);
  const groups = () => T.loadTontines().filter(group => group.type === 'avec');
  const roles = { Président: 'Coordonne et représente le groupe.', Secrétaire: 'Enregistre les réunions et les décisions.', Trésorier: 'Contrôle la caisse et les montants.', Membre: 'Épargne, participe et rembourse ses prêts.' };
  const dateTime = value => new Date(value).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  const dateOnly = value => value ? new Date(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'à définir';
  function notify() { if (channel) channel.postMessage({ type: 'refresh' }); }
  function render() {
    document.getElementById('display-name').textContent = localStorage.getItem('user_name') || 'Utilisateur';
    const list = document.getElementById('avec-list'); const data = groups();
    list.innerHTML = data.length ? data.map(group => {
      const avec = T.ensureAvec(group), me = mine(group), shares = me ? T.getMemberShares(group, me.id) : 0;
      const latest = T.getCommunity(group).activity[0]; const update = latest ? esc(latest.message) : 'Aucun mouvement partagé pour le moment.';
      const institution = avec.institution && (avec.institution.name || avec.institution.project) ? `<p class="muted">Suivi : ${esc([avec.institution.name, avec.institution.project].filter(Boolean).join(' · '))}</p>` : '';
      return `<article class="avec-card"><h3>${esc(group.name)}</h3><p class="muted">Part : ${money(avec.shareValue)} · Fonds social : ${money(avec.socialFundValue)}</p>${institution}<p class="amount">Caisse disponible : ${money(T.getAvecFund(group))}</p><p>Votre épargne : ${shares} part(s)</p><p class="shared-preview"><strong>📣 Dernière actualité</strong><span>${update}</span></p><button class="btn primary" onclick="openAvec('${group.id}')">Ouvrir l’AVEC</button></article>`;
    }).join('') : '<p class="muted">Aucune AVEC. Créez votre premier groupe.</p>';
    if (openId) show(openId);
  }
  function show(id) {
    const group = groups().find(item => item.id === id); if (!group) return;
    openId = id; const avec = T.ensureAvec(group), me = mine(group), shares = me ? T.getMemberShares(group, me.id) : 0;
    const canRoles = T.canManageAvec(group, 'roles'), canMembers = T.canManageAvec(group, 'members'), canLoans = T.canManageAvec(group, 'loans'), canRepayments = T.canManageAvec(group, 'repayments');
    const membersHtml = group.members.map(member => {
      const role = T.getAvecRole(group, member.id); const selector = canRoles ? `<select onchange="changeRole('${group.id}','${member.id}',this.value)">${Object.keys(roles).map(item => `<option ${item === role ? 'selected' : ''}>${item}</option>`).join('')}</select>` : `<span class="role">${role}</span>`;
      return `<div class="member"><div><strong>${esc(member.name)}</strong> ${member.isMe ? '(moi)' : ''}<br><small>${roles[role]}</small><br><small>${T.getMemberShares(group, member.id)} part(s)</small></div>${selector}</div>`;
    }).join('');
    const loans = avec.loans.map(loan => {
      const borrower = group.members.find(item => item.id === loan.memberId); const pending = loan.status === 'requested'; const paid = loan.status === 'repaid';
      const remaining = T.getLoanOutstanding(loan); const repayment = (!pending && !paid && (loan.memberId === me.id || canRepayments)) ? `<form class="inline-form" onsubmit="repayAvec(event,'${group.id}','${loan.id}')"><input name="amount" type="number" min="1" max="${remaining}" required placeholder="Montant remboursé"><button class="btn secondary">Enregistrer</button></form>` : '';
      return `<div class="activity"><strong>${esc(borrower ? borrower.name : 'Membre')}</strong> : ${money(loan.amount)} · ${pending ? 'demande en attente' : paid ? '✓ crédit soldé' : 'crédit en cours'} ${loan.purpose ? '· ' + esc(loan.purpose) : ''}<small>${pending ? dateTime(loan.date) : `Reste : ${money(remaining)} · échéance : ${dateOnly(loan.dueDate)}`}</small>${canLoans && pending ? `<p><button class="btn primary" onclick="approveAvec('${group.id}','${loan.id}')">Accorder le crédit</button></p>` : ''}${repayment}</div>`;
    }).join('') || '<p class="muted">Aucun prêt demandé.</p>';
    const addMember = canMembers ? `<form onsubmit="addAvecMember(event,'${group.id}')"><div class="row"><input name="memberName" maxlength="80" required placeholder="Nom du nouveau membre"><button class="btn secondary">Ajouter un membre</button></div></form>` : '';
    const institution = avec.institution && (avec.institution.name || avec.institution.project || avec.institution.reference) ? `<p class="muted"><strong>Suivi institutionnel :</strong> ${esc([avec.institution.name, avec.institution.project, avec.institution.reference].filter(Boolean).join(' · '))}</p>` : '';
    document.getElementById('modal-content').innerHTML = `<h2>🤝 ${esc(group.name)}</h2>${institution}<p><strong>Votre rôle :</strong> ${T.getAvecRole(group, me.id)}</p><p><strong>Votre épargne :</strong> ${shares} part(s), soit ${money(shares * avec.shareValue)}</p><p><strong>Caisse de prêts :</strong> ${money(T.getAvecFund(group))} · prêt maximal : 3× votre épargne</p><div class="shared-notice">☁️ <strong>Journal partagé :</strong> chaque dépôt, demande, crédit et remboursement est visible par les membres autorisés.</div><div class="row"><label>Nombre de parts à déposer<input id="share-units-${group.id}" type="number" min="1" max="20" value="1"></label><p><button class="btn primary" onclick="savePart('${group.id}')">Ajouter à la caisse</button></p></div><hr><h3>Membres et responsabilités</h3>${membersHtml}${addMember}<hr><h3>Demander un crédit</h3><form onsubmit="askLoan(event,'${group.id}')"><div class="row"><input name="amount" type="number" min="100" required placeholder="Montant"><input name="purpose" maxlength="160" placeholder="Motif"></div><p><button class="btn secondary">Envoyer la demande</button></p></form><h3>Crédits du groupe</h3>${loans}<h3>Journal partagé</h3>${T.getCommunity(group).activity.slice(0, 12).map(item => `<div class="activity">${esc(item.message)}<small>${dateTime(item.date)}</small></div>`).join('') || '<p class="muted">Aucune action.</p>'}`;
    document.getElementById('modal').classList.add('active');
  }
  window.openAvec = id => show(id);
  window.closeModal = () => { openId = null; document.getElementById('modal').classList.remove('active'); };
  window.savePart = id => { const group = groups().find(item => item.id === id), me = mine(group), input = document.getElementById(`share-units-${id}`); if (!T.addAvecShare(id, me.id, input ? input.value : 1)) return alert('Indiquez entre 1 et 20 parts.'); notify(); render(); };
  window.addAvecMember = (event, id) => { event.preventDefault(); const result = T.addMember(id, event.currentTarget.elements.memberName.value); if (result.error) return alert(result.error); T.setAvecRole(id, result.member.id, 'Membre'); notify(); render(); };
  window.changeRole = (id, memberId, role) => { if (!T.setAvecRole(id, memberId, role)) return alert('Seul le président peut modifier les rôles.'); notify(); render(); };
  window.askLoan = (event, id) => { event.preventDefault(); const group = groups().find(item => item.id === id), me = mine(group), result = T.requestAvecLoan(id, me.id, event.currentTarget.amount.value, event.currentTarget.purpose.value); if (result.error) return alert(result.error); notify(); render(); };
  window.approveAvec = (id, loanId) => { if (!T.approveAvecLoan(id, loanId)) return alert('Caisse insuffisante ou droit manquant.'); notify(); render(); };
  window.repayAvec = (event, id, loanId) => { event.preventDefault(); const group = groups().find(item => item.id === id), me = mine(group), result = T.recordAvecRepayment(id, loanId, event.currentTarget.amount.value, me.id); if (result.error) return alert(result.error); notify(); render(); };
  document.getElementById('avec-form').addEventListener('submit', event => { event.preventDefault(); const form = event.currentTarget; const group = T.createTontine({ name: form.name.value.trim(), type: 'avec', amount: form.share.value, frequency: 'hebdomadaire', startDate: new Date().toISOString().slice(0, 10), members: form.members.value, socialFund: form.social.value, serviceRate: form.rate.value, loanMonths: form.months.value, institutionName: form.institutionName.value, projectName: form.projectName.value, projectReference: form.projectReference.value }); form.reset(); notify(); render(); show(group.id); });
  if (channel) channel.onmessage = () => render();
  window.addEventListener('storage', event => { if (event.key === 'tontines') render(); });
  window.addEventListener('mon-jeton-groups-updated', render);
  render();
})();
