// Variables globales
let conversationHistory = [];
let isTyping = false;

// Base de connaissances pour l'assistant IA
const knowledgeBase = {
    // Épargne
    'épargne': {
        keywords: ['épargne', 'épargner', 'économies', 'économiser', 'optimiser'],
        responses: [
            "💡 **Règle d'or de l'épargne :** Épargnez au moins 20% de vos revenus chaque mois. Commencez par de petits montants et augmentez progressivement.",
            "🎯 **Méthode 50/30/20 :** 50% pour les besoins essentiels, 30% pour les envies, 20% pour l'épargne.",
            "📱 **Astuce Mobile Money :** Utilisez les transferts gratuits entre comptes Orange Money pour éviter les frais.",
            "🏦 **Épargne automatique :** Configurez des virements automatiques vers votre compte d'épargne dès réception de votre salaire.",
            "📊 **Suivi régulier :** Utilisez Mon Jeton pour suivre vos progrès d'épargne et rester motivé."
        ]
    },
    
    // Budget
    'budget': {
        keywords: ['budget', 'gérer', 'planification', 'dépenses', 'revenus'],
        responses: [
            "📊 **Créez un budget réaliste :** Commencez par lister tous vos revenus et dépenses fixes.",
            "📝 **Suivez vos dépenses :** Enregistrez chaque transaction dans Mon Jeton pour identifier vos habitudes.",
            "🎯 **Objectifs SMART :** Spécifiques, Mesurables, Atteignables, Réalistes et Temporels.",
            "📅 **Révision mensuelle :** Analysez votre budget chaque mois et ajustez selon vos besoins.",
            "💡 **Astuce :** Gardez toujours un fonds d'urgence équivalent à 3-6 mois de dépenses."
        ]
    },
    
    // Réduction des dépenses
    'dépenses': {
        keywords: ['réduire', 'dépenses', 'économies', 'couper', 'diminuer'],
        responses: [
            "🔍 **Audit de vos dépenses :** Identifiez les postes où vous dépensez le plus et cherchez des alternatives.",
            "📱 **Optimisez Mobile Money :** Évitez les retraits fréquents, utilisez les transferts gratuits.",
            "🏠 **Économies domestiques :** Éteignez les lumières, utilisez des ampoules LED, réparez les fuites d'eau.",
            "🚗 **Transport :** Privilégiez les transports en commun, le covoiturage ou la marche.",
            "🍽️ **Alimentation :** Planifiez vos repas, achetez en gros, évitez les restaurants fréquents."
        ]
    },
    
    // Investissements
    'investissement': {
        keywords: ['investir', 'investissement', 'placement', 'rendement', 'risque'],
        responses: [
            "📈 **Diversification :** Ne mettez pas tous vos œufs dans le même panier. Diversifiez vos investissements.",
            "🏦 **Épargne bancaire :** Commencez par des comptes d'épargne à taux avantageux.",
            "📊 **Étudiez avant d'investir :** Comprenez bien le produit avant d'investir votre argent.",
            "⚠️ **Gestion du risque :** N'investissez que ce que vous pouvez vous permettre de perdre.",
            "📚 **Formation continue :** Lisez des livres sur la finance personnelle et suivez l'actualité économique."
        ]
    },
    
    // Mobile Money
    'mobile money': {
        keywords: ['mobile money', 'orange money', 'mtn momo', 'wave', 'transfert'],
        responses: [
            "📱 **Orange Money :** Utilisez les transferts gratuits entre comptes Orange Money pour économiser.",
            "💳 **MTN MoMo :** Profitez des promotions et réductions sur les paiements marchands.",
            "🌊 **Wave :** Service gratuit pour les transferts entre utilisateurs Wave.",
            "🔒 **Sécurité :** Ne partagez jamais vos codes PIN et activez l'authentification à deux facteurs.",
            "📊 **Suivi :** Gardez des traces de toutes vos transactions pour un meilleur contrôle."
        ]
    },
    
    // Pièges financiers
    'pièges': {
        keywords: ['pièges', 'éviter', 'dangers', 'risques', 'arnaques', 'sécurité', 'protéger'],
        responses: [
            "🚨 **Arnaques en ligne :** Ne cliquez jamais sur des liens suspects dans vos SMS ou emails.",
            "💳 **Dettes à la consommation :** Évitez les crédits à taux élevés pour des achats non essentiels.",
            "📱 **Codes PIN :** Ne partagez jamais vos codes PIN, même avec des proches.",
            "🎰 **Jeux d'argent :** Évitez les paris et jeux d'argent qui peuvent créer une dépendance.",
            "📞 **Appels frauduleux :** Méfiez-vous des appels demandant vos informations bancaires."
        ]
    },
    
    // Général
    'général': {
        keywords: ['aide', 'conseil', 'question', 'comment'],
        responses: [
            "💡 **Conseil général :** Commencez par établir un budget et épargner régulièrement.",
            "📱 **Utilisez Mon Jeton :** Notre application vous aide à suivre vos finances efficacement.",
            "🎯 **Fixez des objectifs :** Définissez des objectifs financiers clairs et mesurables.",
            "📚 **Formation :** Lisez des livres sur la finance personnelle pour améliorer vos connaissances.",
            "🔄 **Révision régulière :** Analysez vos finances mensuellement et ajustez votre stratégie."
        ]
    }
};

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    loadConversationHistory();
    autoResizeTextarea();
    if (window.location.hash === '#apprendre') showLearningPanel();
});

function showLearningPanel() {
    document.getElementById('learning-panel').classList.add('active');
    document.getElementById('chat-messages').style.display = 'none';
    document.querySelector('.chat-input').style.display = 'none';
    document.getElementById('learning-toggle').textContent = '💬 Discussion';
    document.getElementById('learning-toggle').onclick = showConversation;
}

function showConversation() {
    document.getElementById('learning-panel').classList.remove('active');
    document.getElementById('chat-messages').style.display = '';
    document.querySelector('.chat-input').style.display = '';
    document.getElementById('learning-toggle').textContent = '💡 Apprendre';
    document.getElementById('learning-toggle').onclick = showLearningPanel;
    window.location.hash = '';
}

function openLearningTopic(question) {
    showConversation();
    askQuestion(question);
}

// Fonction pour poser une question via les boutons rapides
function askQuestion(question) {
    document.getElementById('message-input').value = question;
    sendMessage();
}

// Fonction pour envoyer un message
function sendMessage() {
    const input = document.getElementById('message-input');
    const message = input.value.trim();
    
    if (!message || isTyping) return;
    
    // Ajouter le message de l'utilisateur
    addMessage(message, 'user');
    input.value = '';
    autoResizeTextarea();
    
    // Simuler la réponse de l'IA
    setTimeout(() => {
        const response = generateResponse(message);
        addMessage(response, 'assistant');
    }, 1000 + Math.random() * 2000); // Délai aléatoire pour simuler la réflexion
    
    // Sauvegarder la conversation
    saveConversationHistory();
}

// Fonction pour ajouter un message dans le chat
function addMessage(content, sender) {
    const messagesContainer = document.getElementById('chat-messages');
    
    // Supprimer le message de bienvenue si c'est le premier message
    const welcomeMessage = messagesContainer.querySelector('.welcome-message');
    if (welcomeMessage) {
        welcomeMessage.remove();
    }
    
    // Créer le message
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = sender === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.innerHTML = content;
    
    const messageTime = document.createElement('div');
    messageTime.className = 'message-time';
    messageTime.textContent = new Date().toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    messageContent.appendChild(messageTime);
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(messageContent);
    
    messagesContainer.appendChild(messageDiv);
    
    // Scroll vers le bas
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Ajouter à l'historique
    conversationHistory.push({
        content: content,
        sender: sender,
        timestamp: new Date().toISOString()
    });
}

// Fonction pour générer une réponse intelligente
function generateResponse(userMessage) {
    const message = userMessage.toLowerCase();
    
    // Chercher la catégorie correspondante
    let bestMatch = 'général';
    let maxScore = 0;
    
    for (const [category, data] of Object.entries(knowledgeBase)) {
        const score = data.keywords.reduce((total, keyword) => {
            return total + (message.includes(keyword.toLowerCase()) ? 1 : 0);
        }, 0);
        
        if (score > maxScore) {
            maxScore = score;
            bestMatch = category;
        }
    }
    
    // Sélectionner une réponse aléatoire de la catégorie
    const responses = knowledgeBase[bestMatch].responses;
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    // Ajouter des suggestions de suivi
    const followUpSuggestions = generateFollowUpSuggestions(bestMatch);
    
    return randomResponse + followUpSuggestions;
}

// Fonction pour générer des suggestions de suivi
function generateFollowUpSuggestions(category) {
    const suggestions = {
        'épargne': [
            "\n\n💡 **Questions suivantes :**",
            "• Comment créer un fonds d'urgence ?",
            "• Quels sont les meilleurs comptes d'épargne ?",
            "• Comment épargner pour un objectif spécifique ?"
        ],
        'budget': [
            "\n\n💡 **Questions suivantes :**",
            "• Comment créer un budget familial ?",
            "• Quels outils pour suivre mes dépenses ?",
            "• Comment gérer les dépenses imprévues ?"
        ],
        'dépenses': [
            "\n\n💡 **Questions suivantes :**",
            "• Comment économiser sur l'alimentation ?",
            "• Quelles alternatives aux services payants ?",
            "• Comment négocier mes factures ?"
        ],
        'investissement': [
            "\n\n💡 **Questions suivantes :**",
            "• Quels sont les risques des investissements ?",
            "• Comment débuter en bourse ?",
            "• Quels placements pour débutants ?"
        ],
        'mobile money': [
            "\n\n💡 **Questions suivantes :**",
            "• Comment sécuriser mon compte Mobile Money ?",
            "• Quels sont les frais cachés ?",
            "• Comment optimiser mes transferts ?"
        ],
        'pièges': [
            "\n\n💡 **Questions suivantes :**",
            "• Comment reconnaître une arnaque ?",
            "• Comment protéger mes informations ?",
            "• Que faire en cas de fraude ?"
        ],
        'général': [
            "\n\n💡 **Questions suivantes :**",
            "• Comment créer un plan financier ?",
            "• Quels sont mes droits en tant que consommateur ?",
            "• Comment préparer ma retraite ?"
        ]
    };
    
    return suggestions[category] ? suggestions[category].join('\n') : '';
}

// Fonction pour gérer les touches du clavier
function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

// Fonction pour redimensionner automatiquement le textarea
function autoResizeTextarea() {
    const textarea = document.getElementById('message-input');
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
}

// Fonction pour sauvegarder l'historique de conversation
function saveConversationHistory() {
    localStorage.setItem('assistant_conversation', JSON.stringify(conversationHistory));
}

// Fonction pour charger l'historique de conversation
function loadConversationHistory() {
    const saved = localStorage.getItem('assistant_conversation');
    if (saved) {
        conversationHistory = JSON.parse(saved);
        
        // Afficher les messages sauvegardés
        const messagesContainer = document.getElementById('chat-messages');
        messagesContainer.innerHTML = ''; // Supprimer le message de bienvenue
        
        conversationHistory.forEach(msg => {
            addMessage(msg.content, msg.sender);
        });
    }
}

// Fonction pour effacer l'historique
function clearConversationHistory() {
    if (confirm('Êtes-vous sûr de vouloir effacer tout l\'historique de conversation ?')) {
        conversationHistory = [];
        localStorage.removeItem('assistant_conversation');
        
        const messagesContainer = document.getElementById('chat-messages');
        messagesContainer.innerHTML = `
            <div class="welcome-message">
                <i class="fas fa-robot"></i>
                <h3>Bonjour ! 👋</h3>
                <p>Je suis votre assistant IA financier. Posez-moi vos questions sur l'épargne, le budget, les investissements ou tout autre sujet financier.</p>
            </div>
        `;
    }
}

// Fonction pour exporter la conversation
function exportConversation() {
    const conversationText = conversationHistory.map(msg => {
        const time = new Date(msg.timestamp).toLocaleString('fr-FR');
        const sender = msg.sender === 'user' ? 'Vous' : 'Assistant IA';
        return `[${time}] ${sender}: ${msg.content}`;
    }).join('\n\n');
    
    const blob = new Blob([conversationText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation_assistant_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

// Fonction pour afficher des statistiques
function showConversationStats() {
    const totalMessages = conversationHistory.length;
    const userMessages = conversationHistory.filter(msg => msg.sender === 'user').length;
    const assistantMessages = conversationHistory.filter(msg => msg.sender === 'assistant').length;
    
    const stats = `
        📊 **Statistiques de la conversation :**
        
        💬 Messages totaux : ${totalMessages}
        👤 Vos messages : ${userMessages}
        🤖 Réponses IA : ${assistantMessages}
        
        📅 Première conversation : ${conversationHistory.length > 0 ? 
            new Date(conversationHistory[0].timestamp).toLocaleDateString('fr-FR') : 'Aucune'}
    `;
    
    addMessage(stats, 'assistant');
}

// Fonction pour afficher l'aide
function showHelp() {
    const help = `
        🤖 **Guide d'utilisation de l'Assistant IA :**
        
        💡 **Comment poser une question :**
        • Tapez votre question dans la zone de texte
        • Utilisez les boutons rapides à gauche
        • Appuyez sur Entrée pour envoyer
        
        🎯 **Sujets que je peux traiter :**
        • Épargne et économies
        • Gestion du budget
        • Réduction des dépenses
        • Conseils d'investissement
        • Mobile Money (Orange Money, MTN MoMo, Wave)
        • Pièges financiers à éviter
        
        📱 **Fonctionnalités :**
        • Historique de conversation sauvegardé
        • Réponses personnalisées
        • Suggestions de questions suivantes
        • Interface responsive
        
        💾 **Commandes spéciales :**
        • "statistiques" - Afficher les stats
        • "aide" - Afficher ce guide
        • "effacer" - Effacer l'historique
        • "exporter" - Exporter la conversation
    `;
    
    addMessage(help, 'assistant');
}

// Écouter les commandes spéciales
document.addEventListener('DOMContentLoaded', function() {
    const originalSendMessage = window.sendMessage;
    
    window.sendMessage = function() {
        const input = document.getElementById('message-input');
        const message = input.value.trim().toLowerCase();
        
        // Commandes spéciales
        if (message === 'statistiques') {
            showConversationStats();
            input.value = '';
            return;
        }
        
        if (message === 'aide') {
            showHelp();
            input.value = '';
            return;
        }
        
        if (message === 'effacer') {
            clearConversationHistory();
            input.value = '';
            return;
        }
        
        if (message === 'exporter') {
            exportConversation();
            input.value = '';
            return;
        }
        
        // Appel de la fonction originale
        originalSendMessage();
    };
});

// Fonction pour afficher l'indicateur de frappe
function showTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    indicator.style.display = 'flex';
}

// Fonction pour masquer l'indicateur de frappe
function hideTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    indicator.style.display = 'none';
}

// Fonction pour obtenir des conseils personnalisés basés sur les données utilisateur
function getPersonalizedAdvice() {
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const savings = JSON.parse(localStorage.getItem('savings') || '[]');
    const budgets = JSON.parse(localStorage.getItem('budgets') || '{}');
    
    let advice = "🎯 **Conseils personnalisés basés sur vos données :**\n\n";
    
    // Analyser les transactions
    if (transactions.length > 0) {
        const totalIncome = transactions
            .filter(t => t.type === 'revenu')
            .reduce((sum, t) => sum + parseFloat(t.montant || 0), 0);
        
        const totalExpenses = transactions
            .filter(t => t.type === 'depense')
            .reduce((sum, t) => sum + parseFloat(t.montant || 0), 0);
        
        const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1) : 0;
        
        advice += `💰 **Taux d'épargne actuel :** ${savingsRate}%\n`;
        
        if (savingsRate < 20) {
            advice += "💡 **Suggestion :** Essayez d'épargner au moins 20% de vos revenus.\n";
        } else {
            advice += "✅ **Excellent !** Vous épargnez suffisamment.\n";
        }
    }
    
    // Analyser les objectifs d'épargne
    if (savings.length > 0) {
        const activeGoals = savings.filter(s => s.statut === 'actif').length;
        advice += `\n🎯 **Objectifs d'épargne actifs :** ${activeGoals}\n`;
        
        if (activeGoals === 0) {
            advice += "💡 **Suggestion :** Créez un objectif d'épargne pour rester motivé.\n";
        }
    }
    
    // Conseils généraux
    advice += "\n📱 **Utilisez Mon Jeton régulièrement** pour suivre vos progrès financiers.";
    
    return advice;
}

// Fonction pour demander des conseils personnalisés
function askForPersonalizedAdvice() {
    const advice = getPersonalizedAdvice();
    addMessage(advice, 'assistant');
}

// Ajouter les fonctions globales
window.askQuestion = askQuestion;
window.sendMessage = sendMessage;
window.clearConversationHistory = clearConversationHistory;
window.exportConversation = exportConversation;
window.showConversationStats = showConversationStats;
window.showHelp = showHelp;
window.askForPersonalizedAdvice = askForPersonalizedAdvice;
