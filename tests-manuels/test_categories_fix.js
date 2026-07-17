// 🧪 Script de Test - Correction des Catégories
// Ce script teste la correction du problème d'affichage des catégories

console.log('🧪 TEST DE CORRECTION DES CATÉGORIES');

// Test de vérification des catégories
function testCategoriesDisplay() {
    console.log('=== TEST D\'AFFICHAGE DES CATÉGORIES ===');
    
    const categorySelect = document.getElementById('transaction-category');
    
    if (!categorySelect) {
        console.error('❌ Select catégorie non trouvé');
        return false;
    }
    
    const options = Array.from(categorySelect.options);
    console.log('Nombre d\'options trouvées:', options.length);
    console.log('Options disponibles:', options.map(opt => opt.textContent));
    
    // Vérifier qu'il y a plus que l'option par défaut
    if (options.length > 1) {
        console.log('✅ Catégories affichées correctement');
        return true;
    } else {
        console.error('❌ Problème: seulement l\'option par défaut est présente');
        return false;
    }
}

// Test de la fonction d'initialisation
function testInitializeCategories() {
    console.log('=== TEST DE LA FONCTION D\'INITIALISATION ===');
    
    if (typeof initializeCategories === 'function') {
        console.log('✅ Fonction initializeCategories présente');
        
        // Appeler la fonction
        initializeCategories();
        
        // Vérifier le résultat
        setTimeout(() => {
            const success = testCategoriesDisplay();
            if (success) {
                console.log('✅ Initialisation des catégories réussie');
            } else {
                console.error('❌ Échec de l\'initialisation des catégories');
            }
        }, 100);
        
    } else {
        console.error('❌ Fonction initializeCategories manquante');
        return false;
    }
}

// Test de la fonction forceShowCategories
function testForceShowCategories() {
    console.log('=== TEST DE LA FONCTION FORCE SHOW CATEGORIES ===');
    
    if (typeof forceShowCategories === 'function') {
        console.log('✅ Fonction forceShowCategories présente');
        
        // Appeler la fonction
        forceShowCategories();
        
        // Vérifier le résultat
        setTimeout(() => {
            const categorySelect = document.getElementById('transaction-category');
            const options = Array.from(categorySelect.options);
            
            console.log('Nombre d\'options après forceShowCategories:', options.length);
            console.log('Options:', options.map(opt => opt.textContent));
            
            if (options.length > 1) {
                console.log('✅ ForceShowCategories fonctionne correctement');
            } else {
                console.error('❌ ForceShowCategories n\'a pas fonctionné');
            }
        }, 100);
        
    } else {
        console.error('❌ Fonction forceShowCategories manquante');
    }
}

// Test complet
function runCategoriesTest() {
    console.log('🚀 LANCEMENT DU TEST COMPLET DES CATÉGORIES');
    
    // Test 1: Vérification initiale
    console.log('\n📋 Test 1: Vérification initiale');
    testCategoriesDisplay();
    
    // Test 2: Test de l'initialisation
    console.log('\n🔧 Test 2: Test de l\'initialisation');
    testInitializeCategories();
    
    // Test 3: Test de la fonction force
    console.log('\n💪 Test 3: Test de la fonction force');
    testForceShowCategories();
    
    console.log('\n✅ TESTS TERMINÉS');
}

// Fonction pour simuler un changement de type
function testTypeChange() {
    console.log('=== TEST DE CHANGEMENT DE TYPE ===');
    
    const typeSelect = document.getElementById('transaction-type');
    const categorySelect = document.getElementById('transaction-category');
    
    if (!typeSelect || !categorySelect) {
        console.error('❌ Éléments manquants');
        return;
    }
    
    // Test revenu
    console.log('📈 Test avec type revenu');
    typeSelect.value = 'revenu';
    typeSelect.dispatchEvent(new Event('change'));
    
    setTimeout(() => {
        const revenuOptions = Array.from(categorySelect.options).map(opt => opt.textContent);
        console.log('Catégories revenu:', revenuOptions);
        
        // Test dépense
        console.log('📉 Test avec type dépense');
        typeSelect.value = 'depense';
        typeSelect.dispatchEvent(new Event('change'));
        
        setTimeout(() => {
            const depenseOptions = Array.from(categorySelect.options).map(opt => opt.textContent);
            console.log('Catégories dépense:', depenseOptions);
            
            // Remettre à zéro
            typeSelect.value = '';
            typeSelect.dispatchEvent(new Event('change'));
            
            console.log('✅ Test de changement de type terminé');
        }, 100);
        
    }, 100);
}

// Exposer les fonctions globalement
window.testCategoriesDisplay = testCategoriesDisplay;
window.testInitializeCategories = testInitializeCategories;
window.testForceShowCategories = testForceShowCategories;
window.runCategoriesTest = runCategoriesTest;
window.testTypeChange = testTypeChange;

console.log('🧪 Script de test des catégories chargé. Utilisez runCategoriesTest() pour lancer tous les tests.'); 