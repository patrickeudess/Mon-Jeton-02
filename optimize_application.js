// Script d'optimisation pour l'application "Mon Jeton"
// Analyse et améliore les formulaires, boutons et fonctionnalités

class ApplicationOptimizer {
    constructor() {
        this.issues = [];
        this.improvements = [];
        this.testResults = {};
    }

    // Analyser tous les formulaires
    analyzeForms() {
        console.log('🔍 Analyse des formulaires...');
        
        const forms = document.querySelectorAll('form');
        forms.forEach((form, index) => {
            const formId = form.id || `form-${index}`;
            const inputs = form.querySelectorAll('input, select, textarea');
            const buttons = form.querySelectorAll('button');
            
            console.log(`📝 Formulaire ${formId}:`);
            console.log(`   - Champs: ${inputs.length}`);
            console.log(`   - Boutons: ${buttons.length}`);
            
            // Vérifier les validations
            this.checkFormValidation(form, formId);
            
            // Vérifier les event listeners
            this.checkEventListeners(form, formId);
        });
    }

    // Vérifier la validation des formulaires
    checkFormValidation(form, formId) {
        const requiredInputs = form.querySelectorAll('[required]');
        const optionalInputs = form.querySelectorAll('input:not([required]), select:not([required]), textarea:not([required])');
        
        console.log(`   ✅ Champs obligatoires: ${requiredInputs.length}`);
        console.log(`   ℹ️ Champs optionnels: ${optionalInputs.length}`);
        
        // Vérifier les types d'inputs
        const inputTypes = {};
        form.querySelectorAll('input').forEach(input => {
            const type = input.type || 'text';
            inputTypes[type] = (inputTypes[type] || 0) + 1;
        });
        
        console.log(`   📊 Types d'inputs:`, inputTypes);
    }

    // Vérifier les event listeners
    checkEventListeners(form, formId) {
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) {
            console.log(`   🎯 Bouton submit trouvé: "${submitButton.textContent.trim()}"`);
        } else {
            console.log(`   ⚠️ Aucun bouton submit trouvé`);
            this.issues.push(`${formId}: Bouton submit manquant`);
        }
    }

    // Analyser tous les boutons
    analyzeButtons() {
        console.log('🔘 Analyse des boutons...');
        
        const buttons = document.querySelectorAll('button');
        const buttonTypes = {};
        
        buttons.forEach(button => {
            const type = button.type || 'button';
            const text = button.textContent.trim();
            const classes = button.className;
            
            buttonTypes[type] = (buttonTypes[type] || 0) + 1;
            
            // Vérifier les boutons sans onclick
            if (!button.onclick && !button.getAttribute('onclick')) {
                console.log(`   ⚠️ Bouton sans action: "${text}"`);
                this.issues.push(`Bouton sans action: ${text}`);
            }
        });
        
        console.log(`   📊 Types de boutons:`, buttonTypes);
    }

    // Analyser la navigation
    analyzeNavigation() {
        console.log('🧭 Analyse de la navigation...');
        
        const links = document.querySelectorAll('a');
        const internalLinks = [];
        const externalLinks = [];
        
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href) {
                if (href.startsWith('http') || href.startsWith('//')) {
                    externalLinks.push(href);
                } else {
                    internalLinks.push(href);
                }
            }
        });
        
        console.log(`   🔗 Liens internes: ${internalLinks.length}`);
        console.log(`   🌐 Liens externes: ${externalLinks.length}`);
        
        // Vérifier les liens cassés
        this.checkBrokenLinks(internalLinks);
    }

    // Vérifier les liens cassés
    checkBrokenLinks(links) {
        const brokenLinks = [];
        const validPages = [
            'index.html', 'login.html', 'transactions.html', 'budgets.html',
            'dashboard.html', 'goals.html', 'tips.html', 'savings.html',
            'tontine.html', 'security.html', 'badges.html'
        ];
        
        links.forEach(link => {
            if (link && !validPages.includes(link) && !link.startsWith('#')) {
                brokenLinks.push(link);
            }
        });
        
        if (brokenLinks.length > 0) {
            console.log(`   ❌ Liens potentiellement cassés:`, brokenLinks);
            this.issues.push(`Liens cassés: ${brokenLinks.join(', ')}`);
        }
    }

    // Analyser les performances
    analyzePerformance() {
        console.log('⚡ Analyse des performances...');
        
        // Vérifier les images
        const images = document.querySelectorAll('img');
        const imagesWithoutAlt = images.length - document.querySelectorAll('img[alt]').length;
        
        console.log(`   🖼️ Images: ${images.length} (${imagesWithoutAlt} sans alt)`);
        
        // Vérifier les scripts
        const scripts = document.querySelectorAll('script');
        const externalScripts = Array.from(scripts).filter(script => script.src);
        
        console.log(`   📜 Scripts: ${scripts.length} (${externalScripts.length} externes)`);
        
        // Vérifier les styles
        const styles = document.querySelectorAll('link[rel="stylesheet"]');
        console.log(`   🎨 Feuilles de style: ${styles.length}`);
    }

    // Analyser l'accessibilité
    analyzeAccessibility() {
        console.log('♿ Analyse de l\'accessibilité...');
        
        // Vérifier les labels
        const inputs = document.querySelectorAll('input, select, textarea');
        const inputsWithoutLabel = Array.from(inputs).filter(input => {
            const id = input.id;
            if (!id) return true;
            return !document.querySelector(`label[for="${id}"]`);
        });
        
        console.log(`   🏷️ Inputs sans label: ${inputsWithoutLabel.length}`);
        
        // Vérifier les contrastes (simulation)
        const lowContrastElements = document.querySelectorAll('.text-muted, .text-secondary');
        console.log(`   🎨 Éléments potentiellement à faible contraste: ${lowContrastElements.length}`);
    }

    // Analyser le responsive design
    analyzeResponsive() {
        console.log('📱 Analyse du responsive design...');
        
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            console.log(`   ✅ Viewport configuré: ${viewport.content}`);
        } else {
            console.log(`   ❌ Viewport manquant`);
            this.issues.push('Viewport meta tag manquant');
        }
        
        // Vérifier les media queries dans les styles
        const styleSheets = Array.from(document.styleSheets);
        let mediaQueriesCount = 0;
        
        styleSheets.forEach(sheet => {
            try {
                const rules = sheet.cssRules || sheet.rules;
                Array.from(rules).forEach(rule => {
                    if (rule.type === CSSRule.MEDIA_RULE) {
                        mediaQueriesCount++;
                    }
                });
            } catch (e) {
                // Styles externes peuvent ne pas être accessibles
            }
        });
        
        console.log(`   📐 Media queries détectées: ${mediaQueriesCount}`);
    }

    // Analyser le localStorage
    analyzeLocalStorage() {
        console.log('💾 Analyse du localStorage...');
        
        const keys = Object.keys(localStorage);
        console.log(`   📦 Éléments stockés: ${keys.length}`);
        
        keys.forEach(key => {
            const value = localStorage.getItem(key);
            const size = new Blob([value]).size;
            console.log(`   📄 ${key}: ${size} bytes`);
        });
    }

    // Tester les fonctionnalités principales
    testCoreFeatures() {
        console.log('🧪 Test des fonctionnalités principales...');
        
        this.testResults = {
            authentication: this.testAuthentication(),
            transactions: this.testTransactions(),
            budgets: this.testBudgets(),
            navigation: this.testNavigation(),
            forms: this.testForms()
        };
        
        console.log('📊 Résultats des tests:', this.testResults);
    }

    // Tester l'authentification
    testAuthentication() {
        const token = localStorage.getItem('auth_token');
        const userName = localStorage.getItem('user_name');
        
        return {
            hasToken: !!token,
            hasUserName: !!userName,
            isAuthenticated: !!(token && userName)
        };
    }

    // Tester les transactions
    testTransactions() {
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        const revenus = transactions.filter(t => t.type === 'revenu');
        const depenses = transactions.filter(t => t.type === 'depense');
        
        return {
            total: transactions.length,
            revenus: revenus.length,
            depenses: depenses.length,
            hasData: transactions.length > 0
        };
    }

    // Tester les budgets
    testBudgets() {
        const budgets = JSON.parse(localStorage.getItem('budgets') || '{}');
        const budgetCount = Object.keys(budgets).length;
        
        return {
            total: budgetCount,
            categories: Object.keys(budgets),
            hasData: budgetCount > 0
        };
    }

    // Tester la navigation
    testNavigation() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('nav a, .nav a');
        
        return {
            currentPage,
            navLinks: navLinks.length,
            hasNavigation: navLinks.length > 0
        };
    }

    // Tester les formulaires
    testForms() {
        const forms = document.querySelectorAll('form');
        const formResults = {};
        
        forms.forEach((form, index) => {
            const formId = form.id || `form-${index}`;
            const inputs = form.querySelectorAll('input, select, textarea');
            const submitButton = form.querySelector('button[type="submit"]');
            
            formResults[formId] = {
                inputs: inputs.length,
                hasSubmitButton: !!submitButton,
                isValid: inputs.length > 0 && !!submitButton
            };
        });
        
        return formResults;
    }

    // Générer des recommandations
    generateRecommendations() {
        console.log('💡 Génération des recommandations...');
        
        this.improvements = [];
        
        // Recommandations basées sur l'analyse
        if (this.issues.length > 0) {
            this.improvements.push('🔧 Corriger les problèmes identifiés');
        }
        
        if (this.testResults.authentication && !this.testResults.authentication.isAuthenticated) {
            this.improvements.push('🔐 Améliorer le système d\'authentification');
        }
        
        if (this.testResults.transactions && this.testResults.transactions.total === 0) {
            this.improvements.push('📝 Ajouter des données de test pour les transactions');
        }
        
        if (this.testResults.budgets && this.testResults.budgets.total === 0) {
            this.improvements.push('🎯 Ajouter des données de test pour les budgets');
        }
        
        // Recommandations générales
        this.improvements.push('📱 Optimiser pour mobile');
        this.improvements.push('♿ Améliorer l\'accessibilité');
        this.improvements.push('⚡ Optimiser les performances');
        this.improvements.push('🔒 Renforcer la sécurité');
        
        console.log('📋 Recommandations:', this.improvements);
    }

    // Exécuter l'analyse complète
    runFullAnalysis() {
        console.log('🚀 Début de l\'analyse complète de l\'application...');
        
        this.analyzeForms();
        this.analyzeButtons();
        this.analyzeNavigation();
        this.analyzePerformance();
        this.analyzeAccessibility();
        this.analyzeResponsive();
        this.analyzeLocalStorage();
        this.testCoreFeatures();
        this.generateRecommendations();
        
        console.log('✅ Analyse complète terminée');
        
        return {
            issues: this.issues,
            improvements: this.improvements,
            testResults: this.testResults
        };
    }
}

// Fonction d'initialisation
function initializeOptimizer() {
    const optimizer = new ApplicationOptimizer();
    return optimizer.runFullAnalysis();
}

// Exporter pour utilisation globale
window.ApplicationOptimizer = ApplicationOptimizer;
window.initializeOptimizer = initializeOptimizer;

// Auto-exécution si le script est chargé directement
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('🔧 Optimiseur d\'application chargé');
        
        // Ajouter un bouton de test dans la console
        window.testApp = function() {
            return initializeOptimizer();
        };
        
        console.log('💡 Tapez "testApp()" dans la console pour analyser l\'application');
    });
} 