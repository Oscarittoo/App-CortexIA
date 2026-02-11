# Guide de démarrage rapide

Ce guide décrit la configuration minimale et les premiers usages.

## 1. Installation

1. Installer les dépendances :
   - `npm install`
2. Configurer les variables d’environnement (voir `.env.example`).
3. Démarrer l’application :
   - Web : `npm run dev`
   - Web + Electron : `npm start`

## 2. Connexion

1. Ouvrir l’application.
2. Aller sur Connexion.
3. Créer un compte ou se connecter.

## 3. Créer une session

1. Cliquer sur Nouvelle session.
2. Saisir le titre.
3. Choisir la langue.
4. Démarrer l’enregistrement.

## 4. Pendant la session

- La transcription apparaît en direct.
- Utiliser Pause / Reprendre si nécessaire.
- Marquer un moment important pour le retrouver dans le rapport.

## 5. Après la session

Le rapport inclut :
- Résumé
- Actions
- Décisions
- Transcription complète

## 6. Export

- PDF
- Markdown
- Texte brut

## 7. Templates

- Sélectionner un template dans l’onglet Templates.
- Le template sélectionné est appliqué à la prochaine session.

## 8. Tags et recherche

- Ajouter des tags pour organiser les sessions.
- Rechercher dans l’historique par mot-clé, date, tag, durée.

## 9. Paramètres

- Langue, notifications, exports par défaut
- Gestion des données locales

## Dépannage rapide

### La transcription ne fonctionne pas
- Utiliser Chrome ou Edge.
- Vérifier les permissions micro.
- Vérifier la connexion internet.

### L’app Electron n’enregistre pas
- Utiliser la version navigateur (limitation Web Speech API).

### Erreur de connexion
- Vérifier la configuration Supabase dans `.env`.

## Raccourcis utiles

- Ctrl + N : Nouvelle session
- Ctrl + F : Rechercher
- Ctrl + H : Historique
- Ctrl + D : Tableau de bord
- Ctrl + , : Paramètres
- Ctrl + / : Aide raccourcis
