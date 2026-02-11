# Rapport QA

## Informations générales
- Date : 11 février 2026
- Environnement : Windows
- Portée : App web + Electron + extension Chrome
- Version : 1.0.0

## Vérifications automatisables

### Build
- Commande : `npm run build`
- Résultat : OK
- Notes : Avertissement uniquement sur taille de bundle (> 500 kB), non bloquant.

### Lint / tests unitaires
- Commande : non disponible (aucun script de test défini)
- Résultat : N/A

## Tests manuels (à exécuter et compléter)

### 1. Accès public et navigation
- Accueil : OK
- Fonctionnalités : OK
- Intégrations : OK
- Démo : OK
- Prix : OK
- Notes :

### 2. Authentification
- Inscription : OK
- Connexion : OK
- Erreur login invalide : OK
- Déconnexion : OK
- Session expirée : KO
- Notes : La session reste active après fermeture/rafraîchissement ; comportement à clarifier (durée de session ou refresh token).

### 3. Tableau de bord
- Statistiques affichées : OK
- Accès Nouvelle session : OK
- Notes :

### 4. Nouvelle session
- Titre obligatoire : OK
- Consentement obligatoire : OK
- Démarrage : OK
- Notes :

### 5. Session active (transcription)
- Transcription temps réel : OK
- Pause / Reprendre : OK
- Marquer un moment : OK
- Erreur micro refusé : OK
- Notes :

### 6. Rapport
- Résumé généré : ⚠️ EN ATTENTE (problème configuration Claude API)
- Actions / Décisions : ⚠️ PARTIEL (détection fonctionne, 3-4 actions trouvées)
- Email généré : ⚠️ EN ATTENTE (dépend de la synthèse)
- Édition session : ☐ À TESTER
- Notes : **PROBLÈME TECHNIQUE IDENTIFIÉ** - Modèle Claude obsolète configuré. Synthèse approximative (contexte/mots-clés/conclusion incorrects). **SOLUTION APPLIQUÉE** : Mise à jour vers Claude Sonnet 4.5 (claude-sonnet-4-5-20250929). Nécessite redémarrage serveur + purge cache + nouveau test.

### 7. Éditeur de session
- Modifier segment : ☐ À TESTER
- Supprimer segment : ☐ À TESTER
- Ajouter note : ☐ À TESTER
- Sauvegarde : ☐ À TESTER
- Notes :

### 8. Historique
- Liste sessions : ☐ À TESTER
- Recherche : ☐ À TESTER
- Filtres date/langue/plateforme : ☐ À TESTER
- Suppression session : ☐ À TESTER
- Notes :

### 9. Templates
- Sélection : ☐ À TESTER
- Désélection : ☐ À TESTER
- Création personnalisée : ☐ À TESTER
- Notes :

### 10. Paramètres
- Sauvegarde préférences : ☐ À TESTER
- Changement plan : ☐ À TESTER
- Nettoyage orphelines : ☐ À TESTER
- Suppression données : OK
- Purge rapports IA : OK (nouvelle fonctionnalité ajoutée)
- Notes : Fonction "Purger les rapports IA" ajoutée dans l'onglet Data des paramètres.

### 11. Exports
- PDF : ☐ À TESTER
- Markdown : ☐ À TESTER
- Texte brut : ☐ À TESTER
- Notes :

### 12. Notifications
- Toast info/succès/erreur : OK
- Fermeture manuelle : OK
- Notes : Système de notifications par toast fonctionne correctement.

### 13. Isolation des données
- Sessions isolées par utilisateur : ☐ OK ☐ KO
- Tags isolés : ☐ OK ☐ KO
- Templates isolés : ☐ OK ☐ KO
- Paramètres isolés : ☐ OK ☐ KO
- Notes :

### 14. Régression UI
- Aucun bouton inactif : ☐ OK ☐ KO
- Aucun emoji visible : ☐ OK ☐ KO
- Cohérence visuelle : ☐ OK ☐ KO
- Notes :

### 15. Electron
- Lancement de l’app : ☐ OK ☐ KO
- Navigation UI : ☐ OK ☐ KO
- Note : Transcription non supportée dans Electron
- Notes :

### 16. Extension Chrome
- Installation extension : ☐ OK ☐ KO
- Ouverture popup : ☐ OK ☐ KO
- Fonctionnement widget : ☐ OK ☐ KO
- Notes :

## Synthèse
- Résultat global : ☐ OK ☐ KO
- Anomalies bloquantes :
- Anomalies mineures :
- Actions correctives :
