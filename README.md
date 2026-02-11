# MEETIZY

Assistant de réunions avec transcription en temps réel, génération de compte-rendu et export professionnel. L’application fonctionne en mode web (Vite + React) et peut être lancée dans un wrapper Electron.

## Fonctionnalités clés

- Transcription en temps réel (Web Speech API)
- Résumé, actions et décisions (LLM optionnel)
- Templates de rapports
- Export PDF, Markdown et texte
- Historique, tags et recherche avancée
- Authentification Supabase
- Isolation stricte des données par utilisateur

## Stack technique

- React 18 + Vite
- Supabase Auth + table `clients`
- Stockage local par utilisateur (localStorage)
- jsPDF + autoTable pour l’export PDF
- Lucide React, Chart.js / Recharts
- Electron (optionnel)

## Démarrage rapide

### Prérequis

- Node.js 18+
- Chrome / Edge (Web Speech API)

### Installation

1. Installer les dépendances :
   - `npm install`
2. Créer un fichier `.env` (voir `.env.example`)
3. Démarrer l’application :
   - `npm run dev` (web)
   - `npm start` (web + Electron)

### Scripts utiles

- `npm run dev` : Vite en mode développement
- `npm run build` : Build de production
- `npm run electron` : Lancer Electron seul
- `npm start` : Vite + Electron
- `npm run generate-pdfs` : Génération PDF (script de build)

## Configuration (.env)

Variables minimales recommandées :

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

LLM optionnel :

- `VITE_LLM_PROVIDER` (openai | claude)
- `VITE_OPENAI_API_KEY`
- `VITE_ANTHROPIC_API_KEY`

## Données et confidentialité

- Les sessions, tags et templates sont stockés localement par utilisateur.
- Supabase gère l’authentification et les plans.
- La transcription Web Speech API nécessite une connexion internet.

## Limitations connues

- La Web Speech API n’est pas disponible sur Firefox.
- La transcription vocale ne fonctionne pas dans l’app Electron (limitation technique du moteur). Utilisez Chrome/Edge.

## Documentation

- `QUICK_START.md` : guide utilisateur
- `DOCUMENTATION_TECHNIQUE.md` : architecture et flux
- `QA_CHECKLIST.md` : checklist qualité et tests fonctionnels

## Support

Pour signaler un problème, joignez :

- Étapes de reproduction
- Logs console (F12)
- Version du navigateur et OS
