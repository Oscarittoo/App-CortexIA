# 🎤 Configuration Whisper API

## Étapes pour activer la transcription professionnelle

### 1. Obtenir une clé API OpenAI

1. Aller sur https://platform.openai.com/signup
2. Créer un compte (gratuit)
3. Aller dans **API Keys** : https://platform.openai.com/api-keys
4. Cliquer sur **"Create new secret key"**
5. Copier la clé (elle commence par `sk-...`)

### 2. Ajouter la clé dans le projet

Ouvrir le fichier `.env` à la racine du projet et ajouter :

```env
VITE_OPENAI_API_KEY=sk-votre-cle-api-ici
```

### 3. Redémarrer l'application

```bash
npm start
```

## Coût

- **Whisper API** : $0.006 par minute
- **Session 30min** : ~$0.18
- **GPT-4 rapport** : ~$0.03
- **Total session** : ~$0.21

## Crédits gratuits

- Nouveau compte OpenAI = $5 gratuits
- Permet ~25 sessions de 30 minutes
- Valable 3 mois

## Fonctionnement

Une fois configuré :
- ✅ Transcription temps réel ultra-précise
- ✅ Fonctionne dans Electron (pas besoin Internet pour Web Speech)
- ✅ Support multi-langues (100+ langues)
- ✅ Ponctuation automatique
- ✅ Détection du locuteur

## Sans clé API

Sans clé, l'app utilise :
1. Web Speech API (gratuit mais ne marche pas dans Electron)
2. Mode démo (transcription simulée pour tests)
