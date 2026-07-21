# 📱 Publier Mon Jeton sur le Play Store

Guide pratique pour construire l'application Android (Capacitor) et l'envoyer
sur le Google Play Store.

---

## 1. Branche de référence

L'application complète (web + projet Android + dernières fonctionnalités) vit sur
la branche **`claude/swot-analysis-proposals-t7vr7v`**. C'est elle qui alimente le
site GitHub Pages **et** l'application Android.

> ✅ Recommandation : consolider cette branche dans `main` pour disposer d'une
> branche canonique unique avant la mise en production.

---

## 2. Ce que l'application embarque

Toutes les pages web — y compris la **barre de navigation basse**
(`bottom-nav.js`) et les améliorations d'accessibilité de `theme.css` — sont
copiées **automatiquement** dans `www/`, puis dans l'app Android, par le script
de build. Aucun fichier n'est à copier à la main : tout fichier `.html`, `.js`,
`.css`, `.png`, `.svg`, `.json` placé à la racine est repris.

`www/` est un dossier **généré** (dans `.gitignore`) : il est reconstruit à
chaque build, il ne faut donc pas le modifier ni le committer.

---

## 3. Prérequis (à installer une seule fois)

- **Node.js 20+**
- **Android Studio** (avec le SDK Android)
- **Java 17** (fourni avec Android Studio récent)

---

## 4. Construire l'application

```bash
npm install            # installe Capacitor
npm run android:sync   # génère www/ puis synchronise le projet Android
npm run android:open   # ouvre le projet dans Android Studio
```

Dans Android Studio :
**Build → Generate Signed Bundle / APK → Android App Bundle (`.aab`)**, puis
signez avec votre clé de release (le format `.aab` est requis par le Play Store).

---

## 5. Numéro de version (avant chaque envoi)

À incrémenter dans `android/app/build.gradle` :

| Champ | Rôle | Exemple |
|---|---|---|
| `versionCode` | entier interne, **+1 à chaque envoi** | `1` → `2` |
| `versionName` | version affichée aux utilisateurs | `"1.0"` → `"1.1"` |

Identifiant de l'application : `ci.monjeton.app` (ne plus jamais le changer une
fois publié).

---

## 6. Checklist avant l'envoi

- [ ] `npm run android:sync` exécuté (les assets embarqués sont à jour)
- [ ] Icônes présentes (`icon-192.png`, `icon-512.png`)
- [ ] Test sur un vrai téléphone : la **barre de navigation basse** s'affiche et
      permet de passer d'une page à l'autre
- [ ] Test en mode sombre et avec un petit écran
- [ ] `versionCode` incrémenté
- [ ] Bundle `.aab` **signé** avec votre clé de release
- [ ] **Sauvegardez votre clé de signature** (keystore) : sans elle, impossible
      de publier une mise à jour.

---

## 7. Côté Google Play Console

1. Créer l'application (nom : **Mon Jeton**, langue par défaut : français).
2. Renseigner la fiche : description, captures d'écran, icône, catégorie
   (Finance), politique de confidentialité (la page `privacy.html` peut servir
   de base).
3. Créer une version sur la piste souhaitée (test interne, fermé, puis
   production) et y déposer le fichier `.aab`.
4. Compléter le questionnaire sur le contenu et la confidentialité des données.
