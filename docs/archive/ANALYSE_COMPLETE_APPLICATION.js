// Script d'analyse complète de l'application Mon Jeton
class ApplicationAnalyzer {
    constructor() {
        this.issues = [];
        this.warnings = [];
        this.success = [];
    }

    // Analyser la page des transactions
    analyzeTransactionsPage() {
        console.log('=== ANALYSE DE LA PAGE TRANSACTIONS ===');
        
        // Vérifier les éléments essentiels
        const elements = {
            typeSelect: document.getElementById('transaction-type'),
            categorySelect: document.getElementById('transaction-category'),
            amountInput: document.getElementById('transaction-amount'),
            dateInput: document.getElementById('transaction-date'),
            descriptionTextarea: document.getElementById('transaction-description'),
            paymentMethodSelect: document.getElementById('payment-method'),
            form: document.getElementById('transaction-form')
        };

        // Vérifier l'existence des éléments
        Object.entries(elements).forEach(([name, element]) => {
            if (element) {
                this.success.push(`✅ ${name} trouvé`);
                console.log(`✅ ${name} trouvé:`, element);
            } else {
                this.issues.push(`❌ ${name} manquant`);
                console.error(`❌ ${name} manquant`);
            }
        });

        // Vérifier les événements
        this.checkEventListeners();
        
        // Vérifier les catégories
        this.checkCategories();
        
        // Vérifier le localStorage
        this.checkLocalStorage();
        
        // Vérifier les styles
        this.checkStyles();
    }

    // Vérifier les event listeners
    checkEventListeners() {
        console.log('=== VÉRIFICATION DES EVENT LISTENERS ===');
        
        const typeSelect = document.getElementById('transaction-type');
        if (typeSelect) {
            const listeners = getEventListeners ? getEventListeners(typeSelect) : 'Non disponible';
            console.log('Event listeners sur typeSelect:', listeners);
            
            // Tester le changement de type
            console.log('Test du changement de type...');
            const originalValue = typeSelect.value;
            typeSelect.value = 'revenu';
            typeSelect.dispatchEvent(new Event('change'));
            
            setTimeout(() => {
                const categorySelect = document.getElementById('transaction-category');
                console.log('Après changement vers revenu:');
                console.log('- Type sélectionné:', typeSelect.value);
                console.log('- Nombre d\'options catégorie:', categorySelect ? categorySelect.options.length : 'N/A');
                console.log('- Options disponibles:', categorySelect ? Array.from(categorySelect.options).map(opt => opt.textContent) : 'N/A');
                
                // Remettre la valeur originale
                typeSelect.value = originalValue;
                typeSelect.dispatchEvent(new Event('change'));
            }, 100);
        }
    }

    // Vérifier les catégories
    checkCategories() {
        console.log('=== VÉRIFICATION DES CATÉGORIES ===');
        
        const categorySelect = document.getElementById('transaction-category');
        if (categorySelect) {
            console.log('État initial du select catégorie:');
            console.log('- Nombre d\'options:', categorySelect.options.length);
            console.log('- Options:', Array.from(categorySelect.options).map(opt => opt.textContent));
            console.log('- Valeur sélectionnée:', categorySelect.value);
            console.log('- Required:', categorySelect.required);
            console.log('- Disabled:', categorySelect.disabled);
        }
    }

    // Vérifier le localStorage
    checkLocalStorage() {
        console.log('=== VÉRIFICATION DU LOCALSTORAGE ===');
        
        const keys = ['transactions', 'budgets', 'auth_token', 'user_name', 'user_email'];
        keys.forEach(key => {
            const value = localStorage.getItem(key);
            if (value) {
                console.log(`✅ ${key}:`, value);
            } else {
                console.log(`⚠️ ${key}: Non défini`);
            }
        });
    }

    // Vérifier les styles
    checkStyles() {
        console.log('=== VÉRIFICATION DES STYLES ===');
        
        const categorySelect = document.getElementById('transaction-category');
        if (categorySelect) {
            const styles = window.getComputedStyle(categorySelect);
            console.log('Styles du select catégorie:');
            console.log('- Display:', styles.display);
            console.log('- Visibility:', styles.visibility);
            console.log('- Opacity:', styles.opacity);
            console.log('- Border:', styles.border);
            console.log('- Background:', styles.backgroundColor);
        }
    }

    // Analyser toutes les pages
    analyzeAllPages() {
        console.log('=== ANALYSE COMPLÈTE DE L\'APPLICATION ===');
        
        // Analyser la page actuelle
        const currentPage = window.location.pathname;
        console.log('Page actuelle:', currentPage);
        
        switch (currentPage) {
            case '/transactions.html':
            case '/transactions.html/':
                this.analyzeTransactionsPage();
                break;
            case '/budgets.html':
            case '/budgets.html/':
                this.analyzeBudgetsPage();
                break;
            case '/dashboard.html':
            case '/dashboard.html/':
                this.analyzeDashboardPage();
                break;
            default:
                this.analyzeHomePage();
        }
        
        // Analyser les fonctionnalités communes
        this.analyzeCommonFeatures();
        
        // Générer le rapport
        this.generateReport();
    }

    // Analyser la page d'accueil
    analyzeHomePage() {
        console.log('=== ANALYSE DE LA PAGE D\'ACCUEIL ===');
        
        const elements = {
            nav: document.querySelector('.top-nav'),
            grid: document.querySelector('.icon-grid'),
            quickActions: document.querySelector('.quick-actions'),
            recentTransactions: document.querySelector('.recent-transactions')
        };

        Object.entries(elements).forEach(([name, element]) => {
            if (element) {
                this.success.push(`✅ ${name} trouvé sur la page d'accueil`);
            } else {
                this.warnings.push(`⚠️ ${name} manquant sur la page d'accueil`);
            }
        });
    }

    // Analyser les fonctionnalités communes
    analyzeCommonFeatures() {
        console.log('=== ANALYSE DES FONCTIONNALITÉS COMMUNES ===');
        
        // Vérifier l'authentification
        const authToken = localStorage.getItem('auth_token');
        if (authToken) {
            this.success.push('✅ Utilisateur authentifié');
        } else {
            this.warnings.push('⚠️ Utilisateur non authentifié');
        }
        
        // Vérifier la navigation
        const nav = document.querySelector('.top-nav');
        if (nav) {
            this.success.push('✅ Navigation présente');
        } else {
            this.issues.push('❌ Navigation manquante');
        }
        
        // Vérifier les notifications
        if (typeof showNotification === 'function') {
            this.success.push('✅ Système de notifications disponible');
        } else {
            this.warnings.push('⚠️ Système de notifications manquant');
        }
    }

    // Générer le rapport
    generateReport() {
        console.log('\n=== RAPPORT D\'ANALYSE ===');
        console.log('\n✅ SUCCÈS:');
        this.success.forEach(item => console.log(item));
        
        console.log('\n⚠️ AVERTISSEMENTS:');
        this.warnings.forEach(item => console.log(item));
        
        console.log('\n❌ PROBLÈMES:');
        this.issues.forEach(item => console.log(item));
        
        console.log('\n📊 STATISTIQUES:');
        console.log(`- Succès: ${this.success.length}`);
        console.log(`- Avertissements: ${this.warnings.length}`);
        console.log(`- Problèmes: ${this.issues.length}`);
        
        // Recommandations
        console.log('\n💡 RECOMMANDATIONS:');
        if (this.issues.length > 0) {
            console.log('- Corriger les problèmes critiques en priorité');
        }
        if (this.warnings.length > 0) {
            console.log('- Traiter les avertissements pour améliorer l\'expérience');
        }
        if (this.success.length > 0) {
            console.log('- Continuer à maintenir les fonctionnalités qui fonctionnent');
        }
    }

    // Test des catégories
    testCategories() {
        console.log('=== TEST DES CATÉGORIES ===');
        
        const typeSelect = document.getElementById('transaction-type');
        const categorySelect = document.getElementById('transaction-category');
        
        if (!typeSelect || !categorySelect) {
            console.error('❌ Éléments manquants pour le test des catégories');
            return;
        }
        
        // Test revenu
        console.log('Test revenu...');
        typeSelect.value = 'revenu';
        typeSelect.dispatchEvent(new Event('change'));
        
        setTimeout(() => {
            console.log('Résultats test revenu:');
            console.log('- Options disponibles:', categorySelect.options.length);
            console.log('- Options:', Array.from(categorySelect.options).map(opt => opt.textContent));
            
            // Test dépense
            console.log('Test dépense...');
            typeSelect.value = 'depense';
            typeSelect.dispatchEvent(new Event('change'));
            
            setTimeout(() => {
                console.log('Résultats test dépense:');
                console.log('- Options disponibles:', categorySelect.options.length);
                console.log('- Options:', Array.from(categorySelect.options).map(opt => opt.textContent));
            }, 100);
        }, 100);
    }
}

// Fonction pour lancer l'analyse
function launchCompleteAnalysis() {
    console.log('🚀 LANCEMENT DE L\'ANALYSE COMPLÈTE');
    const analyzer = new ApplicationAnalyzer();
    analyzer.analyzeAllPages();
    return analyzer;
}

// Fonction pour tester les catégories
function testCategoriesOnly() {
    console.log('🔍 TEST SPÉCIFIQUE DES CATÉGORIES');
    const analyzer = new ApplicationAnalyzer();
    analyzer.testCategories();
    return analyzer;
}

// Exporter pour utilisation globale
window.ApplicationAnalyzer = ApplicationAnalyzer;
window.launchCompleteAnalysis = launchCompleteAnalysis;
window.testCategoriesOnly = testCategoriesOnly;

console.log('📋 Script d\'analyse chargé. Utilisez:');
console.log('- launchCompleteAnalysis() pour une analyse complète');
console.log('- testCategoriesOnly() pour tester uniquement les catégories'); 