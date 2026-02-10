# 🎯 Meetizy - Documentation Complète de l'Agent IA

## 📋 Vue d'ensemble

L'Agent IA Meetizy est composé de **deux parties principales** :

1. **Application Web** (React + Vite) - Interface principale de Meetizy
2. **Extension Chrome** - Plugin pour intégrer l'IA dans les réunions en ligne

---

## 🏗️ Architecture du Système

```
Meetizy Ecosystem
│
├── Application Web (localhost:5173)
│   ├── Interface utilisateur complète
│   ├── Gestion des sessions
│   ├── Export PDF
│   ├── Dashboard analytics
│   └── Système de tarification
│
└── Extension Chrome
    ├── Widget flottant dans les réunions
    ├── Transcription temps réel
    ├── Synchronisation avec l'app web
    └── Intégration ChatGPT-4
```

---

## 📦 Composants Créés

### 1. Page d'Installation du Plugin (`src/components/PluginInstall.jsx`)

**Fonctionnalités :**
- Guide d'installation pas à pas
- Téléchargement du manifest
- Instructions pour Chrome Web Store (futur)
- Design moderne cohérent avec Meetizy

**Navigation :**
- Accessible via le bouton "Installer l'agent interactif IA" dans la navbar
- Route : `/plugin-install`

### 2. Page Fonctionnalités Enrichie (`src/components/Features.jsx`)

**Nouveautés ajoutées :**
- Section "Fonctionnalités par Plan" avec grille comparative
- 5 colonnes (Free, Pro, Business, Expert, Enterprise)
- Check marks ✓ et X pour features incluses/exclues
- Badge "POPULAIRE" sur le plan Business
- Responsive (5 → 3 → 2 → 1 colonnes)

**Détails des plans :**
```
Free       : 1 réunion IA, transcription basique, export TXT
Pro        : 10 réunions/mois, synthèse IA, PDF, recherche sémantique
Business   : 20 réunions/membre, collaboration, templates, intégrations
Expert     : Illimité, API REST, white-label, SSO
Enterprise : On-premise, infrastructure dédiée, SLA 99,9%
```

### 3. Extension Chrome (dossier `chrome-extension/`)

#### Fichiers principaux :

##### **manifest.json**
Configuration de l'extension Manifest V3 :
- Permissions : activeTab, storage, tabs, scripting
- Host permissions : Google Meet, Teams, Zoom
- Service worker : background.js
- Content scripts : injectés dans les pages de réunion

##### **popup.html + popup.js**
Interface du popup (360px) :
- Statut de connexion à Meetizy
- Plateforme détectée (Meet/Teams/Zoom)
- Statut de transcription
- Boutons : Démarrer/Arrêter, Ouvrir Meetizy, Paramètres

##### **background.js**
Service worker gérant :
- Sessions de transcription
- Sauvegarde locale (Chrome Storage)
- Synchronisation avec l'app web (http://localhost:5173)
- Notifications utilisateur
- Gestion des événements

##### **content.js + content.css**
Script injecté dans les pages de réunion :
- Widget flottant (320px) déplaçable
- Reconnaissance vocale Web Speech API
- Transcription en temps réel
- Affichage visuel des paroles transcrites
- Communication avec background.js

##### **ai-service.js**
Service d'intégration ChatGPT-4 :
- Connexion API OpenAI
- Génération de synthèses
- Création de plans d'action
- Suggestions en temps réel
- Détection automatique d'actions
- Enrichissement sémantique

##### **options.html + options.js**
Page de configuration :
- Saisie clé API OpenAI
- Choix du modèle (GPT-4 Turbo / GPT-4 / GPT-3.5)
- Langue de transcription
- Options auto-start et auto-sync
- Statistiques d'utilisation

---

## 🔄 Flux de Fonctionnement

### Scénario 1 : Installation

```
1. Utilisateur clique sur "Installer l'agent interactif IA"
   ↓
2. Navigation vers page PluginInstall
   ↓
3. Téléchargement du manifest.json
   ↓
4. Installation manuelle dans chrome://extensions
   ↓
5. Configuration de la clé API OpenAI dans options
```

### Scénario 2 : Utilisation dans une réunion

```
1. Utilisateur rejoint Google Meet / Teams / Zoom
   ↓
2. Extension détecte la plateforme automatiquement
   ↓
3. Clic sur l'icône extension → Popup s'ouvre
   ↓
4. Clic "Démarrer la transcription"
   ↓
5. Widget flottant apparaît dans la page
   ↓
6. Reconnaissance vocale commence (Web Speech API)
   ↓
7. Transcription affichée en temps réel dans le widget
   ↓
8. Chaque segment sauvegardé via background.js
   ↓
9. À la fin : "Arrêter la transcription"
   ↓
10. Session complète envoyée à Meetizy app (sync)
```

### Scénario 3 : Génération IA (ChatGPT-4)

```
1. Session de transcription terminée
   ↓
2. Background.js invoque ai-service.js
   ↓
3. generateSummary(transcript) → Synthèse structurée
   ↓
4. generateActionPlan(transcript) → Plan d'action JSON
   ↓
5. enrichTranscription(transcript) → Métadonnées sémantiques
   ↓
6. Résultats stockés avec la session
   ↓
7. Synchronisation avec Meetizy app
   ↓
8. Affichage dans le dashboard
```

---

## 🔌 API & Intégrations

### OpenAI API (GPT-4)

**Endpoints utilisés :**
- `POST https://api.openai.com/v1/chat/completions`
- `GET https://api.openai.com/v1/models` (test connexion)

**Fonctions disponibles :**
1. `generateSummary()` - Synthèse cognitive de la réunion
2. `generateActionPlan()` - Extraction des tâches et actions
3. `getRealTimeSuggestion()` - Suggestions pendant la réunion
4. `detectActionItems()` - Détection d'actions dans les segments
5. `enrichTranscription()` - Analyse sémantique complète

### Meetizy App API (Future)

**Endpoints à implémenter dans l'app web :**
```
POST /api/sync
  → Synchroniser une session depuis l'extension

GET /api/health
  → Vérifier que l'app est en ligne

POST /api/sessions
  → Créer une nouvelle session

PUT /api/sessions/:id
  → Mettre à jour une session existante
```

---

## 🎨 Design System

**Thème NovaPulse :**
- Background : `#0f172a` → `#1e293b` (gradient)
- Primary : `#38bdf8` (cyan)
- Secondary : `#0ea5e9`
- Accent : `#8b5cf6` (purple), `#e11d48` (pink)
- Font : SF Pro Display / SF Pro Text (système Apple)

**Composants réutilisables :**
- Boutons : `.btn-primary`, `.btn-secondary`, `.btn-outline`
- Cards : `.settings-card`, `.install-card`, `.plan-column`
- Badges : `.badge-new`, `.popular-badge`
- Alerts : `.alert-success`, `.alert-error`

---

## 📊 Stockage des Données

### Chrome Storage (Extension)

```javascript
{
  // Configuration
  openai_api_key: "sk-...",
  openai_model: "gpt-4-turbo-preview",
  transcription_language: "fr-FR",
  auto_start_transcription: false,
  auto_sync: true,
  
  // État
  isConnected: true,
  isRecording: false,
  currentSession: { ... },
  
  // Historique
  sessions: [
    {
      id: "session_...",
      platform: "Google Meet",
      title: "Réunion équipe",
      startTime: "2026-02-10T10:00:00Z",
      endTime: "2026-02-10T11:00:00Z",
      transcript: [
        { timestamp, speaker, text }
      ]
    }
  ],
  
  // Stats
  ai_usage_stats: {
    total_requests: 42,
    total_tokens: 15000,
    last_request: "2026-02-10T11:00:00Z"
  }
}
```

### LocalStorage (Application Web)

```javascript
{
  sessions: [...],
  user: {...},
  settings: {...}
}
```

---

## 🚀 Prochaines Étapes

### Phase 1 : Base (✅ COMPLÉTÉ)
- [x] Page d'installation du plugin
- [x] Extension Chrome complète
- [x] Widget flottant dans les réunions
- [x] Transcription temps réel
- [x] Intégration ChatGPT-4
- [x] Page de configuration

### Phase 2 : Amélioration (En cours)
- [ ] Générer les icônes 16x16, 48x48, 128x128
- [ ] Implémenter l'API /sync dans l'app web
- [ ] Tester la synchronisation complète
- [ ] Améliorer le design du widget

### Phase 3 : Publication
- [ ] Publier sur Chrome Web Store
- [ ] Créer une page de support
- [ ] Documentation utilisateur complète
- [ ] Vidéo de démonstration

### Phase 4 : Fonctionnalités avancées
- [ ] Support multilingue complet
- [ ] Intégration Slack/Teams/Discord
- [ ] Mode hors ligne avec sync différée
- [ ] Analytics avancés
- [ ] API publique pour développeurs

---

## 🐛 Debug & Troubleshooting

### Extension ne s'installe pas
```
Solution : Vérifier que le Mode Développeur est activé
dans chrome://extensions
```

### Transcription ne démarre pas
```
Causes possibles :
1. Microphone non autorisé → Vérifier les permissions Chrome
2. Plateforme non supportée → Uniquement Meet/Teams/Zoom
3. Web Speech API non disponible → Utiliser Chrome/Edge
```

### IA ne répond pas
```
Vérifications :
1. Clé API OpenAI configurée dans options
2. Clé valide (commence par "sk-")
3. Solde OpenAI suffisant
4. Console browser pour voir les erreurs réseau
```

### Synchronisation échoue
```
Vérifications :
1. App Meetizy en cours d'exécution sur localhost:5173
2. CORS configuré dans l'app web
3. Endpoints /api/sync et /api/health implémentés
```

---

## 📚 Ressources Utiles

**Documentation Chrome Extensions :**
- [Manifest V3](https://developer.chrome.com/docs/extensions/mv3/)
- [Content Scripts](https://developer.chrome.com/docs/extensions/mv3/content_scripts/)
- [Service Workers](https://developer.chrome.com/docs/extensions/mv3/service_workers/)

**API OpenAI :**
- [Documentation officielle](https://platform.openai.com/docs)
- [Pricing](https://openai.com/pricing)
- [API Keys](https://platform.openai.com/api-keys)

**Web Speech API :**
- [MDN Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [Browser Support](https://caniuse.com/speech-recognition)

---

## 👥 Support

**Contact :**
- Email : support@meetizy.com
- Discord : [discord.gg/meetizy]
- GitHub : [github.com/meetizy]

**Contributeurs :**
- Chef de projet : [Votre nom]
- Développement : GitHub Copilot + Équipe Meetizy
- Design : NovaPulse Theme

---

**Date de création :** 10 Février 2026  
**Version actuelle :** 1.0.0  
**Statut :** ✅ Version Beta Fonctionnelle

---

© 2026 Meetizy · Tous droits réservés
