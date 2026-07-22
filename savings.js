// Variables globales
let objectifs = [];
let epargnes = [];

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    displayUserInfo();
    loadSavingsData();
    
    
    // Attacher les gestionnaires d'événements après le chargement du DOM
    attachEventListeners();
});

// Fonction pour attacher tous les gestionnaires d'événements
function attachEventListeners() {
    // Gestionnaire de déconnexion
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_email');
            localStorage.removeItem('user_name');
            window.location.href = 'login.html';
        });
    }

    // Gestionnaire du formulaire objectif
    const objectifForm = document.getElementById('objectif-form');
    if (objectifForm) {
        objectifForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const editingId = this.dataset.editingId;
            const nom = document.getElementById('objectif-nom').value;
            const montantCible = parseFloat(document.getElementById('objectif-montant').value);
            const dateLimite = document.getElementById('objectif-date').value;
            const description = document.getElementById('objectif-description').value;
            
            if (!nom || !montantCible || !dateLimite) {
                alert('Veuillez remplir tous les champs obligatoires !');
                return;
            }
            
            const objectif = {
                id: editingId || Date.now().toString(),
                nom: nom,
                montantCible: montantCible,
                montantEpargne: 0,
                dateLimite: dateLimite,
                description: description,
                createdAt: new Date().toISOString()
            };
            
            if (editingId) {
                // Mise à jour
                const index = objectifs.findIndex(obj => obj.id === editingId);
                if (index !== -1) {
                    objectifs[index] = { ...objectifs[index], ...objectif };
                }
            } else {
                // Création
                objectifs.push(objectif);
            }
            
            localStorage.setItem('objectifs_epargne', JSON.stringify(objectifs));
            loadSavingsData();
            
            // Réinitialiser le formulaire
            this.reset();
            delete this.dataset.editingId;
            const submitBtn = this.querySelector('button[type="submit"]');
            submitBtn.innerHTML = '<i class="mj-emoji">💾</i> Créer l\'Objectif';
            
            closeModal('objectif-modal');
            alert(editingId ? 'Objectif mis à jour avec succès !' : 'Objectif créé avec succès !');
        });
    }



    // Fermer les modals en cliquant à l'extérieur
    window.onclick = function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    };
}

// Afficher le nom de l'utilisateur
function displayUserInfo() {
    const userName = localStorage.getItem('user_name') || 'Utilisateur';
    document.getElementById('display-name').textContent = userName;
}

// Charger les données d'épargne
function loadSavingsData() {
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    

    
    // Calculer l'épargne totale
    const totalRevenus = transactions
        .filter(t => t.type === 'revenu')
        .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    const totalDepenses = transactions
        .filter(t => t.type === 'depense')
        .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    const totalSavings = totalRevenus - totalDepenses;
    
    // Calculer l'épargne mensuelle
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyRevenus = transactions
        .filter(t => {
            const tDate = new Date(t.date);
            return t.type === 'revenu' && 
                   tDate.getMonth() === currentMonth && 
                   tDate.getFullYear() === currentYear;
        })
        .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    const monthlyDepenses = transactions
        .filter(t => {
            const tDate = new Date(t.date);
            return t.type === 'depense' && 
                   tDate.getMonth() === currentMonth && 
                   tDate.getFullYear() === currentYear;
        })
        .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    const monthlySavings = monthlyRevenus - monthlyDepenses;
    
    // Calculer le taux d'épargne
    const savingsRate = totalRevenus > 0 ? Math.round((totalSavings / totalRevenus) * 100) : 0;
    
    // Compter les objectifs
    const activeGoals = objectifs.filter(obj => new Date(obj.dateLimite) >= new Date()).length;
    const completedGoals = objectifs.filter(obj => new Date(obj.dateLimite) < new Date()).length;
    
    // Mettre à jour l'affichage
    document.getElementById('total-savings').textContent = formatCurrency(totalSavings);
    document.getElementById('savings-rate').textContent = savingsRate + '%';
    document.getElementById('active-goals').textContent = activeGoals;
    document.getElementById('completed-goals').textContent = completedGoals;
    document.getElementById('monthly-savings').textContent = formatCurrency(monthlySavings);
    

}





// Fonctions utilitaires
function formatCurrency(amount) {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'XOF'
    }).format(amount);
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR');
}







function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Fermer les modals en cliquant à l'extérieur
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}







// FONCTIONS DES BOUTONS DE LA GRILLE - TOUTES ACTIVÉES
function showTotalSavings() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h2><i class="mj-emoji">🪙</i> Détails du Total Épargne</h2>
            
            <div style="margin: 20px 0;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
                    <h3 style="margin: 0; font-size: 2em;">${document.getElementById('total-savings').textContent}</h3>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">Total de vos économies</p>
                </div>
                
                <h3>📊 Répartition de l'Épargne</h3>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 15px 0;">
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                        <strong>Revenus Totaux:</strong><br>
                        <span style="color: #28a745; font-size: 1.2em;">${formatCurrency(JSON.parse(localStorage.getItem('transactions') || '[]').filter(t => t.type === 'revenu').reduce((sum, t) => sum + (t.amount || 0), 0))}</span>
                    </div>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                        <strong>Dépenses Totales:</strong><br>
                        <span style="color: #dc3545; font-size: 1.2em;">${formatCurrency(JSON.parse(localStorage.getItem('transactions') || '[]').filter(t => t.type === 'depense').reduce((sum, t) => sum + (t.amount || 0), 0))}</span>
                    </div>
                </div>
                
                <h3>📈 Évolution de l'Épargne</h3>
                <div style="margin: 15px 0;">
                    <p>Votre épargne totale représente la différence entre vos revenus et vos dépenses.</p>
                    <div style="background: #e9ecef; padding: 15px; border-radius: 8px; margin: 10px 0;">
                        <strong>Formule :</strong> Épargne = Revenus - Dépenses
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    modal.onclick = function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    };
}

function showSavingsRate() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h2><i class="mj-emoji">📊</i> Détails du Taux d'Épargne</h2>
            
            <div style="margin: 20px 0;">
                <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
                    <h3 style="margin: 0; font-size: 2em;">${document.getElementById('savings-rate').textContent}</h3>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">Pourcentage de vos revenus épargnés</p>
                </div>
                
                <h3>📊 Calcul du Taux</h3>
                <div style="margin: 15px 0;">
                    <p>Le taux d'épargne indique le pourcentage de vos revenus que vous parvenez à épargner.</p>
                    <div style="background: #e9ecef; padding: 15px; border-radius: 8px; margin: 10px 0;">
                        <strong>Formule :</strong> Taux = (Épargne / Revenus) × 100
                    </div>
                </div>
                
                <h3>🎯 Objectifs Recommandés</h3>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 15px 0;">
                    <div style="background: #d4edda; padding: 15px; border-radius: 8px;">
                        <strong>Excellent :</strong> 20% et plus
                    </div>
                    <div style="background: #fff3cd; padding: 15px; border-radius: 8px;">
                        <strong>Bon :</strong> 10-20%
                    </div>
                    <div style="background: #f8d7da; padding: 15px; border-radius: 8px;">
                        <strong>À améliorer :</strong> Moins de 10%
                    </div>
                    <div style="background: #d1ecf1; padding: 15px; border-radius: 8px;">
                        <strong>Règle 50/30/20 :</strong> 20% pour l'épargne
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    modal.onclick = function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    };
}

function showActiveGoals() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h2><i class="mj-emoji">🎯</i> Objectifs Actifs</h2>
            
            <div style="margin: 20px 0;">
                <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
                    <h3 style="margin: 0; font-size: 2em;">${document.getElementById('active-goals').textContent}</h3>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">Objectifs en cours</p>
                </div>
                
                <h3>🎯 Détails des Objectifs Actifs</h3>
                <div style="margin: 15px 0;">
                    ${objectifs.filter(obj => new Date(obj.dateLimite) >= new Date()).length > 0 ? 
                        objectifs.filter(obj => new Date(obj.dateLimite) >= new Date()).map(obj => {
                            const progression = obj.montantCible > 0 ? (obj.montantEpargne / obj.montantCible * 100) : 0;
                            return `
                                <div style="margin: 10px 0; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                                    <strong>${obj.nom}</strong><br>
                                    <small>Progression: ${progression.toFixed(1)}% (${formatCurrency(obj.montantEpargne)} / ${formatCurrency(obj.montantCible)})</small>
                                    <div class="progress-bar" style="margin-top: 5px;">
                                        <div class="progress-fill" style="width: ${Math.min(progression, 100)}%"></div>
                                    </div>
                                    <small>Date limite: ${formatDate(obj.dateLimite)}</small>
                                </div>
                            `;
                        }).join('') : '<p>Aucun objectif actif pour le moment.</p>'}
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    modal.onclick = function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    };
}

function showCompletedGoals() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h2><i class="mj-emoji">🏆</i> Objectifs Atteints</h2>
            
            <div style="margin: 20px 0;">
                <div style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: white; padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
                    <h3 style="margin: 0; font-size: 2em;">${document.getElementById('completed-goals').textContent}</h3>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">Objectifs réalisés</p>
                </div>
                
                <h3>🏆 Historique des Objectifs Atteints</h3>
                <div style="margin: 15px 0;">
                    ${objectifs.filter(obj => new Date(obj.dateLimite) < new Date()).length > 0 ? 
                        objectifs.filter(obj => new Date(obj.dateLimite) < new Date()).map(obj => {
                            const progression = obj.montantCible > 0 ? (obj.montantEpargne / obj.montantCible * 100) : 0;
                            return `
                                <div style="margin: 10px 0; padding: 15px; background: #d4edda; border-radius: 8px;">
                                    <strong>${obj.nom}</strong> ✅<br>
                                    <small>Progression finale: ${progression.toFixed(1)}% (${formatCurrency(obj.montantEpargne)} / ${formatCurrency(obj.montantCible)})</small>
                                    <div class="progress-bar" style="margin-top: 5px;">
                                        <div class="progress-fill" style="width: ${Math.min(progression, 100)}%"></div>
                                    </div>
                                    <small>Date limite: ${formatDate(obj.dateLimite)}</small>
                                </div>
                            `;
                        }).join('') : '<p>Aucun objectif atteint pour le moment.</p>'}
                </div>
                
                <h3>🎉 Conseils pour Atteindre vos Objectifs</h3>
                <div style="margin: 15px 0;">
                    <ul style="padding-left: 20px;">
                        <li>Définissez des objectifs SMART (Spécifiques, Mesurables, Atteignables)</li>
                        <li>Suivez régulièrement vos progrès</li>
                        <li>Épargnez automatiquement chaque mois</li>
                        <li>Célébrez vos réussites !</li>
                    </ul>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    modal.onclick = function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    };
}

function showMonthlySavings() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h2><i class="mj-emoji">📅</i> Épargne Mensuelle</h2>
            
            <div style="margin: 20px 0;">
                <div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white; padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
                    <h3 style="margin: 0; font-size: 2em;">${document.getElementById('monthly-savings').textContent}</h3>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">Épargne du mois en cours</p>
                </div>
                
                <h3>📊 Détails du Mois</h3>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 15px 0;">
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                        <strong>Revenus du mois:</strong><br>
                        <span style="color: #28a745; font-size: 1.2em;">${formatCurrency(JSON.parse(localStorage.getItem('transactions') || '[]').filter(t => {
                            const tDate = new Date(t.date);
                            return t.type === 'revenu' && 
                                   tDate.getMonth() === new Date().getMonth() && 
                                   tDate.getFullYear() === new Date().getFullYear();
                        }).reduce((sum, t) => sum + (t.amount || 0), 0))}</span>
                    </div>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                        <strong>Dépenses du mois:</strong><br>
                        <span style="color: #dc3545; font-size: 1.2em;">${formatCurrency(JSON.parse(localStorage.getItem('transactions') || '[]').filter(t => {
                            const tDate = new Date(t.date);
                            return t.type === 'depense' && 
                                   tDate.getMonth() === new Date().getMonth() && 
                                   tDate.getFullYear() === new Date().getFullYear();
                        }).reduce((sum, t) => sum + (t.amount || 0), 0))}</span>
                    </div>
                </div>
                
                <h3>📈 Épargnes du Mois</h3>
                <div style="margin: 15px 0;">
                    ${epargnes.filter(ep => {
                        const epDate = new Date(ep.date);
                        return epDate.getMonth() === new Date().getMonth() && 
                               epDate.getFullYear() === new Date().getFullYear();
                    }).length > 0 ? 
                        epargnes.filter(ep => {
                            const epDate = new Date(ep.date);
                            return epDate.getMonth() === new Date().getMonth() && 
                                   epDate.getFullYear() === new Date().getFullYear();
                        }).map(ep => `
                            <div style="margin: 10px 0; padding: 10px; background: #f8f9fa; border-radius: 5px;">
                                <strong>${ep.description}</strong> - ${formatCurrency(ep.montant)}<br>
                                <small>${formatDate(ep.date)} - ${ep.methode}</small>
                            </div>
                        `).join('') : '<p>Aucune épargne enregistrée ce mois.</p>'}
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    modal.onclick = function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    };
}

function showAnalyses() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h2><i class="mj-emoji">📊</i> Analyses d'Épargne</h2>
            
            <div style="margin: 20px 0;">
                <h3>📊 Statistiques Générales</h3>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 15px 0;">
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                        <strong>Total Épargne:</strong><br>
                        <span style="color: #28a745; font-size: 1.2em;">${document.getElementById('total-savings').textContent}</span>
                    </div>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                        <strong>Taux d'Épargne:</strong><br>
                        <span style="color: #007bff; font-size: 1.2em;">${document.getElementById('savings-rate').textContent}</span>
                    </div>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                        <strong>Objectifs Actifs:</strong><br>
                        <span style="color: #ffc107; font-size: 1.2em;">${document.getElementById('active-goals').textContent}</span>
                    </div>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                        <strong>Épargne Mensuelle:</strong><br>
                        <span style="color: #17a2b8; font-size: 1.2em;">${document.getElementById('monthly-savings').textContent}</span>
                    </div>
                </div>
                
                <h3>🎯 Progression des Objectifs</h3>
                <div style="margin: 15px 0;">
                    ${objectifs.map(obj => {
                        const progression = obj.montantCible > 0 ? (obj.montantEpargne / obj.montantCible * 100) : 0;
                        return `
                            <div style="margin: 10px 0; padding: 10px; background: #f8f9fa; border-radius: 5px;">
                                <strong>${obj.nom}</strong><br>
                                <small>Progression: ${progression.toFixed(1)}% (${formatCurrency(obj.montantEpargne)} / ${formatCurrency(obj.montantCible)})</small>
                                <div class="progress-bar" style="margin-top: 5px;">
                                    <div class="progress-fill" style="width: ${Math.min(progression, 100)}%"></div>
                                </div>
                            </div>
                        `;
                    }).join('') || '<p>Aucun objectif à analyser</p>'}
                </div>
                
                <h3>📈 Épargnes Récentes</h3>
                <div style="margin: 15px 0;">
                    ${epargnes.slice(-5).map(ep => `
                        <div style="margin: 10px 0; padding: 10px; background: #f8f9fa; border-radius: 5px;">
                            <strong>${ep.description}</strong> - ${formatCurrency(ep.montant)}<br>
                            <small>${formatDate(ep.date)} - ${ep.methode}</small>
                        </div>
                    `).join('') || '<p>Aucune épargne récente</p>'}
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    modal.onclick = function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    };
}





function showHistory() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h2><i class="mj-emoji">🕑</i> Historique des Épargnes</h2>
            
            <div style="margin: 20px 0;">
                <h3>📋 Toutes les Épargnes</h3>
                <div style="max-height: 400px; overflow-y: auto;">
                    ${epargnes.length > 0 ? `
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background: #667eea; color: white;">
                                    <th style="padding: 10px; text-align: left;">Date</th>
                                    <th style="padding: 10px; text-align: left;">Description</th>
                                    <th style="padding: 10px; text-align: left;">Montant</th>
                                    <th style="padding: 10px; text-align: left;">Méthode</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${epargnes.map(ep => `
                                    <tr style="border-bottom: 1px solid #eee;">
                                        <td style="padding: 10px;">${formatDate(ep.date)}</td>
                                        <td style="padding: 10px;"><strong>${ep.description}</strong></td>
                                        <td style="padding: 10px; color: #28a745;">${formatCurrency(ep.montant)}</td>
                                        <td style="padding: 10px;">${ep.methode}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    ` : '<p>Aucune épargne enregistrée dans l\'historique</p>'}
                </div>
                
                <h3>📊 Statistiques de l'Historique</h3>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 15px 0;">
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                        <strong>Total Épargné:</strong><br>
                        <span style="color: #28a745; font-size: 1.2em;">${formatCurrency(epargnes.reduce((sum, ep) => sum + (ep.montant || 0), 0))}</span>
                    </div>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                        <strong>Nombre d'Épargnes:</strong><br>
                        <span style="color: #007bff; font-size: 1.2em;">${epargnes.length}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    modal.onclick = function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    };
} 

// Fonction de mise à jour automatique
function autoUpdateData() {
    // Mettre à jour les données toutes les 5 secondes
    setInterval(() => {
        loadSavingsData();
        console.log('🔄 Mise à jour automatique des données...');
    }, 5000);
}

// Fonction pour forcer la mise à jour immédiate
function forceUpdate() {
    loadSavingsData();
    console.log('⚡ Mise à jour forcée des données');
}

// Initialiser la mise à jour automatique
document.addEventListener('DOMContentLoaded', function() {
    // Démarrer la mise à jour automatique après 2 secondes
    setTimeout(() => {
        autoUpdateData();
    }, 2000);
}); 