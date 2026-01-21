# Configuration des Intégrations CORTEXIA

## 🎯 Vue d'ensemble

CORTEXIA supporte l'intégration avec de nombreuses plateformes de visioconférence, services de transcription et outils de productivité.

---

## 🎥 Plateformes de Visioconférence

### Zoom
**Documentation :** https://marketplace.zoom.us/docs/api-reference/introduction

**Étapes d'intégration :**
1. Créez une application sur le Zoom App Marketplace
2. Obtenez votre Client ID et Client Secret
3. Activez les permissions : `meeting:read`, `recording:read`
4. Ajoutez les clés dans CORTEXIA → Paramètres → Intégrations

**Fonctionnalités :**
- ✅ Accès aux meetings programmés
- ✅ Téléchargement automatique des enregistrements
- ✅ Extraction des participants
- ✅ Transcription automatique post-meeting

---

### Google Meet
**Documentation :** https://developers.google.com/meet/api

**Étapes d'intégration :**
1. Créez un projet dans Google Cloud Console
2. Activez l'API Google Meet
3. Créez des identifiants OAuth 2.0
4. Ajoutez les scopes : `https://www.googleapis.com/auth/meetings.space.readonly`

**Fonctionnalités :**
- ✅ Liste des meetings Google Calendar
- ✅ Accès aux transcriptions Meet natives
- ✅ Intégration avec Google Workspace

---

### Microsoft Teams
**Documentation :** https://learn.microsoft.com/en-us/graph/api/resources/teams-api-overview

**Étapes d'intégration :**
1. Enregistrez une application dans Azure AD
2. Obtenez Client ID, Client Secret et Tenant ID
3. Permissions requises : `OnlineMeetings.Read`, `CallRecords.Read.All`

**Fonctionnalités :**
- ✅ Accès aux meetings Teams
- ✅ Récupération des enregistrements
- ✅ Métadonnées des participants

---

### Cisco Webex
**Documentation :** https://developer.webex.com/docs/api/getting-started

**Étapes d'intégration :**
1. Créez une intégration sur developer.webex.com
2. Obtenez votre Client ID et Secret
3. Scopes : `meeting:schedules_read`, `spark:all`

---

### Slack Huddles
**Documentation :** https://api.slack.com/

**Fonctionnalités :**
- ✅ Transcription des Huddles
- ✅ Envoi automatique de résumés dans les channels

---

### Discord
**Documentation :** https://discord.com/developers/docs/intro

**Fonctionnalités :**
- ✅ Bot de transcription pour les voice channels
- ✅ Commandes slash intégrées

---

## 🎤 Services de Transcription

### OpenAI Whisper (Recommandé)
**Prix :** $0.006 / minute  
**Langues :** 50+  
**Précision :** 95%+

**Avantages :**
- Meilleure qualité multilingue
- Détection automatique de la langue
- Ponctuation intelligente

```bash
# Obtenir une clé API
https://platform.openai.com/api-keys
```

---

### Deepgram
**Prix :** $0.0125 / minute (temps réel)  
**Langues :** 30+  
**Latence :** < 300ms

**Avantages :**
- Transcription en temps réel ultra-rapide
- Détection de locuteurs (diarization)
- Vocabulaire personnalisé

---

### AssemblyAI
**Prix :** $0.00025 / seconde  
**Langues :** 20+

**Avantages :**
- Détection automatique de topics
- Résumés AI natifs
- Modération de contenu

---

### Azure Speech Services
**Prix :** $1.00 / heure (Standard)  
**Langues :** 100+

**Avantages :**
- Intégration Microsoft native
- Support entreprise
- Compliance SOC 2

---

## 📋 Outils de Productivité

### Notion
**Fonctionnalité :** Export automatique des comptes-rendus

**Configuration :**
1. Créez une intégration sur notion.so/my-integrations
2. Partagez une page avec votre intégration
3. Copiez le token d'intégration

**Format d'export :**
- Page avec blocs texte structurés
- Base de données des actions
- Propriétés : Date, Participants, Durée

---

### Trello
**Fonctionnalité :** Création automatique de cartes depuis les actions

**Configuration :**
1. Obtenez une API Key : https://trello.com/app-key
2. Générez un token avec permissions `read,write`

**Workflow :**
- Action détectée → Carte créée
- Deadline ajoutée
- Labels automatiques

---

### Asana
**Fonctionnalité :** Synchronisation des tâches

**Configuration :**
1. Générez un Personal Access Token
2. Sélectionnez le workspace cible

---

### Jira
**Fonctionnalité :** Création de tickets

**Configuration :**
1. Créez un API Token : https://id.atlassian.com/manage/api-tokens
2. Format : email + token

---

### Linear
**Fonctionnalité :** Gestion de projet intégrée

**Configuration :**
1. Settings → API → Create API Key
2. Permissions : `write:issues`

---

## 📧 Services Email

### SendGrid
**Fonctionnalité :** Envoi automatique des comptes-rendus

**Configuration :**
1. Créez une API Key sur sendgrid.com
2. Vérifiez votre domaine d'envoi

---

## 🔐 Sécurité

### Stockage des Clés
- ✅ Toutes les clés sont stockées localement (localStorage)
- ✅ Jamais envoyées à des serveurs tiers
- ✅ Chiffrement en transit uniquement

### Bonnes Pratiques
1. N'utilisez que des API Keys avec permissions minimales
2. Rotation régulière des secrets (tous les 90 jours)
3. Utilisez des environnements séparés (dev/prod)
4. Activez l'authentification 2FA sur tous les services

---

## 📊 Comparaison des Services de Transcription

| Service | Prix | Langues | Temps réel | Diarization | Précision |
|---------|------|---------|------------|-------------|-----------|
| Whisper | $0.006/min | 50+ | ❌ | ❌ | 95% |
| Deepgram | $0.0125/min | 30+ | ✅ | ✅ | 92% |
| AssemblyAI | $0.015/min | 20+ | ✅ | ✅ | 94% |
| Azure | $1.00/heure | 100+ | ✅ | ✅ | 93% |

---

## 🚀 Démarrage Rapide

### Configuration Minimale (Gratuite)
```bash
# Aucune clé requise pour démarrer
# Utilise Web Speech API du navigateur
# Limité à Chrome/Edge
```

### Configuration Recommandée
```bash
VITE_OPENAI_API_KEY=sk-...          # $0.006/min
VITE_ZOOM_CLIENT_ID=...              # Gratuit
VITE_NOTION_API_KEY=secret_...       # Gratuit
```

### Configuration Entreprise
```bash
# Transcription
VITE_DEEPGRAM_API_KEY=...            # $0.0125/min

# Intégrations
VITE_TEAMS_CLIENT_ID=...
VITE_GOOGLE_CLIENT_ID=...

# Productivité
VITE_JIRA_API_TOKEN=...
VITE_SLACK_CLIENT_ID=...
```

---

## 🆘 Support

**Problèmes fréquents :**

### "API Key invalide"
→ Vérifiez que la clé est complète (pas de coupure)  
→ Testez la clé avec curl avant

### "Permissions insuffisantes"
→ Vérifiez les scopes OAuth  
→ Régénérez un token avec les bonnes permissions

### "Rate limit atteint"
→ Ajoutez des délais entre appels  
→ Passez à un plan supérieur

---

**Documentation complète :** [DOCUMENTATION_TECHNIQUE.md](DOCUMENTATION_TECHNIQUE.md)
