# Contribuer à Mon Jeton

Merci de votre intérêt pour le projet !

## Structure du projet

- Racine : pages HTML et scripts JS du frontend (PWA, aucune étape de build)
- `backend/` : API FastAPI optionnelle (voir `backend/requirements.txt`)
- `docs/` : guides de démarrage et documents d'analyse
- `docs/archive/` : anciens documents de diagnostic conservés pour référence
- `tests-manuels/` : pages de test/vérification manuelles (non chargées en production)

## Règles de base

1. **Pas de données sensibles en clair** : jamais de mot de passe, PIN ou clé
   secrète en dur dans le code ou dans localStorage sans hachage.
2. **Pas de `innerHTML` avec des données utilisateur** : utilisez
   `textContent` ou échappez le HTML.
3. **Nom du produit** : « Mon Jeton » partout (frontend, backend, manifest).
4. **Fichiers de test** : les pages de vérification manuelle vont dans
   `tests-manuels/`, pas à la racine.
5. **Backend** : les changements d'API doivent rester cohérents avec
   `api-client.js` côté frontend.

## Proposer un changement

1. Créez une branche depuis `main`
2. Faites vos modifications avec des commits clairs
3. Ouvrez une Pull Request en décrivant le problème résolu
