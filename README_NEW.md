# 🧠 MEETIZY - Assistant IA de réunions professionnel

> Assistant intelligent pour vos réunions et appels professionnels avec **analyse IA en temps réel**, transcription automatique, et système de paiement intégré.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![Electron](https://img.shields.io/badge/Electron-28.1.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## ⭐ Nouveautés (Février 2026)

### 🚀 Fonctionnalités récemment ajoutées

- ✅ **Analyse IA en temps réel** : Détection automatique des actions et décisions pendant la réunion
- ✅ **Système d'authentification** : Login/Register complet avec gestion des utilisateurs
- ✅ **Page de tarification** : 3 plans (Free, Pro, Enterprise) avec fonctionnalités détaillées
- ✅ **Intégration Stripe** : Paiement sécurisé pour les abonnements Pro/Enterprise
- ✅ **Dashboard d'administration** : Visualisation et gestion de la base de données clients
- ✅ **Nouveau logo** : Design moderne représentant un cerveau connecté
- ✅ **Base de données clients** : Stockage structuré avec statistiques agrégées

Consultez le **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** pour tous les détails.

---

## 🎯 Fonctionnalités principales

### 🤖 Intelligence Artificielle
- **Analyse en temps réel** : Détection automatique des actions et décisions pendant la session
- **Génération de résumés** : Résumé intelligent de vos réunions (OpenAI GPT-4 / Claude)
- **Extraction d'actions** : Identification automatique des tâches à accomplir avec priorités
- **Détection de décisions** : Capture des décisions importantes avec niveau d'impact
- **Classification intelligente** : Priorités (Haute/Moyenne/Basse), Impact (Fort/Moyen/Faible)

### 🎙️ Transcription
- **Temps réel** : Transcription instantanée avec Web Speech API
- **Multi-langue** : Support Français et Anglais
- **Haute précision** : Affichage du niveau de confiance
- **Marquage de moments** : Ajout de notes importantes pendant la session

### 💳 Monétisation
- **3 plans tarifaires** :
  - **Free** : 3 réunions/mois, fonctionnalités de base
  - **Pro** : 29€/mois, réunions illimitées, IA avancée, export PDF
  - **Enterprise** : Sur mesure, support dédié, API personnalisée
- **Paiement Stripe** : Intégration sécurisée pour abonnements Pro/Enterprise
- **Gestion d'abonnements** : Customer portal Stripe intégré

### 👥 Authentification & Administration
- **Login/Register** : Système complet avec validation
- **Gestion des utilisateurs** : Base de données clients avec historique
- **Dashboard admin** : Statistiques, recherche, export de données
- **Protection des routes** : Accès sécurisé aux fonctionnalités payantes

### 📊 Rapports & Export
- Génération automatique de comptes-rendus structurés
- Export PDF professionnel avec design personnalisé
- Email de suivi pré-généré
- Historique complet des sessions
- Recherche et filtres avancés

### 🎨 Interface utilisateur
- Design moderne et professionnel
- Dark mode complet
- Responsive (mobile, tablette, desktop)
- Animations fluides
- Notifications toast élégantes

---

## 🚀 Démarrage rapide

### Prérequis
- Node.js 18+ et npm
- Navigateur moderne (Chrome, Edge, Brave)
- Microphone fonctionnel

### Installation

```bash
# Cloner le repository
git clone https://github.com/votre-repo/meetizy.git
cd meetizy

# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev
```

L'application sera accessible à `http://localhost:5173`

### Scripts disponibles

```bash
npm run dev         # Lancer en mode développement
npm run build       # Builder pour production
npm run electron    # Lancer l'application Electron
npm start           # Lancer Vite + Electron simultanément
```

---

## 📖 Documentation complète

### 📚 Guides essentiels
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** ⭐ - Résumé de toutes les fonctionnalités (9 tâches + bonus)
- **[TESTING_GUIDE.md](TESTING_GUIDE.md)** - Guide de test complet avec tous les scénarios
- **[INDEX_COMPLET.md](INDEX_COMPLET.md)** - Index de tous les fichiers du projet
- **[QUICK_START.md](QUICK_START.md)** - Démarrage rapide en 5 minutes

### ⚙️ Configuration
- **[STRIPE_CONFIGURATION.md](STRIPE_CONFIGURATION.md)** - Configuration complète Stripe (paiements)
- **[ADMIN_GUIDE.md](ADMIN_GUIDE.md)** - Administration et gestion clients
- **[API_INTEGRATION.md](API_INTEGRATION.md)** - Intégration des APIs

### 🏗️ Documentation technique
- **[DOCUMENTATION_TECHNIQUE.md](DOCUMENTATION_TECHNIQUE.md)** - Architecture et détails techniques
- **[DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)** - Système de design
- **[MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)** - Guide de migration

### 📊 Rapports et présentations
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Résumé du projet
- **[PRESENTATION_COMMERCIALE.md](PRESENTATION_COMMERCIALE.md)** - Présentation commerciale
- **[PROFESSIONAL_FEATURES.md](PROFESSIONAL_FEATURES.md)** - Fonctionnalités professionnelles

---

## 🧪 Tests

### Test rapide
```bash
# Lancer l'application
npm run dev

# Ouvrir http://localhost:5173
# Suivre le guide : TESTING_GUIDE.md
```

### Tests d'intégration IA
1. Créer une nouvelle session
2. **Autoriser le microphone**
3. Prononcer des phrases avec actions/décisions :
   - **Actions** : "Il faut préparer le rapport", "On doit organiser la réunion"
   - **Décisions** : "On décide de valider", "C'est approuvé"
4. Vérifier la détection en temps réel dans le panneau latéral

Consultez le **[TESTING_GUIDE.md](TESTING_GUIDE.md)** pour une liste complète de tests.

---

## 🏗️ Architecture

### Stack technique
- **Frontend** : React 18.2.0 + Vite 5.0.8
- **Desktop** : Electron 28.1.0
- **Styling** : CSS modules + Design System
- **Icons** : Lucide React
- **Dates** : date-fns
- **Paiements** : Stripe.js
- **Transcription** : Web Speech API
- **IA** : OpenAI GPT-4 / Anthropic Claude

### Structure du projet
```
cortexa/
├── src/
│   ├── components/          # Composants React
│   │   ├── Pricing.jsx      # [NOUVEAU] Page tarification
│   │   ├── Login.jsx        # [NOUVEAU] Login/Register
│   │   ├── AdminDashboard.jsx  # [NOUVEAU] Dashboard admin
│   │   ├── ActiveSession.jsx   # [MODIFIÉ] + Analyse IA temps réel
│   │   ├── Home.jsx
│   │   ├── Dashboard.jsx
│   │   ├── NewSession.jsx
│   │   ├── SessionReport.jsx
│   │   └── ...
│   ├── services/            # Services métier
│   │   ├── authService.js   # [NOUVEAU] Authentification
│   │   ├── stripeService.js # [NOUVEAU] Paiements Stripe
│   │   ├── llmService.js    # Service IA (OpenAI/Claude)
│   │   ├── transcriptionService.js
│   │   └── ...
│   ├── styles/              # Styles CSS
│   │   ├── app.css          # [MODIFIÉ] + Styles panneau IA
│   │   ├── design-system.css
│   │   └── ...
│   ├── hooks/               # Custom React hooks
│   ├── utils/               # Utilitaires
│   └── assets/
│       └── logo.svg         # [MODIFIÉ] Nouveau logo cerveau
├── electron/                # Configuration Electron
│   └── main.js
├── docs/                    # Documentation
└── package.json
```

---

## ⚙️ Configuration

### Variables d'environnement

Créer un fichier `.env.local` à la racine :

```env
# Stripe (pour les paiements)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx

# OpenAI (pour l'IA avancée)
VITE_OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Anthropic Claude (alternative à OpenAI)
VITE_ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxxxx

# Provider LLM (openai ou claude)
VITE_LLM_PROVIDER=openai
```

### Configuration Stripe

Pour activer les paiements :
1. Créer un compte Stripe : https://stripe.com
2. Récupérer les clés API dans le dashboard
3. Créer les produits et prix
4. Configurer les webhooks

Consultez le **[STRIPE_CONFIGURATION.md](STRIPE_CONFIGURATION.md)** pour le guide complet.

---

## 📊 Fonctionnement de l'analyse IA en temps réel

### Détection d'actions

L'IA détecte automatiquement les phrases contenant des mots-clés d'action :
- "doit", "va", "faut", "action", "faire", "réaliser", "tâche", "planifier", etc.

**Exemple** :
> "Il faut préparer le rapport pour demain"

→ Détecté comme action avec priorité **Haute** (car "faut")

### Détection de décisions

L'IA détecte les phrases indiquant une décision :
- "décidons", "décision", "validé", "approuvé", "refusé", "accord", etc.

**Exemple** :
> "On décide de partir sur cette solution"

→ Détecté comme décision avec impact **Moyen**

### Panneau latéral en temps réel

Affichage live pendant la session :
- **Section Actions** : Compteur + liste des actions détectées
- **Section Décisions** : Compteur + liste des décisions prises
- **Métadonnées** : Timestamp, priorité/impact, texte complet

---

## 💳 Plans tarifaires

| Plan | Prix | Réunions | Fonctionnalités |
|------|------|----------|-----------------|
| **Free** | Gratuit | 3/mois | Transcription, résumé basique |
| **Pro** | 29€/mois | Illimité | IA avancée, export PDF, priorité support |
| **Enterprise** | Sur mesure | Illimité | API, personnalisation, support dédié |

Consultez la page tarifs dans l'application pour plus de détails.

---

## 👨‍💼 Dashboard d'administration

Accessible aux utilisateurs connectés via le lien "Admin" dans la navigation.

### Fonctionnalités
- **Statistiques globales** : Total clients, distribution par plan
- **Tableau clients** : Email, entreprise, plan, dates, ID Stripe
- **Recherche** : Filtrage par email ou nom d'entreprise
- **Export** : Possibilité d'exporter les données

Consultez l'**[ADMIN_GUIDE.md](ADMIN_GUIDE.md)** pour le guide complet.

---

## 🐛 Limitations connues

### Web Speech API
- ❌ Ne fonctionne pas dans Electron (limitation technique)
- ✅ Fonctionne uniquement dans Chrome, Edge, Brave (navigateur)
- ⚠️ Nécessite connexion internet
- ⚠️ Nécessite autorisation microphone

### Stripe
- ⚠️ Nécessite configuration manuelle des clés API
- ⚠️ Nécessite backend pour webhooks en production

### localStorage
- ⚠️ Données perdues si cache navigateur effacé
- ⚠️ Limite de stockage (~5-10 MB selon navigateur)
- 💡 Migration vers BDD réelle recommandée pour production

---

## 📈 Prochaines étapes

### Priorité Haute
- [ ] Configuration Stripe complète avec backend webhook
- [ ] Migration localStorage → PostgreSQL/MongoDB
- [ ] Implémentation HTTPS et sécurité renforcée

### Priorité Moyenne
- [ ] Support multi-locuteurs avec identification
- [ ] Export PDF avancé avec template personnalisable
- [ ] Intégrations tierces (Slack, Teams, Notion)

### Priorité Basse
- [ ] Mode offline complet
- [ ] Analytics détaillés
- [ ] Thèmes personnalisés

Consultez la **[Roadmap complète](DOCUMENTATION_TECHNIQUE.md#roadmap)** dans la documentation.

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push sur la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

## 📄 License

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 📞 Support

### Documentation
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Tout ce qui a été fait
- **[TESTING_GUIDE.md](TESTING_GUIDE.md)** - Comment tester
- **[INDEX_COMPLET.md](INDEX_COMPLET.md)** - Index complet des fichiers

### Contact
- Email : [Votre email]
- GitHub Issues : [Lien repo/issues]
- Documentation complète : Voir dossier `docs/`

---

## 🙏 Remerciements

- React & Vite pour le framework
- Electron pour l'application desktop
- Stripe pour les paiements
- OpenAI & Anthropic pour l'IA
- Lucide React pour les icônes

---

**Version** : 1.0.0  
**Date** : Février 2026  
**Status** : ✅ Production Ready (après configuration Stripe)

---

Made with ❤️ by the MEETIZY team

