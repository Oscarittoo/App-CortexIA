# Documentation technique

## Vue d’ensemble

MEETIZY est une application React/Vite avec authentification Supabase, transcription temps réel via Web Speech API, génération de rapports (LLM optionnel) et export PDF. Les données utilisateur sont isolées côté client via des clés de stockage dédiées.

## Architecture

- **Frontend** : React 18 + Vite
- **Auth** : Supabase Auth + table `clients`
- **Stockage local** : localStorage par utilisateur
- **Exports** : jsPDF + autoTable
- **Electron** : wrapper optionnel (non recommandé pour la transcription)

## Flux principal

1. Connexion via Supabase
2. Démarrage d’une session
3. Transcription en direct (Web Speech API)
4. Fin de session → génération du rapport
5. Export et historisation

## Structure applicative

- `src/App.jsx` : orchestration des vues et état global
- `src/components/` : écrans et composants UI
- `src/services/` : services métier (auth, transcription, LLM, PDF)
- `src/utils/storage.js` : stockage local isolé par utilisateur

## Stockage local

Les données sont enregistrées avec une clé par utilisateur. Exemple :

- `meetizy_sessions_<userId>`
- `meetizy_tags_<userId>`
- `meetizy_templates_<userId>`

Les sessions incluent `userId` pour garantir l’isolation.

## Authentification

`authService.js` gère :

- Connexion / inscription Supabase
- Synchronisation avec la table `clients`
- Plan et rôle utilisateur

## Services clés

### Transcription
- `transcriptionService.js` utilise Web Speech API.
- Redémarrage automatique et gestion des erreurs.

### LLM
- `llmService.js` gère la génération de résumé/actions/décisions.
- Support OpenAI et Anthropic.
- Fallback local si aucune clé n’est configurée.

### Export PDF
- `pdfExportService.js` génère un rapport structuré.

### Templates
- `templateService.js` applique des sections prêtes à l’emploi.

## Limitations connues

- Web Speech API non supportée par Firefox.
- Transcription indisponible dans Electron (limitation du moteur).
- Qualité dépendante de l’audio et de la connexion réseau.

## Configuration

Variables recommandées dans `.env` :

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_LLM_PROVIDER`
- `VITE_OPENAI_API_KEY`
- `VITE_ANTHROPIC_API_KEY`

## Sécurité

- Authentification centralisée via Supabase.
- Données locales isolées par utilisateur.
- Aucun partage de sessions entre utilisateurs.

## Tests fonctionnels

Voir `QA_CHECKLIST.md` pour la validation complète en pré-production.
