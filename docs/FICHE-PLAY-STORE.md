# 🏬 Fiche Google Play Store — Mon Jeton

Contenu **prêt à copier-coller** dans la Google Play Console (onglet *Présence
sur le Store → Fiche principale du Store*), avec le plan des captures d'écran et
les réponses au formulaire *Sécurité des données*.

> Langue par défaut de la fiche : **français (France) — fr-FR**.
> Ajouter éventuellement une localisation **fr-CI** identique pour la Côte d'Ivoire.

---

## 1. Métadonnées de base

| Champ Play Console | Valeur | Contrainte |
|---|---|---|
| Nom de l'application | `Mon Jeton` | ≤ 30 caractères ✅ (9) |
| Nom du package | `ci.monjeton.app` | définitif, ne jamais changer |
| Catégorie de l'application | **Finance** | |
| Tags (jusqu'à 5) | Budget, Épargne, Tontine, Mobile Money, Finances personnelles | |
| Type d'application | Application (gratuite) | |
| Contient des annonces | **Non** | |
| Achats intégrés | **Non** | |
| Adresse e-mail de contact | *(à renseigner par l'éditeur)* | obligatoire |
| Site web | `https://patrickeudess.github.io/Mon-Jeton-02/` *(à confirmer)* | facultatif |
| Politique de confidentialité | URL publique de `privacy.html` *(voir §7)* | **obligatoire** |

---

## 2. Description courte (≤ 80 caractères)

**Option retenue** (73 car.) :

```
Budget, épargne et tontine : gérez votre argent, même hors ligne.
```

Variantes selon le message à mettre en avant :

- `Gérez budget, épargne et tontine. Simple, en français, sans publicité.` (69)
- `Suivez vos dépenses Mobile Money et votre tontine, hors ligne et gratuit.` (73)
- `Votre budget et vos tontines dans une seule appli, adaptée au contexte local.` (77)

---

## 3. Description complète (≤ 4000 caractères)

> À coller telle quelle. ~1 900 caractères, marge confortable.

```
Mon Jeton est une application simple et gratuite pour gérer votre argent au quotidien : suivre votre budget, mettre de l'argent de côté et organiser vos tontines. Pensée pour le contexte local et disponible en français, elle fonctionne même sans connexion Internet et n'affiche aucune publicité.

💳 SUIVEZ VOS DÉPENSES ET REVENUS
• Enregistrez rapidement vos entrées et sorties d'argent
• Catégories adaptées à la vie de tous les jours (aide familiale, événements, école, dîmes et offrandes…)
• Repérez vos frais Mobile Money (Orange Money, MTN MoMo, Wave)
• Historique clair avec filtres et recherche

📊 UN TABLEAU DE BORD QUI PARLE
• Vue d'ensemble de votre situation en temps réel
• Graphiques d'évolution et de répartition de vos dépenses
• Conseils personnalisés selon vos habitudes

🎯 DES BUDGETS ET DES OBJECTIFS
• Créez un budget par catégorie et suivez-le en un coup d'œil
• Fixez des objectifs d'épargne (Tabaski, rentrée scolaire, mariage, projet…)
• Recevez des alertes avant de dépasser votre budget

👥 TONTINE ET ÉPARGNE COLLECTIVE
• Gérez vos tontines familiales ou professionnelles
• Suivez les cotisations, les tours et les échéances
• Modèles prêts à l'emploi pour les grands moments de l'année

🏆 RESTEZ MOTIVÉ
• Badges et défis pour garder de bonnes habitudes
• Niveaux progressifs et récompenses

🔒 VOS DONNÉES VOUS APPARTIENNENT
• Verrouillage par code PIN
• Vos données restent sur votre téléphone ; la synchronisation avec un compte est optionnelle
• Exportez ou supprimez vos données quand vous le voulez

💡 APPRENEZ EN DOUCEMENT
• Conseils financiers courts et concrets
• Astuces pour éviter les frais et mieux épargner

Le petit plus : mode sombre automatique, chargement rapide et une interface épurée, sans publicité.

⚠️ Important : Mon Jeton est un outil de suivi. L'application ne reçoit pas d'argent et n'effectue aucun transfert ou paiement. Elle vous aide seulement à noter et organiser vos finances.

Téléchargez Mon Jeton et reprenez le contrôle de votre argent, un jeton à la fois.
```

---

## 4. Notes ASO (référencement Play)

- **Mots-clés à couvrir** dans le titre/desc : budget, épargne, tontine, mobile
  money, Orange Money, MTN MoMo, Wave, finances personnelles, dépenses, AVEC.
- Le titre peut être enrichi (≤ 30 car.) si besoin de visibilité, ex.
  `Mon Jeton : Budget & Tontine` (28). **Recommandation : garder `Mon Jeton`**
  seul pour la marque, la catégorie Finance faisant déjà le travail.
- La description répète naturellement les termes clés en début de paragraphe
  (Play indexe surtout le début de la description).

---

## 5. Ressources graphiques requises

| Ressource | Dimensions | État | Note |
|---|---|---|---|
| Icône de l'application | 512 × 512 PNG (32 bits, alpha) | ✅ `icon-512.png` | vérifier le rendu maskable |
| Image de présentation (Feature graphic) | 1024 × 500 PNG/JPG | ⏳ **à créer** | voir concept ci-dessous |
| Captures téléphone | min 320 px, ratio 16:9 ou 9:16, 2 à 8 images | ⏳ **à produire** | voir §6 |
| Captures tablette 7"/10" | facultatif | — | recommandé si publié pour tablettes |

**Concept image de présentation (1024 × 500)** — dégradé vert de la charte
(`#07594b → #00a884`), logo « Mon Jeton » à gauche, accroche à droite :
*« Budget • Épargne • Tontine »* + un aperçu de téléphone montrant le tableau de
bord. Reprendre exactement les couleurs de `theme.css` (voir `privacy-hero`).

---

## 6. Plan des captures d'écran (8 images, format portrait 9:16)

Ordre conseillé (la 1re et la 2e sont les plus vues, on met la valeur en avant) :

| # | Page à capturer | Écran / état à préparer | Texte de légende (bandeau) |
|---|---|---|---|
| 1 | `dashboard.html` | Tableau de bord avec quelques transactions et le graphique visible | **Toutes vos finances en un coup d'œil** |
| 2 | `transactions.html` | Historique rempli + un ajout de transaction | **Notez chaque dépense en 2 secondes** |
| 3 | `budgets.html` | 2-3 budgets par catégorie avec barres de suivi | **Un budget par catégorie, sous contrôle** |
| 4 | `savings.html` | Objectifs d'épargne actifs + total épargné | **Épargnez pour vos vrais projets** |
| 5 | `tontine.html` | Une tontine avec cotisations et tours | **Gérez vos tontines sans carnet** |
| 6 | `badges.html` | Badges débloqués et niveau | **Gardez la motivation avec les défis** |
| 7 | `assistant.html` | Conversation avec l'assistant / conseils | **Des conseils simples, au quotidien** |
| 8 | `security.html` ou `privacy.html` | Écran PIN / page « Vos données » | **Vos données restent chez vous** |

**Conseils de réalisation :**
- Capturer sur un appareil ou émulateur en **portrait**, largeur ≥ 1080 px.
- Utiliser un **jeu de données de démonstration** cohérent (mêmes montants d'un
  écran à l'autre, en FCFA) — éviter les écrans vides.
- Tester une série en **mode clair** ; une variante mode sombre est un plus.
- Ajouter un **bandeau de légende** en haut de chaque image (fond vert charte,
  texte blanc) pour un rendu pro et lisible dans la galerie du Store.
- Ne montrer **aucune donnée personnelle réelle** (noms, numéros).

> Astuce : ces captures peuvent être générées automatiquement (serveur local +
> navigateur automatisé) à partir des pages HTML avec des données de démo. Voir
> la piste « génération automatique » en fin de document.

---

## 7. Politique de confidentialité (URL obligatoire)

La page `privacy.html` sert de base. Play exige une **URL publique accessible**.
Options :
1. **GitHub Pages** (si le dépôt le sert) :
   `https://patrickeudess.github.io/Mon-Jeton-02/privacy.html` — *à vérifier*.
2. Toute page publiée sur le domaine de l'éditeur reprenant le contenu de
   `privacy.html`.

Vérifier que l'URL s'ouvre sans authentification depuis un navigateur externe.

---

## 8. Formulaire « Sécurité des données » (Data safety)

Réponses dérivées de `privacy.html`. **À faire valider par l'éditeur** — c'est
une déclaration engageante.

| Question | Réponse | Détail |
|---|---|---|
| L'appli **collecte-t-elle** des données ? | **Oui** | uniquement si l'utilisateur crée un compte / rejoint un groupe |
| L'appli **partage-t-elle** des données avec des tiers ? | **Oui (limité)** | données de groupe (tontine/AVEC) visibles par les autres membres du groupe |
| Les données sont-elles **chiffrées en transit** ? | **Oui** | via Firebase (HTTPS) |
| L'utilisateur peut-il **demander la suppression** ? | **Oui** | bouton « Supprimer mes données » dans l'app |

**Types de données à déclarer :**

| Catégorie | Donnée | Collectée | Partagée | Finalité |
|---|---|---|---|---|
| Infos personnelles | Nom / prénom | Oui (si compte) | Oui (membres du groupe) | Fonctionnalité de l'app |
| Infos personnelles | E-mail *(facultatif)* / téléphone | Oui (si compte) | Non | Authentification du compte |
| Infos financières | Budget, transactions, objectifs, cotisations | Oui (si sync) | Oui (données de groupe) | Fonctionnalité de l'app |

**À préciser dans le formulaire :**
- Sans création de compte, **tout reste en local** (localStorage) → *aucune*
  collecte côté serveur.
- L'appli **ne collecte pas** de localisation, contacts, identifiants publicitaires.
- **Pas de suivi publicitaire**, pas de SDK de pub.

---

## 9. Classification du contenu (questionnaire IARC)

- Catégorie : **Utilitaire / Productivité / Communication** (app financière, pas
  un jeu).
- Pas de violence, contenu sexuel, drogue, jeux d'argent réels → classement
  attendu **Tout public / PEGI 3**.
- ⚠️ Répondre **Non** à « jeux d'argent / gambling » : la tontine est une épargne
  collective, pas un jeu d'argent. Le préciser si un champ libre le permet.

---

## 10. Public cible et contenu (Target audience)

- **Tranche d'âge visée : 18 ans et plus** (gestion d'argent réelle).
- Ne pas cocher « conçu pour les enfants » → évite les obligations *Families*.

---

## 11. Checklist de mise en ligne (fiche)

- [ ] Nom, description courte et longue collés (fr-FR)
- [ ] Icône 512×512 importée
- [ ] Image de présentation 1024×500 créée et importée
- [ ] 2 à 8 captures téléphone importées (voir §6)
- [ ] URL de politique de confidentialité valide et publique (§7)
- [ ] Formulaire « Sécurité des données » complété et validé par l'éditeur (§8)
- [ ] Questionnaire de classification du contenu rempli (§9)
- [ ] Public cible défini : 18+ (§10)
- [ ] Coordonnées de contact (e-mail) renseignées
- [ ] Catégorie « Finance » sélectionnée

---

## 12. (Optionnel) Générer les captures automatiquement

Les écrans étant du HTML statique, on peut produire les 8 captures sans
téléphone, avec un navigateur automatisé (Playwright/Chromium déjà présent) :

1. Servir le dossier en local (`python -m http.server`).
2. Injecter un jeu de données de démo dans `localStorage` avant chargement.
3. Charger chaque page en viewport portrait (ex. 1080×2160) et capturer.
4. Superposer le bandeau de légende du §6.

> Dites-le si vous voulez que je prépare ce script et que je génère directement
> les 8 PNG (mode clair, données de démo cohérentes en FCFA).
