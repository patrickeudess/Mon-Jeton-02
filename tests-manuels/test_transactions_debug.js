// 🧪 Script de Débogage - Transactions
// Ce script aide à diagnostiquer les problèmes avec les transactions

console.log('🧪 SCRIPT DE DÉBOGAGE DES TRANSACTIONS CHARGÉ');

// Fonction pour tester l'ajout d'une transaction
function testAddTransaction() {
    console.log('=== TEST AJOUT TRANSACTION ===');
    
    // Créer une transaction de test
    const testTransaction = {
        id: Date.now().toString(),
        type: 'revenu',
        amount: 50000,
        category: 'Salaire',
        date: new Date().toISOString().slice(0, 10),
        description: 'Test transaction',
        paymentMethod: 'virement',
        createdAt: new Date().toISOString()
    };
    
    console.log('Transaction de test:', testTransaction);
    
    // Sauvegarder la transaction
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    transactions.push(testTransaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    
    console.log('Transaction sauvegardée');
    console.log('Toutes les transactions:', transactions);
    
    // Recharger l'affichage
    if (typeof loadTransactions === 'function') {
        loadTransactions();
    }
    
    alert('Transaction de test ajoutée !');
}

// Fonction pour vérifier le localStorage
function checkLocalStorage() {
    console.log('=== VÉRIFICATION LOCALSTORAGE ===');
    
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    console.log('Transactions dans localStorage:', transactions);
    console.log('Nombre de transactions:', transactions.length);
    
    if (transactions.length > 0) {
        console.log('Première transaction:', transactions[0]);
        console.log('Dernière transaction:', transactions[transactions.length - 1]);
    }
    
    return transactions;
}

// Fonction pour nettoyer le localStorage
function clearTransactions() {
    console.log('=== NETTOYAGE DES TRANSACTIONS ===');
    
    if (confirm('Êtes-vous sûr de vouloir supprimer toutes les transactions ?')) {
        localStorage.removeItem('transactions');
        console.log('LocalStorage nettoyé');
        
        if (typeof loadTransactions === 'function') {
            loadTransactions();
        }
        
        alert('Toutes les transactions ont été supprimées !');
    }
}

// Fonction pour simuler l'ajout d'une transaction via le formulaire
function simulateFormSubmission() {
    console.log('=== SIMULATION SOUMISSION FORMULAIRE ===');
    
    // Remplir le formulaire
    document.getElementById('transaction-type').value = 'revenu';
    document.getElementById('transaction-type').dispatchEvent(new Event('change'));
    
    setTimeout(() => {
        document.getElementById('transaction-category').value = 'Salaire';
        document.getElementById('transaction-amount').value = '75000';
        document.getElementById('transaction-date').value = new Date().toISOString().slice(0, 10);
        document.getElementById('payment-method').value = 'virement';
        document.getElementById('transaction-description').value = 'Test simulation';
        
        console.log('Formulaire rempli');
        console.log('Valeurs:', {
            type: document.getElementById('transaction-type').value,
            category: document.getElementById('transaction-category').value,
            amount: document.getElementById('transaction-amount').value,
            date: document.getElementById('transaction-date').value,
            paymentMethod: document.getElementById('payment-method').value,
            description: document.getElementById('transaction-description').value
        });
        
        // Soumettre le formulaire
        document.getElementById('transaction-form').dispatchEvent(new Event('submit'));
    }, 100);
}

// Fonction pour vérifier les éléments du DOM
function checkDOMElements() {
    console.log('=== VÉRIFICATION ÉLÉMENTS DOM ===');
    
    const elements = {
        'Formulaire': document.getElementById('transaction-form'),
        'Type': document.getElementById('transaction-type'),
        'Catégorie': document.getElementById('transaction-category'),
        'Montant': document.getElementById('transaction-amount'),
        'Date': document.getElementById('transaction-date'),
        'Méthode': document.getElementById('payment-method'),
        'Description': document.getElementById('transaction-description'),
        'Tableau': document.getElementById('transactions-table'),
        'Tbody': document.getElementById('transactions-table-body')
    };
    
    Object.entries(elements).forEach(([name, element]) => {
        if (element) {
            console.log(`✅ ${name} trouvé`);
        } else {
            console.error(`❌ ${name} manquant`);
        }
    });
}

// Fonction pour tester l'affichage
function testDisplay() {
    console.log('=== TEST AFFICHAGE ===');
    
    if (typeof loadTransactions === 'function') {
        loadTransactions();
    } else {
        console.error('Fonction loadTransactions non trouvée');
    }
}

// Fonction pour exécuter tous les tests
function runAllTests() {
    console.log('🚀 LANCEMENT DE TOUS LES TESTS');
    
    checkDOMElements();
    checkLocalStorage();
    testDisplay();
    
    console.log('✅ Tests terminés');
}

// Exposer les fonctions globalement
window.testAddTransaction = testAddTransaction;
window.checkLocalStorage = checkLocalStorage;
window.clearTransactions = clearTransactions;
window.simulateFormSubmission = simulateFormSubmission;
window.checkDOMElements = checkDOMElements;
window.testDisplay = testDisplay;
window.runAllTests = runAllTests;

console.log('🧪 Utilisez runAllTests() pour lancer tous les tests de débogage'); 