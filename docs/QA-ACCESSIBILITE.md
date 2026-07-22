# ♿ QA Accessibilité & Contrastes — Mon Jeton

Audit automatisé (axe-core, règles **WCAG 2.0/2.1 niveaux A & AA**) exécuté sur
Chromium en viewport mobile (390 px), en mode clair **et** sombre, sur les
14 pages livrées. Ce document liste ce qui a été corrigé et ce qui reste
recommandé.

---

## 1. Résultats

| | Avant | Après |
|---|---|---|
| Règles critiques (labels de formulaire) | 4 | **0** |
| Contraste — mode clair (occurrences) | 84 | **30** |
| Zoom mobile désactivé | 2 pages | **0** |
| Régions défilantes sans accès clavier | 2 | **0** |
| Pages 100 % conformes (mode clair) | — | **7 / 14** |

Pages entièrement propres en mode clair : `index`, `login`, `budgets`,
`savings`, `goals`, `avec`, `privacy`.

---

## 2. Corrections appliquées

### Critique — labels manquants
`security.html` : ajout d'`aria-label` sur les 4 interrupteurs (notifications
de sécurité, historique des connexions, verrouillage auto, biométrie), qui
étaient dans un `<label>` sans texte.

### Contraste — couleur de marque unifiée
Le token effectif `--primary-color` valait `#00a082` (**3.3:1** sur blanc —
échec AA), alors que toutes les pages déclarent déjà
`<meta name="theme-color" content="#087f67">`. La marque a été unifiée sur
**`#087f67`** (**4.95:1**, conforme AA), dans `theme.css` **et** partout où le
vert était codé en dur (`#009879` → `#087f67`, 12 fichiers). Corrige d'un coup
les en-têtes de tableaux, les boutons et le texte vert sur l'ensemble de l'app.

### Contraste — rouge « danger »
`--danger-color` : `#e5484d` (3.6–3.9:1) → **`#c62828`** (≈5.6:1). Corrige
l'indicateur « Hors ligne » et les boutons de déconnexion.

### Contraste — solde et montants
La couleur du solde et des montants (le nombre le plus lu) était `#28a745`
(2.9:1). Passée à **`#1e7e34`** (positif, ≈5:1) et **`#c62828`** (négatif) dans
`app.js`, `auth-manager.js` et `transactions.html`.

### Zoom mobile
`index.html` : suppression de `user-scalable=no` (empêchait le zoom, blocage
pour les malvoyants).

### Accès clavier aux tableaux
`transactions.html` et `budgets.html` : les conteneurs de tableaux à défilement
horizontal reçoivent `tabindex="0"`, `role="region"` et un `aria-label`, pour
être atteignables et défilables au clavier.

### Mode sombre — pas de régression
L'assombrissement des tokens aurait rendu le vert/rouge illisibles sur fond
sombre : `theme.css` fournit désormais des variantes **plus claires en mode
sombre** (`--primary-color: #2fbf9f`, `--danger-color: #ff6b6b`). Résultat :
moins de problèmes qu'avant ce chantier (ex. `index` 7 → 2, `tontine` 17 → 14).

---

## 3. Points restants recommandés (hors périmètre de ce passage)

Priorité **moyenne / basse** — n'empêchent pas la publication mais à traiter
dans une passe ultérieure :

1. **Gris secondaires limites** (`#808080`, `#6c757d` ≈ 3.9–4.3:1) sur
   `dashboard`, `security`, `tips` : sous-titres et textes d'aide. Assombrir
   vers `#5c5c5c` pour atteindre 4.5:1.
2. **Boutons sémantiques info/avertissement** : `.refresh-btn` (blanc sur
   `#17a2b8`, 3.0:1) et boutons `#f5a623` (blanc, 2.0:1). Foncer le fond ou
   passer le texte en sombre.
3. **Badges verrouillés** (`badges.html`, `#52a595` ≈ 2.9:1) : état
   volontairement estompé, mais sous le seuil. À foncer légèrement.
4. **Mode sombre — dette pré-existante** : plusieurs cartes (`tontine.html`)
   utilisent du texte **noir codé en dur** qui ne s'adapte pas au fond sombre
   (`#000000` sur `#1d2a26`). À faire hériter des variables de thème.
5. Quelques faux positifs d'axe sur les **états vides** (texte clair sur carte
   dont le fond coloré n'est pas encore rendu faute de données de démo).

---

## 4. Reproduire l'audit

```bash
npm install playwright-core axe-core --no-save
python3 -m http.server 8099        # servir le dossier
# puis lancer axe-core sur chaque page via Chromium (voir scripts d'audit),
# runOnly: wcag2a, wcag2aa, wcag21a, wcag21aa
```
