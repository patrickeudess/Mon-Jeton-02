# Activation des règles Firebase

Les changements de rôles, membres, règles de prêt et rattachements à une institution sont désormais protégés dans `firestore.rules`.

## À faire une seule fois

1. Ouvrir la [console Firebase](https://console.firebase.google.com/project/mon-jeton/firestore/rules).
2. Remplacer le contenu de l’onglet **Règles** par le contenu du fichier `firestore.rules` de ce dépôt.
3. Cliquer sur **Publier**.

Après publication, un simple membre ne peut plus se donner le rôle de président/trésorier, modifier les membres, les paramètres de crédit ou l’institution rattachée au groupe. Le créateur du groupe conserve cette responsabilité.

## Important pour une institution financière

Ces règles protègent les rôles et les paramètres du groupe. Pour contrôler chaque mouvement financier de façon réglementaire (validation de chaque dépôt, prêt, remboursement et piste d’audit non modifiable), la prochaine version doit enregistrer les opérations dans une collection dédiée et les valider avec une fonction serveur Firebase. Cette infrastructure nécessite généralement le plan Blaze de Firebase ; elle ne doit pas être simulée dans le navigateur.
