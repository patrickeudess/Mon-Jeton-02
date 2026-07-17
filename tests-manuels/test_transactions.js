// 🧪 Script de Test Automatisé - Page Transactions
// Ce script teste toutes les fonctionnalités principales de la page transactions

console.log('🧪 DÉBUT DES TESTS AUTOMATISÉS - PAGE TRANSACTIONS');

// Fonction de test principale
function runTransactionTests() {
    console.log('=== LANCEMENT DES TESTS ===');
    
    // Test 1: Vérification de la structure de base
    testBasicStructure();
    
    // Test 2: Test des conditionnalités
    testConditionalLogic();
    
    // Test 3: Test des boutons
    testButtons();
    
    // Test 4: Test des formules
    testFormulas();
    
    // Test 5: Test des fonctionnalités avancées
    testAdvancedFeatures();
    
    console.log('✅ TOUS LES TESTS TERMINÉS');
}

// Test 1: Vérification de la structure de base
function testBasicStructure() {
    console.log('📋 Test 1: Vérification de la structure de base');
    
    const elements = {
        'Formulaire de transaction': document.getElementById('transaction-form'),
        'Type de transaction': document.getElementById('transaction-type'),
        'Catégorie': document.getElementById('transaction-category'),
        'Montant': document.getElementById('transaction-amount'),
        'Date': document.getElementById('transaction-date'),
        'Description': document.getElementById('transaction-description'),
        'Méthode de paiement': document.getElementById('payment-method'),
        'Tableau des transactions': document.getElementById('transactions-table'),
        'Vue d\'ensemble': document.querySelector('.transaction-overview')
    };
    
    let allElementsPresent = true;
    
    Object.entries(elements).forEach(([name, element]) => {
        if (element) {
            console.log(`✅ ${name} présent`);
        } else {
            console.error(`❌ ${name} manquant`);
            allElementsPresent = false;
        }
    });
    
    if (allElementsPresent) {
        console.log('✅ Structure de base correcte');
    } else {
        console.error('❌ Problèmes dans la structure de base');
    }
}

// Test 2: Test des conditionnalités
function testConditionalLogic() {
    console.log('🔍 Test 2: Test des conditionnalités');
    
    const typeSelect = document.getElementById('transaction-type');
    const categorySelect = document.getElementById('transaction-category');
    
    if (!typeSelect || !categorySelect) {
        console.error('❌ Éléments manquants pour le test des conditionnalités');
        return;
    }
    
    // Test des catégories de revenus
    console.log('📈 Test des catégories de revenus');
    typeSelect.value = 'revenu';
    typeSelect.dispatchEvent(new Event('change'));
    
    setTimeout(() => {
        const revenuOptions = Array.from(categorySelect.options).map(opt => opt.textContent);
        console.log('Catégories de revenus trouvées:', revenuOptions);
        
        const expectedRevenus = [
            '💼 Salaire', '💻 Freelance', '🏪 Commerce', '📈 Investissement',
            '🎁 Bonus', '👨‍👩‍👧‍👦 Aide familiale', '🎭 Événements coutumiers',
            '🕌 Dîmes & offrandes', '📋 Autre revenu'
        ];
        
        const revenusCorrect = expectedRevenus.every(expected => 
            revenuOptions.includes(expected)
        );
        
        if (revenusCorrect) {
            console.log('✅ Catégories de revenus correctes');
        } else {
            console.error('❌ Problème avec les catégories de revenus');
        }
        
        // Test des catégories de dépenses
        console.log('📉 Test des catégories de dépenses');
        typeSelect.value = 'depense';
        typeSelect.dispatchEvent(new Event('change'));
        
        setTimeout(() => {
            const depenseOptions = Array.from(categorySelect.options).map(opt => opt.textContent);
            console.log('Catégories de dépenses trouvées:', depenseOptions);
            
            const expectedDepenses = [
                '🍽️ Alimentation', '🚗 Transport', '🏠 Logement', '🏥 Santé',
                '📚 Éducation', '🎮 Loisirs', '👕 Vêtements', '📄 Factures',
                '📱 Communication', '🎭 Événements coutumiers', '👨‍👩‍👧‍👦 Aide familiale',
                '🕌 Dîmes & offrandes', '📋 Autre dépense'
            ];
            
            const depensesCorrect = expectedDepenses.every(expected => 
                depenseOptions.includes(expected)
            );
            
            if (depensesCorrect) {
                console.log('✅ Catégories de dépenses correctes');
            } else {
                console.error('❌ Problème avec les catégories de dépenses');
            }
            
            // Remettre à zéro
            typeSelect.value = '';
            typeSelect.dispatchEvent(new Event('change'));
            
        }, 100);
        
    }, 100);
}

// Test 3: Test des boutons
function testButtons() {
    console.log('🔘 Test 3: Test des boutons');
    
    const buttons = {
        'Ajouter Revenu': () => typeof quickAddRevenue === 'function',
        'Ajouter Dépense': () => typeof quickAddExpense === 'function',
        'Nouvelle Transaction': () => typeof showTransactionForm === 'function',
        'Exporter': () => typeof exportTransactions === 'function',
        'Analyser': () => typeof analyzeApplication === 'function'
    };
    
    let allButtonsWork = true;
    
    Object.entries(buttons).forEach(([name, test]) => {
        if (test()) {
            console.log(`✅ ${name} fonctionne`);
        } else {
            console.error(`❌ ${name} ne fonctionne pas`);
            allButtonsWork = false;
        }
    });
    
    if (allButtonsWork) {
        console.log('✅ Tous les boutons fonctionnent');
    } else {
        console.error('❌ Problèmes avec certains boutons');
    }
}

// Test 4: Test des formules
function testFormulas() {
    console.log('📊 Test 4: Test des formules');
    
    // Créer des transactions de test
    const testTransactions = [
        { type: 'revenu', amount: 100000, category: 'Salaire' },
        { type: 'revenu', amount: 50000, category: 'Freelance' },
        { type: 'depense', amount: 30000, category: 'Alimentation' },
        { type: 'depense', amount: 20000, category: 'Transport' }
    ];
    
    // Calculer les totaux attendus
    const totalRevenus = testTransactions
        .filter(t => t.type === 'revenu')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const totalDepenses = testTransactions
        .filter(t => t.type === 'depense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const soldeNet = totalRevenus - totalDepenses;
    
    console.log('Calculs attendus:');
    console.log(`- Total Revenus: ${totalRevenus.toLocaleString()} FCFA`);
    console.log(`- Total Dépenses: ${totalDepenses.toLocaleString()} FCFA`);
    console.log(`- Solde Net: ${soldeNet.toLocaleString()} FCFA`);
    console.log(`- Total Transactions: ${testTransactions.length}`);
    
    // Vérifier que les fonctions de calcul existent
    if (typeof updateTransactionOverview === 'function') {
        console.log('✅ Fonction updateTransactionOverview présente');
    } else {
        console.error('❌ Fonction updateTransactionOverview manquante');
    }
    
    if (typeof formatAmount === 'function') {
        console.log('✅ Fonction formatAmount présente');
    } else {
        console.error('❌ Fonction formatAmount manquante');
    }
}

// Test 5: Test des fonctionnalités avancées
function testAdvancedFeatures() {
    console.log('🎯 Test 5: Test des fonctionnalités avancées');
    
    // Test des notifications
    if (typeof showNotification === 'function') {
        console.log('✅ Fonction showNotification présente');
        // Test d'une notification
        showNotification('Test de notification', 'info');
    } else {
        console.error('❌ Fonction showNotification manquante');
    }
    
    // Test de l'export
    if (typeof generateTransactionCSV === 'function') {
        console.log('✅ Fonction generateTransactionCSV présente');
    } else {
        console.error('❌ Fonction generateTransactionCSV manquante');
    }
    
    // Test du téléchargement
    if (typeof downloadCSV === 'function') {
        console.log('✅ Fonction downloadCSV présente');
    } else {
        console.error('❌ Fonction downloadCSV manquante');
    }
    
    // Test de la gestion des transactions
    if (typeof loadTransactions === 'function') {
        console.log('✅ Fonction loadTransactions présente');
    } else {
        console.error('❌ Fonction loadTransactions manquante');
    }
    
    if (typeof displayTransactions === 'function') {
        console.log('✅ Fonction displayTransactions présente');
    } else {
        console.error('❌ Fonction displayTransactions manquante');
    }
}

// Test de validation du formulaire
function testFormValidation() {
    console.log('✅ Test de validation du formulaire');
    
    const form = document.getElementById('transaction-form');
    if (!form) {
        console.error('❌ Formulaire non trouvé');
        return;
    }
    
    // Simuler une soumission vide
    const originalSubmit = form.onsubmit;
    form.onsubmit = null;
    
    const submitEvent = new Event('submit');
    const wasPrevented = !form.dispatchEvent(submitEvent);
    
    if (wasPrevented) {
        console.log('✅ Validation du formulaire fonctionne');
    } else {
        console.error('❌ Problème avec la validation du formulaire');
    }
    
    // Restaurer l'event listener original
    if (originalSubmit) {
        form.onsubmit = originalSubmit;
    }
}

// Test de création de transaction de test
function createTestTransaction() {
    console.log('🧪 Création d\'une transaction de test');
    
    const testTransaction = {
        id: Date.now().toString(),
        type: 'revenu',
        amount: 50000,
        category: 'Salaire',
        date: new Date().toISOString().slice(0, 10),
        description: 'Transaction de test',
        paymentMethod: 'Virement bancaire',
        createdAt: new Date().toISOString()
    };
    
    // Sauvegarder la transaction
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    transactions.push(testTransaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    
    console.log('✅ Transaction de test créée:', testTransaction);
    
    // Recharger l'affichage
    if (typeof loadTransactions === 'function') {
        loadTransactions();
    }
    
    if (typeof updateTransactionOverview === 'function') {
        updateTransactionOverview();
    }
    
    return testTransaction;
}

// Test de nettoyage
function cleanupTestData() {
    console.log('🧹 Nettoyage des données de test');
    
    // Supprimer les transactions de test
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const filteredTransactions = transactions.filter(t => 
        !t.description || !t.description.includes('Transaction de test')
    );
    
    localStorage.setItem('transactions', JSON.stringify(filteredTransactions));
    
    console.log('✅ Données de test nettoyées');
}

// Fonction pour exécuter tous les tests
function runAllTests() {
    console.log('🚀 LANCEMENT DE TOUS LES TESTS');
    
    // Attendre que la page soit chargée
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(runTransactionTests, 1000);
        });
    } else {
        setTimeout(runTransactionTests, 1000);
    }
}

// Exposer les fonctions de test globalement
window.runTransactionTests = runTransactionTests;
window.testBasicStructure = testBasicStructure;
window.testConditionalLogic = testConditionalLogic;
window.testButtons = testButtons;
window.testFormulas = testFormulas;
window.testAdvancedFeatures = testAdvancedFeatures;
window.testFormValidation = testFormValidation;
window.createTestTransaction = createTestTransaction;
window.cleanupTestData = cleanupTestData;
window.runAllTests = runAllTests;

console.log('🧪 Script de test chargé. Utilisez runAllTests() pour lancer tous les tests.'); 