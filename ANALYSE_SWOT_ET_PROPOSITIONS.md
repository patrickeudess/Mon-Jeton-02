# 📊 Analyse complète, SWOT et Propositions — Mon Jeton

> Analyse réalisée le 17/07/2026 sur la base du code présent dans le dépôt.
> Objectif : identifier les points à améliorer (gaps), dresser une analyse SWOT
> et proposer une feuille de route priorisée.

---

## 1. Vue d'ensemble de l'application

**Mon Jeton** est une application PWA de gestion de budget et d'épargne adaptée
au contexte ouest-africain (FCFA, Mobile Money, tontines, catégories locales
comme « Aide familiale », « Tabaski », « Rentrée scolaire »).

| Composant | Technologie | État |
|---|---|---|
| Frontend | HTML/CSS/JS vanilla, ~15 pages | ✅ Fonctionnel (mode localStorage) |
| Graphiques | Plotly.js (embarqué, 4,5 Mo) | ✅ Fonctionnel mais très lourd |
| PWA | manifest.json + service-worker.js | ⚠️ Partiellement cassée (icônes manquantes) |
| Backend | FastAPI + SQLAlchemy + JWT | ❌ **Ne démarre pas** (fichiers manquants) |
| Stockage | localStorage (principal), API (fallback théorique) | ⚠️ Non sécurisé, non synchronisé |

**Positionnement fort** : l'ancrage local (Mobile Money, tontine, conseils
culturellement pertinents, français simple) est le vrai différenciateur du
produit face aux applications de budget génériques.

---

## 2. Gaps et points à améliorer

### 🔴 Critiques (bloquants ou risques majeurs)

#### 2.1 Le backend ne peut pas démarrer
- `backend/app/main.py:4` importe `from .models import Base` et
  `backend/app/auth.py:9-10` importe `.models` et `.schemas`, mais les fichiers
  **`models.py` et `schemas.py` n'existent pas** dans `backend/app/`.
- `backend/requirements.txt` et `backend/run.py` sont référencés dans le README
  (installation) mais **absents du dépôt**.
- Conséquence : toute la couche API décrite dans le README (auth JWT,
  transactions, budgets, objectifs) est inutilisable en l'état.

#### 2.2 Authentification factice côté client
- `login.html:497-543` : la connexion et l'inscription sont **simulées**. Aucun
  mot de passe n'est vérifié ; un jeton `'local_' + Date.now()` est créé et
  n'importe qui accède à l'application.
- `login.html:460-461` : le code SMS est codé en dur (`123456`).
- Le vrai flux d'authentification (`api-client.js` → `/auth/token`) existe mais
  n'est jamais branché sur le formulaire de `login.html`.

#### 2.3 Données sensibles stockées en clair
- `security.html:346` : le code PIN est stocké **en clair** dans
  `localStorage` (`security_pin`). N'importe quel script ou personne ayant
  accès au navigateur peut le lire.
- Toutes les données financières (transactions, budgets, épargne) sont en
  clair dans `localStorage` : perte totale si l'utilisateur vide son cache,
  aucun chiffrement, aucune sauvegarde automatique.
- Le README promet un « chiffrement des données » qui n'existe pas dans le code.

#### 2.4 Secret JWT par défaut en dur
- `backend/app/config.py:15` : `secret_key` a une valeur par défaut committée.
  Si le backend est déployé sans `.env`, tous les jetons sont forgeables.

### 🟠 Majeurs (dette technique et fiabilité)

#### 2.5 PWA cassée
- `manifest.json` et `service-worker.js` référencent `icon-192.png`,
  `icon-512.png` et 3 captures d'écran **qui n'existent pas** → l'installation
  PWA (« Ajouter à l'écran d'accueil ») échoue ou s'affiche sans icône, et
  `cache.addAll()` échoue à l'installation du service worker.
- Stratégie **cache-first pour tout** (`service-worker.js:58-91`) : une fois en
  cache, HTML et JS ne sont plus jamais mis à jour sans changer manuellement
  `CACHE_NAME`. Les utilisateurs restent bloqués sur d'anciennes versions.

#### 2.6 URL d'API codée en dur
- `api-client.js:7` et `auth-manager.js:37` pointent sur
  `http://localhost:8000`. En production, chaque page interroge localhost
  toutes les 30 secondes (`auth-manager.js:32`) → erreurs réseau en boucle.

#### 2.7 Dépôt encombré et incohérent
- **~30 fichiers `test_*.html`/`debug_*.html`** et **~20 fichiers Markdown de
  diagnostic** à la racine, mélangés au code de production (dont un doublon
  d'encodage : `test_boutons_epargne_actives.html` / `…activés.html`).
- `plotly.js` (4,5 Mo) committé dans le dépôt — à charger en CDN ou remplacer.
- **Pas de `.gitignore`**, pas de `LICENSE` ni `CONTRIBUTING.md` (pourtant
  cités dans le README).
- Doublons fonctionnels : `savings.html` (57 Ko) **et** `epargne.html`
  (40 Ko) coexistent ; `tontine.html` est décrit dans le README mais absent.
- Double identité : « Mon Jeton » côté frontend, « Mon Budget Malin » côté
  backend (`main.py:14`, `config.py:7`) et dans le cache SW
  (`mon-budget-malin-v1.0`).

#### 2.8 Duplication massive de code
- Chaque page HTML embarque son propre JavaScript inline (22 à 44 fonctions
  par page) : le chargement du nom d'utilisateur, les notifications, la
  navigation, le formatage monétaire sont réécrits dans chaque fichier.
- Clés localStorage incohérentes : `user_name` (partout) vs `userName`
  (`chatbot.js:32`) ; formatage tantôt manuel (`${x.toFixed(0)} FCFA`),
  tantôt via `Intl.NumberFormat` XOF (`app.js:253-259`).

#### 2.9 Failles XSS potentielles
- `dashboard.html:985-986` injecte `localStorage.getItem('user_name')` /
  `user_email` directement dans du HTML ; `auth-manager.js:242-248` injecte le
  paramètre `message` via `innerHTML`. Un nom d'utilisateur contenant du HTML
  s'exécute dans la page. À remplacer par `textContent` ou un échappement.

#### 2.10 Aucun test automatisé, aucune CI
- Les fichiers `test_*.html` sont des pages de vérification **manuelle**, pas
  des tests. Aucun framework de test, aucun linter, aucune CI/CD.

### 🟡 Mineurs (bugs et finitions)

- `app.js:88` : `updateQuickSummary()` ignore ses arguments, mais
  `auth-manager.js:161-166` l'appelle avec les transactions de l'API → les
  données API ne sont jamais affichées, seule la variable globale l'est.
- `auth-manager.js:279-346` : `OfflineManager` sauvegarde `pendingChanges`
  mais **n'appelle jamais `loadPendingChanges()` au démarrage** → les
  changements en attente sont perdus au rechargement de la page.
- `service-worker.js:196-203` : les événements `online`/`offline` n'existent
  pas dans un service worker (code mort).
- `security.html:299` : `localStorage.setItem('user_name')` sans valeur
  (appel invalide).
- L'import Mobile Money (`mobile-money.js`) et l'assistant IA sont des
  **simulations** ; le README les présente comme des fonctionnalités réelles.
- Accessibilité : pas d'attributs ARIA, contrastes non vérifiés, navigation
  clavier non testée.

---

## 3. Analyse SWOT

### ✅ Forces (Strengths)
| # | Force | Détail |
|---|---|---|
| S1 | **Ancrage local fort** | Catégories culturelles (aide familiale, Tabaski, dîmes), tontines, Mobile Money, français simple — rare sur le marché |
| S2 | **Fonctionne hors ligne** | Pas de compte requis, localStorage, PWA : adapté aux connexions instables et aux forfaits data limités |
| S3 | **Couverture fonctionnelle large** | Transactions, budgets, épargne, objectifs, badges/gamification, éducation financière, assistant |
| S4 | **Stack simple et gratuite** | HTML/JS vanilla : pas de build, déployable sur n'importe quel hébergement statique, maintenable sans expertise pointue |
| S5 | **Base backend saine sur le papier** | FastAPI + JWT + SQLAlchemy : bonnes fondations architecturales (une fois réparées) |

### ⚠️ Faiblesses (Weaknesses)
| # | Faiblesse | Détail |
|---|---|---|
| W1 | **Backend non fonctionnel** | Fichiers manquants (`models.py`, `schemas.py`, `requirements.txt`) — voir §2.1 |
| W2 | **Sécurité illusoire** | Auth simulée, PIN en clair, pas de chiffrement, secret JWT par défaut — critique pour une app financière |
| W3 | **Données volatiles** | Tout dans localStorage : vider le cache = tout perdre ; pas de sync multi-appareils |
| W4 | **Dette technique élevée** | Code dupliqué dans chaque page, ~50 fichiers de test/diagnostic à la racine, doublons de pages, incohérences de nommage |
| W5 | **PWA et performance dégradées** | Icônes manquantes, cache-first figé, Plotly 4,5 Mo (rédhibitoire en 3G) |
| W6 | **Aucune assurance qualité** | Pas de tests automatisés, pas de CI, pas de linter |

### 🚀 Opportunités (Opportunities)
| # | Opportunité | Détail |
|---|---|---|
| O1 | **Marché en forte croissance** | Taux de pénétration Mobile Money très élevé en Afrique de l'Ouest, peu d'outils de budget adaptés au contexte UEMOA/FCFA |
| O2 | **Intégrations Mobile Money réelles** | APIs Orange Money, MTN MoMo (MoMo API Developer), Wave : transformer la simulation en vraie valeur (import automatique des transactions) |
| O3 | **Tontines digitales** | Le module tontine (aujourd'hui absent) répond à une pratique massive et mal outillée — potentiel de différenciation n°1 |
| O4 | **Sync cloud légère** | Un backend managé (ex. Supabase/Firebase) offre auth + base + API + temps réel sans gérer de serveur — idéal pour une petite équipe |
| O5 | **Éducation financière** | Partenariats possibles (institutions de microfinance, ONG, opérateurs) autour du contenu éducatif existant |
| O6 | **Monétisation douce** | Version premium (rapports avancés, multi-comptes, export), sans publicité — cohérent avec le positionnement |

### 🛑 Menaces (Threats)
| # | Menace | Détail |
|---|---|---|
| T1 | **Applications des opérateurs** | Orange, MTN et Wave enrichissent leurs propres apps (historique, stats) et possèdent déjà les données de transaction |
| T2 | **Confiance et réputation** | Une fuite de données financières (PIN en clair, XSS) détruirait la confiance — risque existentiel pour une app de finance personnelle |
| T3 | **Réglementation** | Données financières personnelles : exigences de protection des données (lois nationales, BCEAO) si l'app passe au cloud |
| T4 | **Fragmentation des appareils** | Beaucoup d'appareils Android d'entrée de gamme : une app de 5 Mo+ au premier chargement exclut une partie de la cible |
| T5 | **Concurrence internationale** | Les apps de budget globales peuvent localiser (FCFA) plus vite que Mon Jeton ne peut se solidifier techniquement |

---

## 4. Propositions — feuille de route priorisée

### 🔥 Phase 0 — Assainir (1 à 2 semaines) : rendre le dépôt sain et honnête

1. **Trancher l'architecture** : deux options claires —
   - **Option A (recommandée court terme)** : assumer une app 100 % locale.
     Retirer le backend du dépôt (ou le déplacer dans une branche), retirer
     du README les promesses non tenues (chiffrement, API, sync).
   - **Option B** : réparer le backend — créer `models.py`, `schemas.py`,
     `requirements.txt`, `run.py`, brancher `login.html` sur `/auth/token`,
     et sortir la `secret_key` du code.
2. **Nettoyer le dépôt** : déplacer les `test_*.html`, `debug_*.html`,
   `verification_*.html` dans `tests-manuels/` et les `DIAGNOSTIC_*.md`,
   `CORRECTION_*.md`, `TEST_*.md`, `RESUME_*.md` dans `docs/archive/` ;
   supprimer les doublons (`test_boutons_epargne_activés.html`) ; ajouter
   `.gitignore`, `LICENSE` (MIT annoncé) et `CONTRIBUTING.md`.
3. **Réparer la PWA** : générer `icon-192.png` / `icon-512.png` (le SVG
   existe déjà : `logo.svg`), corriger `manifest.json`, et passer le service
   worker en **network-first pour les HTML/JS** (cache-first uniquement pour
   les assets statiques versionnés).
4. **Unifier l'identité** : choisir « Mon Jeton » partout (backend, cache SW,
   titres) et une seule page épargne (`epargne.html` OU `savings.html`).
5. **Corriger les bugs identifiés** : §2.9 (XSS → `textContent`), §2 « mineurs »
   (`updateQuickSummary`, `loadPendingChanges`, clé `userName`).

### 🛠️ Phase 1 — Consolider (1 à 2 mois) : qualité et sécurité réelles

6. **Factoriser le code** : extraire un `common.js` (ou passer aux modules ES)
   pour l'en-tête utilisateur, les notifications, le formatage FCFA
   (`Intl.NumberFormat` partout), l'accès aux données — une seule source de
   vérité au lieu de 15 copies.
7. **Sécuriser le PIN** : stocker un hash (SHA-256 via `crypto.subtle`) au
   lieu du PIN en clair ; ajouter un délai après échecs répétés.
8. **Protéger les données locales** : export/sauvegarde chiffrée (dérivation
   de clé depuis le PIN via PBKDF2 + AES-GCM avec `crypto.subtle`), et rappel
   régulier de sauvegarde à l'utilisateur.
9. **Alléger l'app** : remplacer Plotly (4,5 Mo) par une bibliothèque légère
   (Chart.js ~200 Ko, ou uPlot ~50 Ko) — gain décisif sur mobile 3G.
10. **Mettre en place les tests et la CI** : linter (ESLint), quelques tests
    unitaires sur la logique métier (calculs de solde, budgets, épargne) et
    une GitHub Action qui les exécute à chaque push.

### 🚀 Phase 2 — Différencier (3 à 6 mois) : la valeur unique

11. **Backend managé + sync** : brancher une solution type Supabase
    (auth réelle par téléphone/OTP, base Postgres, API auto-générée) pour la
    synchronisation multi-appareils, en gardant le mode hors ligne comme
    premier citoyen (sync différée type `OfflineManager`, à finir).
12. **Module tontine réel** : c'est le différenciateur n°1 annoncé et il
    n'existe pas (`tontine.html` absent). Gestion des membres, tours,
    contributions, rappels — même en mono-utilisateur d'abord.
13. **Import Mobile Money réel** : commencer pragmatique (lecture assistée des
    SMS ou saisie semi-automatique par raccourcis), puis explorer les APIs
    officielles MTN MoMo / Orange / Wave selon les accords possibles.
14. **Notifications utiles** : rappels de tontine, alertes de dépassement de
    budget, conseil du jour — l'infrastructure push du service worker existe
    déjà (`service-worker.js:102`).
15. **Accessibilité et inclusion** : audit contraste/ARIA, mode « données
    réduites », envisager des langues locales à terme.

### ⚡ Quick wins (réalisables immédiatement)

| Action | Effort | Impact |
|---|---|---|
| Générer les icônes PWA depuis `logo.svg` | 1 h | Installation PWA fonctionnelle |
| Ajouter `.gitignore` + `LICENSE` | 30 min | Dépôt propre et conforme au README |
| Déplacer les ~50 fichiers de test/diagnostic | 1 h | Lisibilité immédiate du projet |
| Remplacer les `innerHTML` à risque par `textContent` | 2 h | Fermeture des vecteurs XSS |
| Hacher le PIN (`crypto.subtle.digest`) | 2 h | Sécurité réelle du verrouillage |
| Rendre l'URL d'API configurable (et couper le ping localhost en prod) | 1 h | Plus d'erreurs réseau en boucle |
| Uniformiser le nom (« Mon Jeton ») et le formatage FCFA | 2 h | Cohérence produit |

---

## 5. Synthèse

L'application a un **positionnement produit excellent** (gestion de budget
culturellement ancrée, hors ligne d'abord) mais repose sur des **fondations
techniques fragiles** : backend inopérant, sécurité simulée, PWA cassée et
forte dette de duplication. La priorité n'est pas d'ajouter des
fonctionnalités mais de **fiabiliser l'existant** (Phase 0-1), puis d'investir
sur les deux différenciateurs qui justifient l'app face aux solutions des
opérateurs : **la tontine digitale et l'import Mobile Money réel** (Phase 2).
