# Guide d'intégration des APIs

## Configuration des clés API

### 1. Créer votre fichier .env

Copiez le fichier `.env.example` vers `.env` :

```bash
cp .env.example .env
```

### 2. OpenAI (Whisper + GPT-4)

**Pour la transcription professionnelle et les résumés intelligents**

1. Créez un compte sur https://platform.openai.com
2. Générez une clé API dans Settings > API Keys
3. Ajoutez dans votre `.env` :

```env
VITE_OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx
VITE_LLM_PROVIDER=openai
```

**Coûts estimés :**
- Transcription (Whisper) : 0.006$/minute
- Résumés (GPT-4) : ~0.03$ par session

**Pour une réunion de 30 minutes : ~0.21$**

### 3. Alternative : Anthropic Claude

**Pour les résumés (alternative à GPT-4)**

1. Créez un compte sur https://console.anthropic.com
2. Générez une clé API
3. Ajoutez dans votre `.env` :

```env
VITE_ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxx
VITE_LLM_PROVIDER=claude
```

**Coûts estimés :**
- Claude Sonnet : ~0.015$ par session

### 4. Alternative : Deepgram

**Pour la transcription (alternative à Whisper)**

1. Créez un compte sur https://deepgram.com
2. Obtenez votre API key
3. Modifiez `src/services/transcriptionService.js` pour utiliser Deepgram

**Coûts estimés :**
- Transcription en temps réel : 0.0043$/minute
- Pay-as-you-go avec crédits gratuits pour démarrer

## Fonctionnement

### Mode de fallback intelligent

L'application fonctionne **même sans API configurée** :

- **Sans API OpenAI** : Utilise Web Speech API (gratuit, moins précis)
- **Sans API LLM** : Génère des résumés simulés basés sur des templates

### Avec APIs configurées

1. **Transcription** : 
   - Si `VITE_OPENAI_API_KEY` est configurée → Utilise Whisper API
   - Sinon → Fallback sur Web Speech API

2. **Résumés intelligents** :
   - Si API LLM configurée → Génère des vrais résumés contextuels
   - Sinon → Utilise des templates pré-définis

## Test de connexion

Dans l'interface CORTEXIA, allez dans **Paramètres** :

1. Onglet **Intégrations**
2. Entrez vos clés API
3. Cliquez sur "Tester la connexion"
4. Vérifiez que le statut passe à "Connecté"

## Sécurité

- Les clés API sont stockées dans `.env` (jamais commitées sur Git)
- `.env` est déjà dans `.gitignore`
- Les appels API sont faits directement depuis le client (Electron)
- Pour la production, considérez un backend proxy pour masquer les clés

## Performances

### Transcription en temps réel

- **Whisper** : Chunks de 5 secondes envoyés à l'API
- **Web Speech API** : Transcription instantanée (navigateur)

### Génération de résumés

- Lancée à la fin de la session
- Durée : 3-10 secondes selon la longueur
- Affiche un loader pendant la génération

## Limites

### OpenAI Whisper

- Maximum 25 MB par fichier audio
- Formats supportés : mp3, mp4, mpeg, mpga, m4a, wav, webm
- Langues : 50+ langues supportées

### GPT-4

- Maximum 8,192 tokens par requête (GPT-4) ou 128,000 (GPT-4 Turbo)
- Rate limit : 3,500 RPM (requêtes par minute)

### Claude

- Maximum 200,000 tokens par requête
- Rate limit dépend de votre tier

## Budget recommandé

### Pour une petite équipe (10 personnes)

- **Utilisation moyenne** : 5 réunions/personne/mois = 50 sessions
- **Durée moyenne** : 30 minutes par session
- **Coût mensuel** : 50 × 0.21$ = **10.50$/mois**

### Pour une entreprise (100 personnes)

- **Utilisation moyenne** : 250 sessions/mois
- **Coût mensuel** : 250 × 0.21$ = **52.50$/mois**

## Optimisations possibles

1. **Cache local** : Ne pas regénérer les résumés déjà créés
2. **Compression audio** : Réduire la taille des fichiers avant envoi
3. **Batch processing** : Grouper plusieurs petits segments
4. **Limites utilisateur** : Max 10 sessions/jour par utilisateur
5. **Backend proxy** : Centraliser les appels API pour monitoring

## Support

En cas de problème :

1. Vérifiez vos clés API dans le fichier `.env`
2. Consultez la console du navigateur (DevTools)
3. Vérifiez votre crédit API sur les plateformes
4. Testez avec une petite réunion de 1-2 minutes d'abord

## Variables d'environnement complètes

Voici toutes les variables disponibles :

```env
# Transcription
VITE_OPENAI_API_KEY=sk-proj-xxxxx        # Pour Whisper
VITE_DEEPGRAM_API_KEY=xxxxx              # Alternative

# LLM pour résumés
VITE_LLM_PROVIDER=openai                 # 'openai' ou 'claude'
VITE_ANTHROPIC_API_KEY=sk-ant-xxxxx     # Pour Claude

# Optionnel : Personnalisation
VITE_MAX_SESSION_DURATION=7200           # 2 heures max
VITE_MAX_TRANSCRIPT_LENGTH=50000         # Max caractères
```

---

**Note** : L'application fonctionne parfaitement sans aucune API configurée, avec des fonctionnalités de fallback intelligentes. Les APIs sont optionnelles pour améliorer la qualité.
