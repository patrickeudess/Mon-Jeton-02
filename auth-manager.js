/**
 * Gestionnaire d'authentification et de synchronisation API
 */

class AuthManager {
    constructor() {
        this.api = window.api || new BudgetAPI();
        this.currentUser = null;
        this.isOnline = false;
        this.init();
    }

    async init() {
        // Vérifier si l'utilisateur est connecté
        if (this.api.isAuthenticated()) {
            try {
                this.currentUser = await this.api.getCurrentUser();
                this.updateUI(true);
                this.checkConnection();
            } catch (error) {
                console.error('Erreur lors de la récupération du profil:', error);
                this.logout();
            }
        } else {
            this.updateUI(false);
        }

        // Vérifier la connexion au serveur, uniquement si un backend est configuré
        if (this.api.baseURL) {
            this.checkConnection();
            setInterval(() => this.checkConnection(), 30000); // Toutes les 30 secondes
        } else {
            this.updateConnectionStatus(false);
        }
    }

    async checkConnection() {
        if (!this.api.baseURL) {
            this.isOnline = false;
            this.updateConnectionStatus(false);
            return;
        }
        try {
            const response = await fetch(`${this.api.baseURL}/health`);
            if (response.ok) {
                this.isOnline = true;
                this.updateConnectionStatus(true);
            } else {
                this.isOnline = false;
                this.updateConnectionStatus(false);
            }
        } catch (error) {
            this.isOnline = false;
            this.updateConnectionStatus(false);
        }
    }

    updateConnectionStatus(isOnline) {
        const statusElement = document.getElementById('connection-status');
        if (statusElement) {
            const indicator = statusElement.querySelector('.status-indicator');
            if (indicator) {
                if (isOnline) {
                    indicator.className = 'status-indicator online';
                    indicator.textContent = '🟢 Connecté';
                } else {
                    indicator.className = 'status-indicator offline';
                    indicator.textContent = '🔴 Hors ligne';
                }
            }
        }
    }

    updateUI(isAuthenticated) {
        const userInfo = document.getElementById('user-info');
        const loginBtn = document.getElementById('login-btn');
        const userName = document.getElementById('user-name');

        if (isAuthenticated && this.currentUser) {
            // Utilisateur connecté
            if (userInfo) userInfo.style.display = 'flex';
            if (loginBtn) loginBtn.style.display = 'none';
            if (userName) userName.textContent = `👤 ${this.currentUser.full_name || this.currentUser.username}`;
            
            // Charger les données depuis l'API
            this.loadDataFromAPI();
        } else {
            // Utilisateur non connecté
            if (userInfo) userInfo.style.display = 'none';
            if (loginBtn) loginBtn.style.display = 'block';
            
            // Charger les données depuis localStorage
            this.loadDataFromLocalStorage();
        }
    }

    async login(username, password) {
        try {
            await this.api.login(username, password);
            this.currentUser = await this.api.getCurrentUser();
            this.updateUI(true);
            
            // Migrer les données si nécessaire
            await this.migrateDataIfNeeded();
            
            this.showNotification('Connexion réussie !', 'success');
            return true;
        } catch (error) {
            this.showNotification(`Erreur de connexion: ${error.message}`, 'error');
            return false;
        }
    }

    logout() {
        this.api.logout();
        this.currentUser = null;
        this.updateUI(false);
        this.showNotification('Déconnexion réussie', 'info');
    }

    async migrateDataIfNeeded() {
        const hasLocalData = localStorage.getItem('transactions') || localStorage.getItem('budgets');
        if (hasLocalData) {
            const shouldMigrate = confirm('Des données locales ont été détectées. Voulez-vous les migrer vers votre compte ?');
            if (shouldMigrate) {
                try {
                    await DataMigration.migrateFromLocalStorage();
                    this.showNotification('Migration des données réussie !', 'success');
                } catch (error) {
                    this.showNotification('Erreur lors de la migration', 'error');
                }
            }
        }
    }

    async loadDataFromAPI() {
        try {
            // Charger les transactions depuis l'API
            const transactions = await this.api.getTransactions();
            this.updateTransactionsUI(transactions);
            
            // Charger les budgets depuis l'API
            const currentMonth = new Date().toISOString().slice(0, 7);
            const budgets = await this.api.getBudgets(currentMonth);
            this.updateBudgetsUI(budgets);
            
            // Charger les analyses
            const analytics = await this.api.getTransactionAnalytics();
            this.updateAnalyticsUI(analytics);
            
        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
            this.showNotification('Erreur lors du chargement des données', 'error');
        }
    }

    loadDataFromLocalStorage() {
        // Charger les données depuis localStorage (mode hors ligne)
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        const budgets = JSON.parse(localStorage.getItem('budgets') || '{}');
        
        this.updateTransactionsUI(transactions);
        this.updateBudgetsUI(budgets);
    }

    updateTransactionsUI(transactions) {
        // Mettre à jour l'interface avec les transactions
        if (typeof updateQuickSummary === 'function') {
            updateQuickSummary(transactions);
        }
        if (typeof updateEvolutionChart === 'function') {
            updateEvolutionChart(transactions);
        }
    }

    updateBudgetsUI(budgets) {
        // L'API renvoie une liste d'objets budget ; l'interface attend une
        // map { catégorie: montant }.
        let budgetMap = budgets;
        if (Array.isArray(budgets)) {
            budgetMap = {};
            budgets.forEach(b => { budgetMap[b.category] = b.amount; });
        }
        if (typeof updateBudgetOverview === 'function') {
            updateBudgetOverview(undefined, budgetMap);
        }
    }

    updateAnalyticsUI(analytics) {
        // Mettre à jour les analyses
        const totalRevenus = document.getElementById('total-revenus');
        const totalDepenses = document.getElementById('total-depenses');
        const soldeActuel = document.getElementById('solde-actuel');

        if (totalRevenus) totalRevenus.textContent = `${analytics.total_revenues.toFixed(0)} FCFA`;
        if (totalDepenses) totalDepenses.textContent = `${analytics.total_expenses.toFixed(0)} FCFA`;
        if (soldeActuel) {
            soldeActuel.textContent = `${analytics.balance.toFixed(0)} FCFA`;
            soldeActuel.style.color = analytics.balance >= 0 ? '#1e7e34' : '#c62828';
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Gestionnaire d'événements pour les boutons
    setupEventListeners() {
        const loginBtn = document.getElementById('login-btn');
        const logoutBtn = document.getElementById('logout-btn');

        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                window.location.href = 'login.html';
            });
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }
    }
}

// Gestionnaire de notifications amélioré
class EnhancedNotificationManager {
    constructor() {
        this.container = this.createContainer();
    }

    createContainer() {
        const container = document.createElement('div');
        container.className = 'notification-container';
        document.body.appendChild(container);
        return container;
    }

    show(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification-item ${type}`;

        // Construction en DOM avec textContent : le message peut contenir du
        // texte issu de données utilisateur ou d'erreurs, il ne doit jamais
        // être interprété comme du HTML.
        const content = document.createElement('div');
        content.className = 'notification-content';

        const icon = document.createElement('span');
        icon.className = 'notification-icon';
        icon.textContent = this.getIcon(type);

        const text = document.createElement('span');
        text.className = 'notification-message';
        text.textContent = message;

        content.appendChild(icon);
        content.appendChild(text);

        const closeBtn = document.createElement('button');
        closeBtn.className = 'notification-close';
        closeBtn.textContent = '×';
        closeBtn.addEventListener('click', () => notification.remove());

        notification.appendChild(content);
        notification.appendChild(closeBtn);

        this.container.appendChild(notification);

        // Auto-remove après la durée spécifiée
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOut 0.3s ease-in';
                setTimeout(() => {
                    if (notification.parentElement) {
                        notification.remove();
                    }
                }, 300);
            }
        }, duration);

        return notification;
    }

    getIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }
}

// Gestionnaire de synchronisation hors ligne
class OfflineManager {
    constructor() {
        this.pendingChanges = [];
        this.init();
    }

    init() {
        // Restaurer les changements en attente sauvegardés lors d'une session précédente
        this.loadPendingChanges();

        // Écouter les événements de connexion
        window.addEventListener('online', () => this.syncWhenOnline());
        window.addEventListener('offline', () => this.handleOffline());
    }

    addPendingChange(change) {
        this.pendingChanges.push({
            ...change,
            timestamp: Date.now()
        });
        this.savePendingChanges();
    }

    async syncWhenOnline() {
        if (this.pendingChanges.length === 0) return;

        try {
            for (const change of this.pendingChanges) {
                await this.processChange(change);
            }
            
            this.pendingChanges = [];
            this.savePendingChanges();
            
            // Notification de succès
            const notificationManager = new EnhancedNotificationManager();
            notificationManager.show('Données synchronisées avec succès !', 'success');
        } catch (error) {
            console.error('Erreur lors de la synchronisation:', error);
        }
    }

    async processChange(change) {
        // Traiter les changements selon leur type
        switch (change.type) {
            case 'transaction':
                await api.createTransaction(change.data);
                break;
            case 'budget':
                await api.createBudget(change.data);
                break;
            // Ajouter d'autres types selon les besoins
        }
    }

    handleOffline() {
        const notificationManager = new EnhancedNotificationManager();
        notificationManager.show('Mode hors ligne activé. Les changements seront synchronisés lors de la reconnexion.', 'warning');
    }

    savePendingChanges() {
        localStorage.setItem('pendingChanges', JSON.stringify(this.pendingChanges));
    }

    loadPendingChanges() {
        const saved = localStorage.getItem('pendingChanges');
        if (saved) {
            this.pendingChanges = JSON.parse(saved);
        }
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
    window.notificationManager = new EnhancedNotificationManager();
    window.offlineManager = new OfflineManager();
    
    // Configurer les événements
    window.authManager.setupEventListeners();
});

// Fonction globale pour initialiser l'authentification
function initializeAuth() {
    if (window.authManager) {
        window.authManager.setupEventListeners();
    }
} 