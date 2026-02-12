# Plan de tests fonctionnels complet

Ce plan couvre les parcours principaux et les cas limites. Il est conçu pour une exécution manuelle et peut être utilisé comme base pour des tests automatisés futurs.

## Pré‑requis

- Chrome ou Edge (Web Speech API)
- Microphone autorisé
- Variables d’environnement Supabase configurées
- Application lancée en mode web (recommandé)

## 1. Accès public et navigation

### 1.1 Accueil
- Vérifier l’affichage des sections principales
- Vérifier les boutons d’appel à l’action
- Vérifier la navigation vers Fonctionnalités, Intégrations, Démo, Prix

### 1.2 Pages publiques
- Fonctionnalités : contenu visible, CTA fonctionnel
- Intégrations : contenu visible, bouton “Docs” vers API Docs
- Démo : section vidéo, CTA vers création de session
- Prix : cartes plans, actions d’inscription

## 2. Authentification

### 2.1 Inscription
- Inscription avec email valide
- Vérifier création du compte
- Vérifier redirection vers le tableau de bord

### 2.2 Connexion
- Connexion avec identifiants valides
- Erreur claire si identifiants invalides
- Déconnexion via sidebar

### 2.3 Session expirée
- Simuler expiration (inactivité) puis vérifer retour à l’accueil

## 3. Tableau de bord

- Statistiques visibles
- Bouton “Nouvelle session” fonctionnel
- Aucune erreur console lors du chargement

## 4. Nouvelle session

### 4.1 Validation formulaire
- Titre obligatoire
- Consentement obligatoire
- Langue correctement appliquée

### 4.2 Démarrage
- Passage à l’écran de session active
- Démarrage de la capture micro

## 5. Session active (transcription)

### 5.1 Micro et transcription
- Transcription en temps réel
- Indicateurs audio/parole cohérents
- Pause / Reprendre
- Marquer un moment important

### 5.2 Erreurs
- Refus micro : message clair
- Aucun son détecté : avertissement

### 5.3 Fin de session
- Confirmation de fin
- Génération du rapport

## 6. Rapport

- Résumé généré (IA si clé configurée, sinon fallback)
- Actions / Décisions affichées
- Email de suivi généré
- Bouton “Éditer” ouvre l’éditeur

## 7. Édition de session

- Modification d’un segment
- Suppression d’un segment
- Ajout d’une note
- Sauvegarde et retour rapport

## 8. Historique

- Liste des sessions
- Recherche par mot‑clé
- Filtres date / langue / plateforme
- Suppression d’une session

## 9. Templates

- Sélection d’un template
- Désélection
- Création d’un template personnalisé

## 10. Paramètres

- Sauvegarde des préférences
- Changement du plan (si autorisé)
- Suppression des données
- Gestion des données orphelines

## 11. Exports

- Export PDF (session unique)
- Export Markdown
- Export texte brut

## 12. Notifications

- Toast info / succès / erreur visibles
- Fermeture manuelle possible

## 13. Isolation des données

- Deux comptes distincts : aucune session partagée
- Tags, templates, paramètres isolés

## 14. Tests de régression UI

- Aucun bouton inactif
- Aucun emoji visible
- Styles cohérents, pas de blocage visuel

## 15. Tests non‑bloquants (optionnels)

- Lancement Electron (UI OK, transcription désactivée)
- Performance de navigation

## Rapport de test (à remplir)

- Date :
- Environnement :
- Résultat global :
- Anomalies relevées :
- Captures / logs :
