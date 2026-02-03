# 🧪 Guide de test - CORTEXIA

Ce guide vous permet de tester toutes les fonctionnalités implémentées.

## 🚀 Démarrage de l'application

### 1. Installation des dépendances
```bash
cd c:\Users\Utilisateur\Downloads\cortexa
npm install
```

### 2. Lancement en mode développement
```bash
npm run dev
```

L'application sera accessible à : **http://localhost:5173**

---

## ✅ Tests des fonctionnalités

### Test 1 : Page d'accueil et tarification

**Objectif** : Vérifier le flux home → pricing

**Étapes** :
1. Ouvrir http://localhost:5173
2. ✅ Vérifier que le nouveau logo (cerveau) s'affiche
3. ✅ Cliquer sur "Démarrer gratuitement"
4. ✅ Vérifier la redirection vers la page tarifs
5. ✅ Vérifier les 3 plans (Free, Pro, Enterprise)
6. ✅ Vérifier le badge "Populaire" sur le plan Pro
7. ✅ Vérifier la liste des fonctionnalités de chaque plan

**Résultat attendu** :
- Logo cerveau visible dans la navigation
- Page tarifs moderne avec 3 cards
- Badge "Populaire" en violet sur le plan Pro
- Boutons "Essayer gratuitement", "Commencer maintenant", "Nous contacter"

---

### Test 2 : Inscription utilisateur

**Objectif** : Créer un compte utilisateur

**Étapes** :
1. Sur la page tarifs, cliquer sur "Essayer gratuitement" (plan Free)
2. ✅ Vérifier la redirection vers la page login
3. ✅ Cliquer sur "Créer un compte"
4. ✅ Remplir les champs :
   - Email : `test@cortexia.com`
   - Nom d'entreprise : `Test Company`
   - Mot de passe : `Test1234`
5. ✅ Cliquer sur "Créer mon compte"
6. ✅ Vérifier la notification "Compte créé avec succès"
7. ✅ Vérifier la redirection vers "Nouvelle session"

**Résultat attendu** :
- Formulaire avec toggle "Créer un compte" / "Se connecter"
- Validation email (format valide)
- Validation mot de passe (min 8 caractères)
- Toast notification verte de succès
- Email affiché dans la navigation en haut à droite

---

### Test 3 : Connexion existante

**Objectif** : Tester la connexion avec un compte existant

**Étapes** :
1. Cliquer sur "Déconnexion" dans la navigation
2. ✅ Vérifier la redirection vers la page d'accueil
3. Cliquer sur "Commencer" dans la navigation
4. Sur la page tarifs, choisir n'importe quel plan
5. ✅ Vérifier que le formulaire de connexion s'affiche
6. ✅ Remplir :
   - Email : `test@cortexia.com`
   - Mot de passe : `Test1234`
7. ✅ Cliquer sur "Se connecter"
8. ✅ Vérifier la connexion réussie

**Résultat attendu** :
- Connexion réussie
- Redirection vers "Nouvelle session"
- Email dans la navigation

---

### Test 4 : Dashboard d'administration

**Objectif** : Visualiser la base de données clients

**Étapes** :
1. Une fois connecté, cliquer sur le lien "Admin" dans la navigation
2. ✅ Vérifier l'affichage du dashboard admin
3. ✅ Vérifier les statistiques :
   - Total Clients
   - Distribution par plan (Free, Pro, Enterprise)
4. ✅ Vérifier le tableau avec :
   - Email de l'utilisateur créé
   - Nom d'entreprise
   - Badge du plan
   - Date d'inscription
5. ✅ Tester la recherche par email
6. ✅ Tester la recherche par entreprise

**Résultat attendu** :
- Dashboard avec cartes de statistiques
- Tableau avec le client `test@cortexia.com`
- Recherche fonctionnelle (live search)
- Badge coloré pour le plan

---

### Test 5 : Analyse IA en temps réel (Fonctionnalité principale)

**Objectif** : Tester la détection d'actions et décisions pendant une session

⚠️ **IMPORTANT** : Cette fonctionnalité nécessite un navigateur web (Chrome, Edge, Brave) car l'application Electron ne supporte pas Web Speech API.

**Étapes** :
1. Ouvrir http://localhost:5173 dans **Chrome ou Edge**
2. Se connecter avec `test@cortexia.com`
3. Cliquer sur "Nouvelle Session" dans la navigation
4. ✅ Remplir le formulaire :
   - Titre : `Test Analyse IA`
   - Langue : Français
   - Type : Réunion pro
5. ✅ Cliquer sur "Démarrer la session"
6. ✅ **Autoriser l'accès au microphone** (important !)
7. ✅ Vérifier l'affichage du panneau latéral "🤖 Analyse IA en temps réel" à droite
8. ✅ Parler dans le microphone en prononçant :

**Phrases pour tester les ACTIONS** :
```
"Il faut préparer le rapport pour demain"
"On doit organiser la réunion de suivi"
"Je vais créer le document technique"
"Nous devons planifier le lancement du produit"
"Il est urgent de contacter le client"
```

**Phrases pour tester les DÉCISIONS** :
```
"On décide de partir sur cette solution"
"C'est validé, on approuve le budget"
"On est d'accord pour lancer le projet"
"Décision prise : on refuse cette proposition"
"On choisit la version 2 du design"
```

9. ✅ Vérifier l'apparition en temps réel dans le panneau IA :
   - Section "Actions à suivre" avec compteur
   - Section "Décisions prises" avec compteur
   - Timestamp pour chaque élément
   - Badge de priorité (Haute/Moyenne/Basse)
   - Badge d'impact (Fort/Moyen/Faible)

10. ✅ Cliquer sur "Terminer la session"
11. ✅ Vérifier le rapport final avec les actions et décisions détectées

**Résultat attendu** :
- Transcription en temps réel dans le panneau principal
- Détection automatique des actions dans le panneau latéral
- Détection automatique des décisions dans le panneau latéral
- Classification par priorité/impact
- Rapport final incluant les éléments détectés

**Troubleshooting** :
- Si "Aucun audio détecté" : Vérifier les permissions microphone
- Si pas de transcription : Utiliser Chrome/Edge (pas Electron)
- Si panneau IA vide : Prononcer les phrases d'exemple ci-dessus

---

### Test 6 : Dark Mode

**Objectif** : Vérifier le mode sombre

**Étapes** :
1. Cliquer sur le bouton "◑" dans la navigation (mode sombre)
2. ✅ Vérifier que tous les éléments passent en dark :
   - Fond noir/gris foncé
   - Texte blanc/gris clair
   - Cartes avec bordures sombres
   - Panneau IA avec gradient sombre
3. ✅ Re-cliquer pour revenir en mode clair "◐"

**Résultat attendu** :
- Transition fluide entre les modes
- Tous les composants adaptés (pricing, login, admin, session)
- Contraste suffisant pour la lisibilité

---

### Test 7 : Responsive Design

**Objectif** : Vérifier l'adaptabilité mobile/tablette

**Étapes** :
1. Ouvrir les DevTools (F12)
2. Activer le mode responsive (Ctrl+Shift+M)
3. ✅ Tester les breakpoints :
   - **Mobile** (375px) : Navigation burger, cards empilées
   - **Tablette** (768px) : Layout adapté
   - **Desktop** (1200px+) : Layout complet avec panneau IA
4. ✅ Vérifier que le panneau IA disparaît sur mobile (<968px)

**Résultat attendu** :
- Design adapté à toutes les tailles
- Panneau IA masqué sur petits écrans
- Navigation responsive
- Boutons et formulaires accessibles

---

### Test 8 : Historique des sessions

**Objectif** : Vérifier l'enregistrement et la consultation des sessions

**Étapes** :
1. Après avoir terminé une session avec analyse IA
2. Cliquer sur "Historique" dans la navigation
3. ✅ Vérifier l'affichage de la session "Test Analyse IA"
4. ✅ Cliquer sur "Voir le rapport"
5. ✅ Vérifier la présence des actions et décisions détectées
6. ✅ Tester l'export PDF
7. ✅ Tester l'export email de suivi

**Résultat attendu** :
- Session sauvegardée automatiquement
- Rapport complet avec transcription
- Actions détectées listées
- Décisions détectées listées
- Export fonctionnel

---

## 🔧 Tests techniques

### Test 9 : localStorage

**Objectif** : Vérifier le stockage local

**Étapes** :
1. Ouvrir DevTools → Application → Storage → Local Storage
2. ✅ Vérifier la présence des clés :
   - `cortexia_user` : Utilisateur connecté
   - `cortexia_clients_db` : Base de données clients
   - `cortexia_sessions` : Sessions enregistrées
3. ✅ Vérifier le format JSON des données
4. ✅ Vérifier que les données persistent après refresh (F5)

**Résultat attendu** :
- Données structurées en JSON
- Persistance après rafraîchissement
- Pas de corruption de données

---

### Test 10 : Performance

**Objectif** : Vérifier la réactivité de l'application

**Étapes** :
1. Créer une session avec beaucoup de transcription (2-3 minutes)
2. ✅ Vérifier que le panneau IA se met à jour sans lag
3. ✅ Vérifier que le scroll fonctionne bien
4. ✅ Vérifier que la recherche admin est instantanée

**Résultat attendu** :
- Détection IA < 100ms
- Scroll fluide même avec 50+ actions
- Recherche instantanée
- Pas de freeze de l'interface

---

## ⚠️ Tests d'intégration Stripe (Nécessite configuration)

### Test 11 : Checkout Stripe (Après configuration)

**Prérequis** :
- Compte Stripe créé
- `VITE_STRIPE_PUBLISHABLE_KEY` configuré dans `.env.local`
- Backend webhook déployé

**Étapes** :
1. Se déconnecter de l'application
2. Aller sur la page tarifs
3. Cliquer sur "Commencer maintenant" (Plan Pro)
4. Se connecter ou créer un compte
5. ✅ Vérifier la redirection vers Stripe Checkout
6. ✅ Utiliser carte de test : `4242 4242 4242 4242`
7. ✅ Compléter le paiement
8. ✅ Vérifier la mise à jour du plan en "Pro"
9. ✅ Vérifier l'enregistrement dans la BDD clients

**Résultat attendu** :
- Redirection vers Stripe
- Paiement test réussi
- Webhook déclenché
- Plan mis à jour dans l'app
- stripe_subscription_id enregistré

---

## 📊 Checklist complète de test

### Fonctionnalités de base
- [ ] Page d'accueil avec nouveau logo
- [ ] Navigation fonctionnelle
- [ ] Dark mode toggle
- [ ] Responsive design

### Authentification
- [ ] Inscription nouveau compte
- [ ] Connexion compte existant
- [ ] Déconnexion
- [ ] Persistance session
- [ ] Validation formulaires

### Tarification
- [ ] Affichage 3 plans
- [ ] Badge "Populaire"
- [ ] Redirection après sélection
- [ ] Intégration avec login

### Analyse IA temps réel
- [ ] Détection d'actions automatique
- [ ] Détection de décisions automatique
- [ ] Classification priorité/impact
- [ ] Affichage panneau latéral
- [ ] Compteurs en temps réel
- [ ] Transmission au rapport

### Administration
- [ ] Accès dashboard admin
- [ ] Statistiques clients
- [ ] Tableau de données
- [ ] Recherche fonctionnelle
- [ ] Export possible

### Sessions
- [ ] Création nouvelle session
- [ ] Transcription temps réel
- [ ] Sauvegarde automatique
- [ ] Historique accessible
- [ ] Rapport complet

### Stripe (après config)
- [ ] Checkout session
- [ ] Paiement test réussi
- [ ] Webhook fonctionnel
- [ ] Mise à jour plan
- [ ] Customer portal

---

## 🐛 Bugs connus et limitations

### Limitations Web Speech API
- ❌ Ne fonctionne pas dans Electron (limitation technique)
- ✅ Fonctionne uniquement dans Chrome, Edge, Brave (navigateur)
- ⚠️ Nécessite connexion internet
- ⚠️ Nécessite autorisation microphone

### Stripe
- ⚠️ Nécessite configuration manuelle des clés API
- ⚠️ Nécessite backend pour webhooks en production
- ⚠️ Mode test uniquement sans configuration complète

### localStorage
- ⚠️ Données perdues si cache navigateur effacé
- ⚠️ Limite de stockage (~5-10 MB selon navigateur)
- 💡 Migration vers BDD réelle recommandée pour production

---

## 📝 Rapport de test

### Template de rapport

```
# Test CORTEXIA - [Date]

## Environnement
- OS : Windows/Mac/Linux
- Navigateur : Chrome/Edge/Firefox + version
- Résolution écran : 1920x1080

## Tests réalisés
- [ ] Test 1 : Home → Tarifs
- [ ] Test 2 : Inscription
- [ ] Test 3 : Connexion
- [ ] Test 4 : Dashboard admin
- [ ] Test 5 : Analyse IA temps réel
- [ ] Test 6 : Dark mode
- [ ] Test 7 : Responsive
- [ ] Test 8 : Historique
- [ ] Test 9 : localStorage
- [ ] Test 10 : Performance

## Bugs identifiés
1. [Description bug] - Gravité : Haute/Moyenne/Basse
2. ...

## Améliorations suggérées
1. [Suggestion]
2. ...

## Conclusion
✅ Application fonctionnelle / ⚠️ Bugs mineurs / ❌ Bugs bloquants
```

---

## 🚀 Prochaines étapes après tests

### Si tous les tests passent ✅
1. Configurer Stripe (voir [STRIPE_CONFIGURATION.md](STRIPE_CONFIGURATION.md))
2. Créer backend pour webhooks
3. Migrer vers base de données réelle
4. Déployer en production
5. Monitoring et analytics

### Si bugs identifiés 🐛
1. Documenter les bugs dans un fichier BUGS.md
2. Prioriser par gravité
3. Fixer les bugs critiques
4. Re-tester après corrections
5. Valider avant déploiement

---

## 📞 Besoin d'aide ?

### Documentation disponible
- [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - Résumé complet
- [STRIPE_CONFIGURATION.md](STRIPE_CONFIGURATION.md) - Configuration Stripe
- [ADMIN_GUIDE.md](ADMIN_GUIDE.md) - Guide administration
- [DOCUMENTATION_TECHNIQUE.md](DOCUMENTATION_TECHNIQUE.md) - Architecture

### Debugging
- Ouvrir DevTools (F12) → Console pour voir les logs
- Vérifier l'onglet Network pour les requêtes API
- Vérifier Application → Storage pour localStorage

**Date de création** : 3 février 2026  
**Version** : 1.0.0
