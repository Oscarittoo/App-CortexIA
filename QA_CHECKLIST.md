# Checklist QA - Pré‑production

Cette checklist décrit les tests fonctionnels indispensables avant livraison.

## Authentification

- [ ] Inscription avec email valide
- [ ] Connexion avec identifiants valides
- [ ] Déconnexion
- [ ] Session expirée → retour à l’accueil
- [ ] Plan utilisateur affiché correctement

## Isolation des données

- [ ] Deux comptes distincts ne partagent aucune session
- [ ] Tags isolés par utilisateur
- [ ] Templates personnalisés isolés par utilisateur
- [ ] Paramètres isolés par utilisateur

## Nouvelle session

- [ ] Titre obligatoire
- [ ] Langue correctement appliquée
- [ ] Démarrage de l’enregistrement
- [ ] Pause / Reprendre
- [ ] Fin de session avec confirmation

## Transcription

- [ ] Transcription en temps réel sur Chrome/Edge
- [ ] Messages d’erreur clairs si micro refusé
- [ ] Redémarrage automatique après coupure

## Rapport

- [ ] Résumé généré (IA ou fallback)
- [ ] Actions et décisions visibles
- [ ] Email de suivi généré
- [ ] Édition de session possible

## Exports

- [ ] Export PDF d’une session
- [ ] Export Markdown
- [ ] Export texte brut

## Historique

- [ ] Recherche par mot-clé
- [ ] Filtres par date
- [ ] Filtres par tags
- [ ] Suppression d’une session

## Templates

- [ ] Sélection d’un template
- [ ] Désélection du template
- [ ] Création d’un template personnalisé

## Paramètres

- [ ] Sauvegarde des paramètres
- [ ] Mise à jour du plan
- [ ] Nettoyage des sessions orphelines
- [ ] Suppression complète des données

## UI/UX

- [ ] Aucun bouton inactif
- [ ] Notifications/toasts cohérentes
- [ ] Aucune emoji dans les textes

## Sécurité & conformité

- [ ] Aucun secret en clair dans le repo
- [ ] Variables sensibles uniquement via `.env`
