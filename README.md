# 💰 Mon Jeton

**Application de gestion de budget et d'épargne intelligente adaptée au contexte local**

## 🚀 Fonctionnalités Principales

### 💳 **Gestion des Transactions**
- Ajout de revenus et dépenses avec catégories locales
- Import automatique Mobile Money (Orange Money, MTN MoMo, Wave)
- Historique détaillé avec filtres et recherche
- Raccourcis rapides pour les transactions fréquentes

### 📊 **Dashboard Analytique**
- Résumé financier en temps réel
- Graphiques interactifs (évolution, répartition)
- Analyses prédictives avancées
- Conseils personnalisés basés sur vos données

### 🎯 **Gestion des Budgets**
- Création de budgets par catégorie
- Suivi en temps réel avec alertes
- Modèles de budgets prêts à l'emploi
- Rapports de performance

### 👥 **Module Tontine/Épargne Collective**
- Gestion des tontines familiales et professionnelles
- Suivi des contributions et échéances
- Modèles pour Tabaski, rentrée scolaire, mariage
- Système de rappels automatiques

### 🏆 **Système de Badges et Défis**
- 8 badges culturels locaux
- Système de niveaux progressifs
- Défis motivants (épargne, budget, tontine)
- Gamification pour encourager l'utilisation

### 🔒 **Sécurité**
- Verrouillage PIN à 4 chiffres (stocké haché en SHA-256, jamais en clair)
- Paramètres de sécurité configurables
- Export/import des données au format JSON
- Historique des connexions

### 💡 **Micro-éducation Financière**
- Conseils contextuels quotidiens
- FAQ en français simple
- Conseils adaptés au contexte local
- Onboarding guidé (3 écrans)

## 🎨 **Design et Interface**

### 📱 **Interface Mobile-First**
- Design responsive optimisé mobile
- Navigation intuitive avec icônes
- Animations fluides et modernes
- Thème vert adapté au contexte

### 🎯 **Expérience Utilisateur**
- Onboarding guidé pour nouveaux utilisateurs
- Notifications contextuelles
- Interface épurée sans publicités
- Chargement rapide et performance optimisée

## 🛠️ **Technologies Utilisées**

### **Frontend**
- HTML5, CSS3, JavaScript (vanilla)
- Progressive Web App (PWA)
- Chart.js pour les graphiques (léger : ~200 Ko, fonctionne hors ligne)
- Service Worker pour le cache

### **Backend** (optionnel)
- FastAPI (Python)
- SQLite (développement) / PostgreSQL (production)
- JWT pour l'authentification
- API REST complète

### **Stockage**
- localStorage pour les données client
- Synchronisation cloud (optionnelle)
- Export/import JSON

## 📦 **Installation et Démarrage**

### **Option 1 : Utilisation Directe (Recommandée)**
1. Téléchargez les fichiers du projet
2. Ouvrez `index.html` dans votre navigateur
3. L'application fonctionne immédiatement hors ligne

### **Option 2 : Serveur Local**
```bash
# Installation du backend (optionnel)
cd backend
pip install -r requirements.txt
python run.py

# L'API sera disponible sur http://localhost:8000
```

### **Option 3 : Déploiement Web**
1. Uploadez les fichiers sur votre serveur web
2. Configurez HTTPS pour les fonctionnalités PWA
3. L'application sera accessible via votre domaine

## 📱 **Installation PWA**

### **Android (Chrome)**
1. Ouvrez l'application dans Chrome
2. Appuyez sur "Ajouter à l'écran d'accueil"
3. L'application apparaîtra comme une app native

### **iOS (Safari)**
1. Ouvrez l'application dans Safari
2. Appuyez sur "Partager" puis "Sur l'écran d'accueil"
3. L'application sera installée

## 🎯 **Fonctionnalités Locales**

### **Catégories Adaptées**
- Aide familiale
- Événements coutumiers
- Dîmes & offrandes
- Tabaski, rentrée scolaire, mariage

### **Services Mobile Money**
- Orange Money
- MTN MoMo
- Wave
- Intégration SMS (simulation)

### **Conseils Contextuels**
- Éviter les frais MoMo
- Épargne pour Tabaski
- Budget rentrée scolaire
- Tontine familiale

## 📊 **Structure du Projet**

```
mon_jeton/
├── index.html              # Page d'accueil principale
├── login.html              # Page de connexion/inscription
├── dashboard.html          # Dashboard analytique
├── transactions.html       # Gestion des transactions
├── budgets.html            # Gestion des budgets
├── security.html           # Paramètres de sécurité (PIN)
├── badges.html             # Système de badges
├── goals.html              # Objectifs d'épargne
├── tips.html               # Conseils financiers
├── savings.html            # Gestion de l'épargne
├── assistant.html          # Assistant financier
├── styles.css              # Styles principaux
├── enhanced-styles.css     # Styles avancés
├── modern-components.css   # Composants modernes
├── app.js                  # Logique principale
├── common.js               # Utilitaires partagés (graphiques, formatage, PWA)
├── chart.umd.js            # Chart.js (bibliothèque de graphiques, locale)
├── api-client.js           # Client API (backend optionnel)
├── auth-manager.js         # Authentification et synchronisation
├── manifest.json           # Configuration PWA
├── service-worker.js       # Service Worker
├── icon-192.png            # Icône PWA
├── icon-512.png            # Icône PWA
├── docs/                   # Guides et documents d'analyse
│   └── archive/            # Anciens documents de diagnostic
├── tests-manuels/          # Pages de test/vérification manuelles
└── backend/                # API backend (optionnel)
    ├── app/
    ├── requirements.txt
    └── run.py
```

## 🔧 **Configuration**

### **Variables d'Environnement** (Backend)
```bash
# backend/.env
DATABASE_URL=sqlite:///./mon_jeton.db
# Obligatoire en production. Sans SECRET_KEY, une clé aléatoire est générée
# à chaque démarrage et les sessions sont invalidées au redémarrage.
SECRET_KEY=votre_cle_secrete
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### **Personnalisation**
- Modifiez `styles.css` pour changer les couleurs
- Ajustez `manifest.json` pour le nom de l'app
- Configurez les catégories dans `app.js`

## 📈 **Fonctionnalités Avancées**

### **Analyses Prédictives**
- Prédiction des dépenses futures
- Analyse des tendances
- Recommandations d'épargne
- Score de santé financière

### **Gamification**
- Système de badges culturels
- Défis motivants
- Niveaux progressifs
- Récompenses visuelles

### **Sécurité**
- Verrouillage PIN (empreinte SHA-256)
- Export des données JSON
- Historique des connexions

## 🌍 **Adaptation Locale**

### **Contexte Culturel**
- Catégories adaptées aux traditions
- Conseils culturellement pertinents
- Modèles pour événements locaux
- Interface en français

### **Services Locaux**
- Intégration Mobile Money
- Conseils sur les frais locaux
- Modèles de tontine
- Événements coutumiers

## 📱 **Compatibilité**

### **Navigateurs Supportés**
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### **Appareils**
- Smartphones Android/iOS
- Tablettes
- Ordinateurs de bureau
- Fonctionne hors ligne

## 🚀 **Déploiement**

### **Hébergement Web**
1. Uploadez les fichiers sur votre serveur
2. Configurez HTTPS
3. L'application sera accessible via URL

### **Serveur Local**
```bash
# Python simple
python -m http.server 8000

# Node.js
npx serve .

# PHP
php -S localhost:8000
```

## ✅ **Tests et Intégration Continue**

### **Tests du backend**
```bash
cd backend
pip install -r requirements.txt -r requirements-dev.txt
pytest -v
```

### **CI GitHub Actions**
À chaque push : vérification de la syntaxe JavaScript, validité du manifest
PWA et exécution des tests de l'API (`.github/workflows/ci.yml`).

## 📞 **Support**

### **Documentation**
- Guide de démarrage rapide
- Documentation API (backend)
- Tutoriels vidéo (à venir)

### **Contact**
- Issues GitHub pour les bugs
- Discussions pour les suggestions
- Support communautaire

## 📄 **Licence**

Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails.

## 🤝 **Contribution**

Les contributions sont les bienvenues ! Consultez CONTRIBUTING.md pour les guidelines.

---

**Mon Jeton** - Gestion de budget intelligente adaptée au contexte local 🇨🇮 