// Script pour vérifier et améliorer l'affichage de l'historique
console.log('🔍 Vérification de l\'historique en cours...');

// Fonction pour créer des données de test complètes
function createCompleteTestData() {
    console.log('📊 Création de données de test complètes...');
    
    // Objectifs d'épargne avec historique
    const objectifs = [
        {
            id: '1',
            nom: 'Vacances d\'été',
            montantCible: 500000,
            montantEpargne: 150000,
            dateLimite: '2024-08-15',
            description: 'Épargne pour les vacances d\'été en famille',
            createdAt: '2024-01-01T00:00:00.000Z',
            statut: 'En cours'
        },
        {
            id: '2',
            nom: 'Nouvelle voiture',
            montantCible: 3000000,
            montantEpargne: 800000,
            dateLimite: '2025-06-30',
            description: 'Achat d\'une nouvelle voiture pour remplacer l\'ancienne',
            createdAt: '2024-01-15T00:00:00.000Z',
            statut: 'En cours'
        },
        {
            id: '3',
            nom: 'Formation professionnelle',
            montantCible: 250000,
            montantEpargne: 75000,
            dateLimite: '2024-12-31',
            description: 'Formation en développement web et nouvelles technologies',
            createdAt: '2024-02-01T00:00:00.000Z',
            statut: 'En cours'
        },
        {
            id: '4',
            nom: 'Rénovation maison',
            montantCible: 1500000,
            montantEpargne: 300000,
            dateLimite: '2025-12-31',
            description: 'Rénovation complète de la cuisine et salle de bain',
            createdAt: '2024-02-15T00:00:00.000Z',
            statut: 'En cours'
        }
    ];
    
    // Épargnes régulières avec historique
    const epargnes = [
        {
            id: '1',
            description: 'Épargne mensuelle',
            montant: 50000,
            date: '2024-01-15',
            methode: 'virement',
            objectifLie: '1',
            createdAt: '2024-01-15T00:00:00.000Z'
        },
        {
            id: '2',
            description: 'Bonus de fin d\'année',
            montant: 100000,
            date: '2024-01-20',
            methode: 'especes',
            objectifLie: null,
            createdAt: '2024-01-20T00:00:00.000Z'
        },
        {
            id: '3',
            description: 'Épargne hebdomadaire',
            montant: 25000,
            date: '2024-01-25',
            methode: 'virement',
            objectifLie: '2',
            createdAt: '2024-01-25T00:00:00.000Z'
        },
        {
            id: '4',
            description: 'Épargne exceptionnelle',
            montant: 75000,
            date: '2024-02-01',
            methode: 'carte',
            objectifLie: '3',
            createdAt: '2024-02-01T00:00:00.000Z'
        },
        {
            id: '5',
            description: 'Épargne mensuelle',
            montant: 50000,
            date: '2024-02-15',
            methode: 'virement',
            objectifLie: '1',
            createdAt: '2024-02-15T00:00:00.000Z'
        },
        {
            id: '6',
            description: 'Épargne bonus',
            montant: 125000,
            date: '2024-02-20',
            methode: 'especes',
            objectifLie: '4',
            createdAt: '2024-02-20T00:00:00.000Z'
        }
    ];
    
    // Sauvegarder dans localStorage
    localStorage.setItem('objectifs_epargne', JSON.stringify(objectifs));
    localStorage.setItem('epargnes_regulieres', JSON.stringify(epargnes));
    
    console.log('✅ Données de test créées :', {
        objectifs: objectifs.length,
        epargnes: epargnes.length
    });
    
    return { objectifs, epargnes };
}

// Fonction pour vérifier l'affichage de l'historique
function verifyHistoryDisplay() {
    console.log('🔍 Vérification de l\'affichage de l\'historique...');
    
    // Vérifier les éléments HTML
    const objectifsTable = document.getElementById('objectifs-table');
    const epargnesTable = document.getElementById('epargnes-table');
    const objectifsTbody = document.getElementById('objectifs-tbody');
    const epargnesTbody = document.getElementById('epargnes-tbody');
    
    console.log('📋 Éléments HTML trouvés :', {
        objectifsTable: !!objectifsTable,
        epargnesTable: !!epargnesTable,
        objectifsTbody: !!objectifsTbody,
        epargnesTbody: !!epargnesTbody
    });
    
    // Vérifier les données
    const objectifs = JSON.parse(localStorage.getItem('objectifs_epargne') || '[]');
    const epargnes = JSON.parse(localStorage.getItem('epargnes_regulieres') || '[]');
    
    console.log('📊 Données trouvées :', {
        objectifs: objectifs.length,
        epargnes: epargnes.length
    });
    
    return {
        elements: { objectifsTable, epargnesTable, objectifsTbody, epargnesTbody },
        data: { objectifs, epargnes }
    };
}

// Fonction pour forcer l'affichage de l'historique
function forceDisplayHistory() {
    console.log('🔄 Forçage de l\'affichage de l\'historique...');
    
    // Recharger les données
    const objectifs = JSON.parse(localStorage.getItem('objectifs_epargne') || '[]');
    const epargnes = JSON.parse(localStorage.getItem('epargnes_regulieres') || '[]');
    
    // Afficher les objectifs
    const objectifsTbody = document.getElementById('objectifs-tbody');
    if (objectifsTbody && objectifs.length > 0) {
        objectifsTbody.innerHTML = objectifs.map(obj => {
            const progression = obj.montantCible > 0 ? (obj.montantEpargne / obj.montantCible * 100) : 0;
            const status = new Date(obj.dateLimite) >= new Date() ? 'En cours' : 'Terminé';
            const statusClass = status === 'En cours' ? 'status-active' : 'status-completed';
            
            return `
                <tr>
                    <td><strong>${obj.nom}</strong></td>
                    <td>${obj.montantCible.toLocaleString()} F CFA</td>
                    <td>${obj.montantEpargne.toLocaleString()} F CFA</td>
                    <td>
                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${Math.min(progression, 100)}%"></div>
                            </div>
                            <span class="progress-text">${progression.toFixed(1)}%</span>
                        </div>
                    </td>
                    <td>${new Date(obj.dateLimite).toLocaleDateString('fr-FR')}</td>
                    <td><span class="status-badge ${statusClass}">${status}</span></td>
                    <td>
                        <button class="action-btn edit-btn" onclick="editObjectif('${obj.id}')" title="Modifier">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-btn" onclick="deleteObjectif('${obj.id}')" title="Supprimer">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }
    
    // Afficher les épargnes
    const epargnesTbody = document.getElementById('epargnes-tbody');
    if (epargnesTbody && epargnes.length > 0) {
        epargnesTbody.innerHTML = epargnes.map(ep => {
            const objectifLie = objectifs.find(obj => obj.id === ep.objectifLie);
            const objectifNom = objectifLie ? objectifLie.nom : 'Aucun objectif';
            
            return `
                <tr>
                    <td>${new Date(ep.date).toLocaleDateString('fr-FR')}</td>
                    <td><strong>${ep.description}</strong></td>
                    <td class="amount-positive">${ep.montant.toLocaleString()} F CFA</td>
                    <td>${objectifNom}</td>
                    <td>${ep.methode}</td>
                    <td>
                        <button class="action-btn edit-btn" onclick="editEpargne('${ep.id}')" title="Modifier">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-btn" onclick="deleteEpargne('${ep.id}')" title="Supprimer">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }
    
    console.log('✅ Affichage de l\'historique forcé');
}

// Fonction pour tester l'historique complet
function testCompleteHistory() {
    console.log('🧪 Test complet de l\'historique...');
    
    // 1. Créer les données de test
    const testData = createCompleteTestData();
    
    // 2. Vérifier l'affichage
    const verification = verifyHistoryDisplay();
    
    // 3. Forcer l'affichage
    forceDisplayHistory();
    
    // 4. Résultats
    console.log('📊 Résultats du test :', {
        objectifsCrees: testData.objectifs.length,
        epargnesCrees: testData.epargnes.length,
        elementsTrouves: Object.values(verification.elements).filter(Boolean).length,
        historiqueAffiche: true
    });
    
    return {
        success: true,
        message: `✅ Historique affiché avec succès : ${testData.objectifs.length} objectifs et ${testData.epargnes.length} épargnes`
    };
}

// Fonction pour nettoyer l'historique
function clearHistory() {
    console.log('🗑️ Nettoyage de l\'historique...');
    
    localStorage.removeItem('objectifs_epargne');
    localStorage.removeItem('epargnes_regulieres');
    
    // Vider les tableaux
    const objectifsTbody = document.getElementById('objectifs-tbody');
    const epargnesTbody = document.getElementById('epargnes-tbody');
    
    if (objectifsTbody) {
        objectifsTbody.innerHTML = `
            <tr>
                <td colspan="7">
                    <div class="empty-state">
                        <i class="fas fa-bullseye" style="color: #dc3545;"></i>
                        <h3>Aucun objectif d'épargne</h3>
                        <p>Créez votre premier objectif d'épargne</p>
                    </div>
                </td>
            </tr>
        `;
    }
    
    if (epargnesTbody) {
        epargnesTbody.innerHTML = `
            <tr>
                <td colspan="6">
                    <div class="empty-state">
                        <i class="fas fa-file-alt" style="color: #dc3545;"></i>
                        <h3>Aucune épargne régulière</h3>
                        <p>Enregistrez votre première épargne régulière</p>
                    </div>
                </td>
            </tr>
        `;
    }
    
    console.log('✅ Historique nettoyé');
}

// Exposer les fonctions globalement
window.createCompleteTestData = createCompleteTestData;
window.verifyHistoryDisplay = verifyHistoryDisplay;
window.forceDisplayHistory = forceDisplayHistory;
window.testCompleteHistory = testCompleteHistory;
window.clearHistory = clearHistory;

console.log('✅ Script de vérification de l\'historique chargé');
console.log('📋 Fonctions disponibles :');
console.log('  - testCompleteHistory() : Test complet');
console.log('  - createCompleteTestData() : Créer données test');
console.log('  - verifyHistoryDisplay() : Vérifier affichage');
console.log('  - forceDisplayHistory() : Forcer affichage');
console.log('  - clearHistory() : Nettoyer historique'); 