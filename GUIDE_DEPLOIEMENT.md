# 🚀 Guide de Déploiement Meetizy

Ce guide vous accompagne pour mettre votre application en ligne sur **Vercel** (Frontend) et **Render** (Backend).

---

## 📋 Prérequis

- ✅ Compte GitHub (déjà configuré)
- ✅ Code poussé sur GitHub (fait)
- 🆕 Compte [Vercel](https://vercel.com) (gratuit)
- 🆕 Compte [Render](https://render.com) (gratuit)

---

## 🎯 Étape 1 : Déployer le Backend sur Render

### 1.1 Créer un compte Render
1. Allez sur [render.com](https://render.com)
2. Cliquez sur **"Get Started"**
3. Connectez-vous avec votre compte GitHub

### 1.2 Créer un nouveau Web Service
1. Dans le dashboard Render, cliquez sur **"New +"** → **"Web Service"**
2. Connectez votre dépôt GitHub : `App-CortexIA`
3. Configurez le service :
   - **Name** : `meetizy-backend` (ou un nom de votre choix)
   - **Root Directory** : `backend`
   - **Environment** : `Node`
   - **Region** : `Frankfurt (EU Central)` ou le plus proche
   - **Branch** : `main`
   - **Build Command** : `npm install`
   - **Start Command** : `npm start`
   - **Plan** : `Free`

### 1.3 Configurer les Variables d'Environnement
Dans l'onglet **"Environment"** de votre service Render, ajoutez :

```
NODE_ENV=production
PORT=3001
OPENAI_API_KEY=votre_clé_openai_sk-...
JWT_SECRET=votre_secret_jwt_généré (utilisez un générateur de secret)
SUPABASE_URL=votre_url_supabase (si utilisé)
SUPABASE_KEY=votre_clé_supabase (si utilisé)
```

> **🔐 Important** : Pour générer un JWT_SECRET sécurisé, utilisez :
> ```powershell
> -join ((33..126) | Get-Random -Count 64 | ForEach-Object {[char]$_})
> ```

### 1.4 Déployer
1. Cliquez sur **"Create Web Service"**
2. Render va automatiquement :
   - Cloner votre repo
   - Installer les dépendances
   - Démarrer le serveur
3. **Notez l'URL de votre backend** : `https://meetizy-backend.onrender.com`

> ⚠️ **Note** : Le plan gratuit de Render met le service en veille après 15 min d'inactivité. Le premier appel peut prendre ~30-60 secondes.

---

## 🌐 Étape 2 : Déployer le Frontend sur Vercel

### 2.1 Créer un compte Vercel
1. Allez sur [vercel.com](https://vercel.com)
2. Cliquez sur **"Sign Up"**
3. Connectez-vous avec votre compte GitHub

### 2.2 Importer le projet
1. Dans le dashboard Vercel, cliquez sur **"Add New..."** → **"Project"**
2. Importez votre dépôt : `App-CortexIA`
3. Configurez le projet :
   - **Framework Preset** : `Vite` (détecté automatiquement)
   - **Root Directory** : `./` (racine)
   - **Build Command** : `npm run build`
   - **Output Directory** : `dist`
   - **Install Command** : `npm install`

### 2.3 Configurer les Variables d'Environnement
Dans l'onglet **"Environment Variables"**, ajoutez :

```
VITE_API_URL=https://meetizy-backend.onrender.com
```

> 🔗 **Remplacez** par l'URL exacte de votre backend Render (étape 1.4)

### 2.4 Déployer
1. Cliquez sur **"Deploy"**
2. Vercel va automatiquement :
   - Cloner votre repo
   - Installer les dépendances
   - Builder le projet Vite
   - Déployer sur le CDN global
3. Votre site sera accessible à : `https://votre-projet.vercel.app`

---

## ✅ Étape 3 : Vérification Post-Déploiement

### 3.1 Tester le Backend
Ouvrez dans votre navigateur :
```
https://meetizy-backend.onrender.com/api/health
```

Vous devriez voir :
```json
{
  "status": "healthy",
  "timestamp": "2026-02-10T..."
}
```

### 3.2 Tester le Frontend
1. Ouvrez votre site Vercel : `https://votre-projet.vercel.app`
2. Vérifiez que :
   - ✅ La page d'accueil se charge
   - ✅ Les images/logos s'affichent
   - ✅ Le bouton "Connexion" fonctionne
   - ✅ L'API backend répond (testez en vous connectant)

### 3.3 Configurer un Domaine Personnalisé (Optionnel)
#### Sur Vercel :
1. Allez dans **"Settings"** → **"Domains"**
2. Ajoutez votre domaine : `meetizy.com`
3. Suivez les instructions DNS

---

## 🔄 Déploiements Automatiques

**Bonne nouvelle !** Les deux plateformes sont connectées à votre GitHub :
- ✅ **Chaque `git push` sur `main`** déclenche un redéploiement automatique
- ✅ Vercel : nouveau build du frontend
- ✅ Render : redémarrage du backend

---

## 🐛 Dépannage

### Le backend ne démarre pas sur Render
- Vérifiez les logs dans l'onglet **"Logs"** de Render
- Assurez-vous que toutes les variables d'environnement sont définies
- Vérifiez que `backend/package.json` contient `"start": "node server.js"`

### Le frontend ne peut pas appeler le backend
- Vérifiez que `VITE_API_URL` est bien configurée sur Vercel
- Testez l'URL du backend directement dans le navigateur
- Vérifiez les CORS dans `backend/server.js` (devrait accepter votre domaine Vercel)

### Erreur CORS
Si vous voyez des erreurs CORS, ajoutez votre domaine Vercel dans la configuration CORS du backend :

```javascript
// backend/server.js
app.use(cors({
  origin: ['https://votre-projet.vercel.app', 'http://localhost:5173'],
  credentials: true
}));
```

Puis faites un `git push` pour redéployer.

---

## 📊 Monitoring & Limites

### Plan Gratuit Vercel
- ✅ 100 GB de bande passante/mois
- ✅ Déploiements illimités
- ✅ SSL automatique
- ✅ CDN global

### Plan Gratuit Render
- ✅ 750 heures/mois (suffisant pour 24/7)
- ⚠️ Service en veille après 15 min d'inactivité
- ✅ 512 MB RAM
- ✅ SSL automatique

---

## 🎉 Félicitations !

Votre application Meetizy est maintenant en ligne et accessible dans le monde entier !

**Prochaines étapes recommandées :**
- 🔐 Configurez un domaine personnalisé
- 📊 Activez les analytics Vercel
- 🔔 Configurez des alertes de monitoring
- 💾 Connectez une vraie base de données (PostgreSQL sur Render)
- 🚀 Passez au plan payant pour production (pas de veille)

---

**Besoin d'aide ?**
- [Documentation Vercel](https://vercel.com/docs)
- [Documentation Render](https://render.com/docs)
