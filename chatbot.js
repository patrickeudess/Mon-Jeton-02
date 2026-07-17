/*
 * Assistant conversationnel pour Mon Budget Malin
 * Chatbot intelligent en français pour aider l'utilisateur
 */

class BudgetAssistant {
    constructor() {
        this.conversation = [];
        this.userName = this.getUserName();
        this.initializeChatbot();
    }

    /**
     * Initialise le chatbot
     */
    initializeChatbot() {
        this.addMessage('assistant', `Bonjour ${this.userName} ! 👋 Je suis votre assistant budget personnel. Je peux vous aider à :
        
• 📊 Consulter vos dépenses et revenus
• 🎯 Suivre vos objectifs d'épargne
• 💡 Donner des conseils personnalisés
• 🏆 Proposer des défis d'épargne
• 📈 Analyser vos habitudes financières

Que souhaitez-vous savoir ?`);
    }

    /**
     * Récupère le nom de l'utilisateur depuis le stockage
     */
    getUserName() {
        const name = localStorage.getItem('user_name');
        return name || 'utilisateur';
    }

    /**
     * Traite un message de l'utilisateur
     */
    async processUserMessage(message) {
        const userMessage = message.toLowerCase().trim();
        
        // Ajoute le message utilisateur à la conversation
        this.addMessage('user', message);
        
        // Analyse l'intention du message
        const response = await this.analyzeMessage(userMessage);
        
        // Ajoute la réponse de l'assistant
        this.addMessage('assistant', response);
        
        return response;
    }

    /**
     * Analyse le message et génère une réponse appropriée
     */
    async analyzeMessage(message) {
        const transactions = this.loadTransactions();
        const budgets = this.loadBudgets();
        const goals = this.loadGoals();
        
        // Questions sur les dépenses
        if (this.containsKeywords(message, ['dépensé', 'dépense', 'combien', 'transport', 'nourriture', 'logement'])) {
            return this.analyzeExpenses(message, transactions);
        }
        
        // Questions sur les revenus
        if (this.containsKeywords(message, ['revenu', 'gagné', 'salaire', 'entrée'])) {
            return this.analyzeRevenues(message, transactions);
        }
        
        // Questions sur le solde
        if (this.containsKeywords(message, ['solde', 'reste', 'disponible', 'argent'])) {
            return this.analyzeBalance(transactions);
        }
        
        // Questions sur les budgets
        if (this.containsKeywords(message, ['budget', 'limite', 'dépassé'])) {
            return this.analyzeBudgets(transactions, budgets);
        }
        
        // Questions sur les objectifs
        if (this.containsKeywords(message, ['objectif', 'épargne', 'économiser', 'progression'])) {
            return this.analyzeGoals(goals);
        }
        
        // Demande de conseils
        if (this.containsKeywords(message, ['conseil', 'aide', 'astuce', 'comment'])) {
            return this.giveAdvice(transactions, budgets);
        }
        
        // Demande de défi
        if (this.containsKeywords(message, ['défi', 'challenge', 'challenger'])) {
            return this.suggestChallenge(transactions);
        }
        
        // Salutations
        if (this.containsKeywords(message, ['bonjour', 'salut', 'hello', 'coucou'])) {
            return `Bonjour ${this.userName} ! 😊 Comment puis-je vous aider aujourd'hui ?`;
        }
        
        // Message par défaut
        return this.getDefaultResponse();
    }

    /**
     * Analyse les dépenses selon la demande
     */
    analyzeExpenses(message, transactions) {
        const currentMonth = new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0');
        const monthlyExpenses = transactions.filter(t => 
            t.type === 'depense' && t.date.startsWith(currentMonth)
        );
        
        // Recherche de catégorie spécifique
        const categories = ['transport', 'nourriture', 'logement', 'communication', 'santé', 'divers'];
        for (const category of categories) {
            if (message.includes(category)) {
                const categoryExpenses = monthlyExpenses.filter(t => 
                    t.category.toLowerCase() === category
                );
                const total = categoryExpenses.reduce((sum, t) => sum + t.amount, 0);
                
                if (total > 0) {
                    return `💰 Ce mois-ci, vous avez dépensé ${total.toFixed(0)} FCFA en ${category}.
                    
📊 Détail des dépenses :
${categoryExpenses.map(t => `• ${t.description || t.category} : ${t.amount.toFixed(0)} FCFA`).join('\n')}`;
                } else {
                    return `✅ Excellente nouvelle ! Vous n'avez pas encore dépensé en ${category} ce mois-ci. Continuez comme ça !`;
                }
            }
        }
        
        // Total des dépenses du mois
        const totalExpenses = monthlyExpenses.reduce((sum, t) => sum + t.amount, 0);
        const totalRevenues = transactions.filter(t => 
            t.type === 'revenu' && t.date.startsWith(currentMonth)
        ).reduce((sum, t) => sum + t.amount, 0);
        
        return `📊 Voici un résumé de vos dépenses ce mois-ci :

💰 Total dépensé : ${totalExpenses.toFixed(0)} FCFA
💵 Total gagné : ${totalRevenues.toFixed(0)} FCFA
💳 Solde : ${(totalRevenues - totalExpenses).toFixed(0)} FCFA

${totalExpenses > totalRevenues ? '⚠️ Attention : vos dépenses dépassent vos revenus. Pensez à réduire vos dépenses !' : '✅ Excellent ! Vos revenus dépassent vos dépenses.'}`;
    }

    /**
     * Analyse les revenus
     */
    analyzeRevenues(message, transactions) {
        const currentMonth = new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0');
        const monthlyRevenues = transactions.filter(t => 
            t.type === 'revenu' && t.date.startsWith(currentMonth)
        );
        
        const total = monthlyRevenues.reduce((sum, t) => sum + t.amount, 0);
        
        if (total > 0) {
            return `💵 Ce mois-ci, vous avez gagné ${total.toFixed(0)} FCFA.

📊 Détail de vos revenus :
${monthlyRevenues.map(t => `• ${t.description || t.category} : ${t.amount.toFixed(0)} FCFA`).join('\n')}`;
        } else {
            return `📝 Vous n'avez pas encore enregistré de revenus ce mois-ci. N'oubliez pas d'ajouter vos entrées d'argent !`;
        }
    }

    /**
     * Analyse le solde
     */
    analyzeBalance(transactions) {
        const totalRevenues = transactions.filter(t => t.type === 'revenu')
            .reduce((sum, t) => sum + t.amount, 0);
        const totalExpenses = transactions.filter(t => t.type === 'depense')
            .reduce((sum, t) => sum + t.amount, 0);
        const balance = totalRevenues - totalExpenses;
        
        if (balance > 0) {
            return `✅ Excellent ! Votre solde est positif de ${balance.toFixed(0)} FCFA.

💰 Total revenus : ${totalRevenues.toFixed(0)} FCFA
💸 Total dépenses : ${totalExpenses.toFixed(0)} FCFA
💳 Solde : ${balance.toFixed(0)} FCFA

Continuez comme ça ! 🎉`;
        } else {
            return `⚠️ Attention : votre solde est négatif de ${Math.abs(balance).toFixed(0)} FCFA.

💰 Total revenus : ${totalRevenues.toFixed(0)} FCFA
💸 Total dépenses : ${totalExpenses.toFixed(0)} FCFA
💳 Solde : ${balance.toFixed(0)} FCFA

Conseils pour améliorer votre situation :
• Réduisez vos dépenses non essentielles
• Cherchez des sources de revenus supplémentaires
• Établissez un budget strict`;
        }
    }

    /**
     * Analyse les budgets
     */
    analyzeBudgets(transactions, budgets) {
        const currentMonth = new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0');
        const monthlyExpenses = transactions.filter(t => 
            t.type === 'depense' && t.date.startsWith(currentMonth)
        );
        
        const expensesByCategory = {};
        monthlyExpenses.forEach(t => {
            expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
        });
        
        let response = '📊 Analyse de vos budgets ce mois-ci :\n\n';
        let hasOverBudget = false;
        
        Object.keys(budgets).forEach(category => {
            const budget = budgets[category];
            const spent = expensesByCategory[category] || 0;
            
            if (budget > 0) {
                const percentage = (spent / budget) * 100;
                const status = percentage > 100 ? '🔴' : percentage > 80 ? '🟡' : '🟢';
                
                response += `${status} ${category} : ${spent.toFixed(0)}/${budget.toFixed(0)} FCFA (${percentage.toFixed(1)}%)\n`;
                
                if (percentage > 100) {
                    hasOverBudget = true;
                }
            }
        });
        
        if (hasOverBudget) {
            response += '\n⚠️ Certaines catégories dépassent leur budget. Pensez à ajuster vos dépenses !';
        } else {
            response += '\n✅ Tous vos budgets sont respectés. Bravo !';
        }
        
        return response;
    }

    /**
     * Analyse les objectifs
     */
    analyzeGoals(goals) {
        if (!goals || goals.length === 0) {
            return `🎯 Vous n'avez pas encore d'objectifs d'épargne définis.

💡 Créez votre premier objectif pour :
• Acheter quelque chose que vous désirez
• Préparer un voyage
• Constituer une épargne d'urgence
• Investir dans votre avenir

Voulez-vous que je vous aide à créer un objectif ?`;
        }
        
        let response = '🎯 Voici vos objectifs d\'épargne :\n\n';
        
        goals.forEach(goal => {
            const progress = (goal.saved / goal.target) * 100;
            const remaining = goal.target - goal.saved;
            const status = progress >= 100 ? '✅' : progress >= 75 ? '🟡' : '🔴';
            
            response += `${status} ${goal.name} : ${goal.saved.toFixed(0)}/${goal.target.toFixed(0)} FCFA (${progress.toFixed(1)}%)
💰 Reste à épargner : ${remaining.toFixed(0)} FCFA\n\n`;
        });
        
        return response;
    }

    /**
     * Donne des conseils personnalisés
     */
    giveAdvice(transactions, budgets) {
        const totalRevenues = transactions.filter(t => t.type === 'revenu')
            .reduce((sum, t) => sum + t.amount, 0);
        const totalExpenses = transactions.filter(t => t.type === 'depense')
            .reduce((sum, t) => sum + t.amount, 0);
        const balance = totalRevenues - totalExpenses;
        
        let advice = '💡 Voici mes conseils personnalisés :\n\n';
        
        if (balance < 0) {
            advice += '⚠️ Votre solde est négatif. Mes conseils :\n';
            advice += '• Identifiez vos dépenses non essentielles\n';
            advice += '• Établissez un budget strict\n';
            advice += '• Cherchez des revenus supplémentaires\n';
            advice += '• Utilisez la règle 50/30/20\n';
        } else if (balance < totalRevenues * 0.1) {
            advice += '💰 Votre épargne est faible. Mes conseils :\n';
            advice += '• Épargnez au moins 10% de vos revenus\n';
            advice += '• Automatisez vos transferts d\'épargne\n';
            advice += '• Créez un fonds d\'urgence\n';
            advice += '• Investissez dans votre avenir\n';
        } else {
            advice += '✅ Excellente gestion ! Mes conseils :\n';
            advice += '• Continuez vos bonnes habitudes\n';
            advice += '• Diversifiez vos investissements\n';
            advice += '• Planifiez vos objectifs à long terme\n';
            advice += '• Partagez vos astuces avec d\'autres\n';
        }
        
        return advice;
    }

    /**
     * Propose un défi d'épargne
     */
    suggestChallenge(transactions) {
        const challenges = [
            {
                name: 'Défi 7 jours sans dépenses non essentielles',
                description: 'Pendant une semaine, ne dépensez que pour les besoins essentiels (nourriture, transport, logement).',
                reward: 'Badge "Économe" 🏆'
            },
            {
                name: 'Défi Épargne 20%',
                description: 'Épargnez 20% de vos revenus ce mois-ci.',
                reward: 'Badge "Épargnant" 💰'
            },
            {
                name: 'Défi Cuisine Maison',
                description: 'Préparez tous vos repas à la maison pendant 2 semaines.',
                reward: 'Badge "Chef Économe" 👨‍🍳'
            },
            {
                name: 'Défi Transport Éco',
                description: 'Utilisez uniquement les transports en commun ou le vélo pendant 1 semaine.',
                reward: 'Badge "Éco-Mobile" 🚲'
            }
        ];
        
        const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
        
        return `🏆 Voici votre défi du jour :

🎯 ${randomChallenge.name}
📝 ${randomChallenge.description}
🏅 Récompense : ${randomChallenge.reward}

Voulez-vous accepter ce défi ? Je vous encouragerai tout au long ! 💪`;
    }

    /**
     * Vérifie si le message contient certains mots-clés
     */
    containsKeywords(message, keywords) {
        return keywords.some(keyword => message.includes(keyword));
    }

    /**
     * Réponse par défaut
     */
    getDefaultResponse() {
        const responses = [
            `Je ne suis pas sûr de comprendre. Pouvez-vous reformuler ? 🤔`,
            `Désolé, je n'ai pas saisi votre demande. Essayez de me poser une question plus précise ! 😊`,
            `Je peux vous aider avec vos dépenses, revenus, budgets, objectifs ou vous donner des conseils. Que souhaitez-vous savoir ? 📊`,
            `N'hésitez pas à me demander : "Combien ai-je dépensé en transport ?" ou "Comment va mon budget ?" 💡`
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }

    /**
     * Ajoute un message à la conversation
     */
    addMessage(sender, content) {
        this.conversation.push({
            sender: sender,
            content: content,
            timestamp: new Date()
        });
        
        // Limite la conversation à 50 messages
        if (this.conversation.length > 50) {
            this.conversation = this.conversation.slice(-50);
        }
    }

    /**
     * Charge les transactions depuis le stockage
     */
    loadTransactions() {
        try {
            const data = JSON.parse(localStorage.getItem('transactions'));
            return Array.isArray(data) ? data : [];
        } catch (e) {
            return [];
        }
    }

    /**
     * Charge les budgets depuis le stockage
     */
    loadBudgets() {
        try {
            const data = JSON.parse(localStorage.getItem('budgets'));
            return data && typeof data === 'object' ? data : {};
        } catch (e) {
            return {};
        }
    }

    /**
     * Charge les objectifs depuis le stockage
     */
    loadGoals() {
        try {
            const data = JSON.parse(localStorage.getItem('goals'));
            return Array.isArray(data) ? data : [];
        } catch (e) {
            return [];
        }
    }

    /**
     * Obtient l'historique de conversation
     */
    getConversation() {
        return this.conversation;
    }

    /**
     * Efface l'historique de conversation
     */
    clearConversation() {
        this.conversation = [];
        this.initializeChatbot();
    }

    /**
     * Génère des recommandations basées sur les données utilisateur
     */
    generateRecommendations(transactions, budgets) {
        const recommendations = [];
        
        // Analyse des dépenses
        const expenses = transactions.filter(t => t.type === 'depense');
        const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
        const totalRevenues = transactions.filter(t => t.type === 'revenu').reduce((sum, t) => sum + t.amount, 0);
        
        if (totalExpenses === 0 && totalRevenues === 0) {
            recommendations.push({
                type: 'info',
                icon: '👋',
                title: 'Bienvenue !',
                message: 'Commencez par ajouter vos premières transactions pour recevoir des recommandations personnalisées.'
            });
            return recommendations;
        }
        // ... reste du code ...
    }
}

// Export pour utilisation dans d'autres fichiers
window.BudgetAssistant = BudgetAssistant; 