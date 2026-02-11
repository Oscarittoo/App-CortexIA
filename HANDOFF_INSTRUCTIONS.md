# 🚀 Instructions de passation - Meetizy

**Date** : 11 février 2026  
**Pour** : Collaborateur GitHub  
**État** : Prêt pour push (après sécurisation clé API)

---

## ⚠️ ACTIONS URGENTES AVANT PUSH

### 🔴 1. Révoquer la clé API Anthropic exposée

**Une clé API Anthropic a été exposée dans les logs et DOIT être révoquée immédiatement :**
```
sk-ant-api03-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
(Clé masquée pour sécurité - vérifiez vos logs pour identifier la clé exacte)
```

**Procédure :**
1. Aller sur https://console.anthropic.com/settings/keys
2. Se connecter avec le compte Anthropic du projet
3. Trouver la clé exposée (vérifiez vos logs de session)
4. Cliquer sur "Revoke" / "Révoquer"
5. Créer une nouvelle clé API
6. Copier la nouvelle clé
7. Remplacer dans le fichier `.env` :
   ```bash
   VITE_ANTHROPIC_API_KEY=nouvelle_clé_ici
   ```

### 🟡 2. Vérifier .gitignore

**S'assurer que `.env` est bien ignoré par Git :**

```bash
# Dans le terminal
cat .gitignore | grep .env
```

Si `.env` n'apparaît pas, l'ajouter :
```bash
echo ".env" >> .gitignore
```

### ✅ 3. Supprimer données sensibles de l'historique

Si le fichier `.env` a déjà été commité par erreur, nettoyer l'historique Git :
```bash
# NE PAS exécuter si vous n'êtes pas sûr
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all
```

⚠️ **ATTENTION** : Cette commande réécrit l'historique Git. À utiliser avec précaution.

---

## 📦 Push sur GitHub

### Étape 1 : Vérifier l'état
```bash
cd C:\Users\Utilisateur\Downloads\cortexa
git status
```

### Étape 2 : Ajouter les fichiers modifiés
```bash
git add src/services/llmService.js
git add src/components/SessionReport.jsx
git add src/components/Settings.jsx
git add src/utils/storage.js
git add vite.config.js
git add QA_REPORT_COMPLETE.md
git add HANDOFF_INSTRUCTIONS.md
```

**NE PAS ajouter :**
- `.env` (clés API sensibles)
- `node_modules/` (dépendances)
- `dist/` (build)

### Étape 3 : Commiter
```bash
git commit -m "fix: Update Claude API to v4.5 + CORS proxy + comprehensive QA report

- Update Claude model from deprecated 3.5 to Claude 4.5 Sonnet (claude-sonnet-4-5-20250929)
- Add Anthropic proxy in vite.config.js to bypass CORS in development
- Improve LLM prompts with strict JSON format and post-processing
- Add AI report metadata display in SessionReport
- Add 'Purge AI reports' feature in Settings
- Create comprehensive QA report (QA_REPORT_COMPLETE.md)

SECURITY NOTE: Old Anthropic API key has been revoked and replaced with new key (not committed)
"
```

### Étape 4 : Push
```bash
# Si le repo distant existe déjà
git push origin main

# Si c'est un nouveau repo GitHub
git remote add origin https://github.com/votre-username/meetizy.git
git branch -M main
git push -u origin main
```

---

## 🧪 Validation post-push

### Sur une autre machine (ou après clone)

1. **Cloner le repo**
   ```bash
   git clone https://github.com/votre-username/meetizy.git
   cd meetizy
   ```

2. **Créer le fichier .env**
   ```bash
   cp .env.example .env
   # Ou créer manuellement
   ```

3. **Remplir les variables**
   ```bash
   # .env
   VITE_OPENAI_API_KEY=your_openai_key_here
   VITE_ANTHROPIC_API_KEY=your_new_anthropic_key_here
   VITE_LLM_PROVIDER=claude
   VITE_ANTHROPIC_MODEL=claude-sonnet-4-5-20250929
   VITE_SUPABASE_URL=https://rgjjzsteaghpgsotkjhy.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnamp6c3RlYWdocGdzb3Rramh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxNTE4MzMsImV4cCI6MjA4NTcyNzgzM30.KodYkFE1IXTUcylQzu9R3NfM2Thmav-gCQGxvpwku4s
   ```

4. **Installer dépendances**
   ```bash
   npm install
   ```

5. **Lancer dev server**
   ```bash
   npm run dev
   ```

6. **Tester génération rapport**
   - Aller sur http://localhost:5173 (ou port affiché)
   - Se connecter avec compte test
   - Créer nouvelle session ou ouvrir session existante
   - Générer rapport
   - **Vérifier header** : `IA : claude (claude-sonnet-4-5-20250929)`
   - **Valider qualité** : Contexte, points-clés, conclusion cohérents

---

## 📋 Tests restants pour votre collaborateur

### Priorité HAUTE (bloquants production)
- [ ] **Génération rapports IA** - Valider que Claude 4.5 génère des synthèses de qualité
- [ ] **Exports PDF** - Vérifier que l'export PDF fonctionne et mise en page correcte
- [ ] **Éditeur session** - Tester modification/suppression segments de transcription
- [ ] **Historique complet** - Recherche, filtres, suppression sessions

### Priorité MOYENNE
- [ ] Templates personnalisés (sélection, création)
- [ ] Régression UI (cohérence visuelle, boutons, emojis)
- [ ] Paramètres utilisateur (changement plan, préférences)

### Priorité BASSE
- [ ] Electron (lancement, navigation, limitations transcription)
- [ ] Extension Chrome (installation, popup, widget)

### Détails des tests
Voir le fichier **`QA_REPORT_COMPLETE.md`** pour :
- Résultats des tests déjà effectués (50% complété)
- Problèmes techniques identifiés et solutions
- Instructions détaillées pour chaque section de test

---

## 🛠️ Problèmes techniques résolus

### ✅ Modèle Claude obsolète
- **Avant** : `claude-3-5-sonnet-20240620` (déprécié juin 2024)
- **Après** : `claude-sonnet-4-5-20250929` (Claude 4.5 Sonnet, septembre 2025)
- **Fichier** : `.env` et `src/services/llmService.js`

### ✅ CORS bloquant appels Anthropic
- **Problème** : Appels directs depuis navigateur refusés
- **Solution** : Proxy ajouté dans `vite.config.js` (`/api/anthropic`)
- **Impact** : Seulement en dev, ne concerne pas production

### ✅ Synthèses approximatives
- **Problème** : Contexte et mots-clés génériques
- **Solution** : Prompts améliorés avec format JSON strict + post-processing

### ✅ Cache rapports IA
- **Fonctionnalité** : Nouveau bouton "Purger les rapports IA" dans Settings → Data
- **Usage** : Permet de régénérer rapports après fix/config LLM

---

## 📚 Documentation technique

### Structure du projet
```
cortexa/
├── src/
│   ├── services/
│   │   └── llmService.js         # Service LLM (Claude/OpenAI)
│   ├── components/
│   │   ├── SessionReport.jsx     # Affichage rapports + génération
│   │   └── Settings.jsx          # Paramètres + purge
│   └── utils/
│       └── storage.js            # localStorage + isolation user
├── vite.config.js                # Config Vite + proxy Anthropic
├── .env                          # Variables d'environnement (NON COMMIS)
├── QA_REPORT_COMPLETE.md         # Rapport QA complet
└── HANDOFF_INSTRUCTIONS.md       # Ce fichier
```

### Configuration LLM

**Provider supportés :**
- `openai` : GPT-4 (OpenAI API)
- `claude` : Claude 4.5 / 3.5 (Anthropic API)

**Variables d'environnement :**
```bash
# Provider à utiliser (openai ou claude)
VITE_LLM_PROVIDER=claude

# Clés API (ne pas commiter)
VITE_OPENAI_API_KEY=sk-...
VITE_ANTHROPIC_API_KEY=sk-ant-api03-...

# Modèle Claude (optionnel, défaut dans code)
VITE_ANTHROPIC_MODEL=claude-sonnet-4-5-20250929

# Supabase
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=eyJ...
```

**Modèles Claude valides (février 2026) :**
```
✅ claude-sonnet-4-5-20250929     # Recommandé (Sonnet 4.5)
✅ claude-opus-4-5-20251101        # Plus puissant
✅ claude-haiku-4-5-20251001       # Plus rapide
✅ claude-3-5-sonnet-20241022      # Fallback Sonnet 3.5
✅ claude-3-5-haiku-20241022       # Économique
```

### Proxy dev Anthropic

**Endpoint** : `/api/anthropic`  
**Port** : Automatique (Vite trouve port libre, généralement 5173 ou 5176)  
**Usage** : Contourne CORS en dev, la clé API reste côté serveur

**Fonctionnement :**
```
Browser → http://localhost:5176/api/anthropic → Vite proxy → api.anthropic.com
```

---

## 🐛 Debugging

### Si génération rapport échoue

1. **Vérifier console navigateur (F12)**
   ```javascript
   // Erreurs à chercher
   "Claude API error: 404" → Modèle obsolète → Vérifier .env
   "CORS error" → Proxy non démarré → Redémarrer Vite
   "API key invalid" → Clé révoquée/invalide → Vérifier .env
   ```

2. **Vérifier variables d'environnement chargées**
   ```javascript
   // Dans console navigateur
   console.log(import.meta.env.VITE_LLM_PROVIDER);        // "claude"
   console.log(import.meta.env.VITE_ANTHROPIC_MODEL);     // "claude-sonnet-4-5-20250929"
   ```

3. **Vérifier proxy Vite actif**
   ```bash
   # Dans logs serveur Vite
   # Doit voir : "anthropic-proxy" dans la liste des plugins
   ```

4. **Purger cache et régénérer**
   - Settings → Data → "Purger les rapports IA"
   - Retour à session → Régénérer rapport

### Si build échoue

```bash
# Nettoyer node_modules
rm -rf node_modules package-lock.json
npm install

# Nettoyer cache Vite
rm -rf node_modules/.vite

# Rebuild
npm run build
```

---

## 📞 Contact & Support

### Infos projet
- **Nom** : Meetizy (Cortexia)
- **Type** : App web de transcription + IA
- **Stack** : React + Vite + Supabase + Claude AI

### Logs utiles
```bash
# Dev server
npm run dev

# Build
npm run build

# Preview production
npm run preview
```

### Fichiers de référence
- `QA_REPORT_COMPLETE.md` - Rapport QA détaillé
- `PROJECT_SUMMARY.md` - Vue d'ensemble projet
- `DOCUMENTATION_TECHNIQUE.md` - Doc technique complète

---

## ✅ Checklist passation

Avant de transférer le projet à votre collaborateur :

- [ ] Clé Anthropic API révoquée
- [ ] Nouvelle clé API créée et testée
- [ ] `.env` mis à jour avec nouvelle clé
- [ ] `.env` vérifié dans `.gitignore`
- [ ] Test génération rapport réussi avec Claude 4.5
- [ ] Header rapport affiche : "IA : claude (claude-sonnet-4-5-20250929)"
- [ ] Qualité synthèse validée (contexte, points-clés, conclusion cohérents)
- [ ] Tous les fichiers modifiés commités
- [ ] Push sur GitHub réussi
- [ ] Clone test effectué sur autre machine
- [ ] Instructions de passation lues par collaborateur

---

**BON COURAGE À VOTRE COLLABORATEUR ! 🚀**

Pour toute question sur les modifications techniques, se référer aux commentaires dans le code et au rapport QA complet.
