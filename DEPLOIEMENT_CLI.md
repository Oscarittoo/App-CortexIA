# 🚀 Déploiement depuis VS Code (CLI)

Déployez votre application **directement depuis le terminal** sans quitter VS Code !

---

## 📦 Étape 1 : Installation des CLI

### Installer Vercel CLI

```powershell
npm install -g vercel
```

### Installer Render CLI (optionnel)

```powershell
npm install -g render
```

> **Note** : Render se déploie mieux via GitHub (automatique), mais Vercel CLI est très pratique !

---

## 🌐 Étape 2 : Déployer le Frontend sur Vercel

### 2.1 Connexion à Vercel

```powershell
vercel login
```

Cela ouvrira votre navigateur pour vous connecter avec GitHub.

### 2.2 Configuration du projet

```powershell
# À la racine du projet
vercel
```

Le CLI va vous poser des questions :
- **Set up and deploy ?** → `Y`
- **Which scope ?** → Sélectionnez votre compte
- **Link to existing project ?** → `N` (première fois)
- **Project name ?** → `meetizy` (ou votre choix)
- **In which directory is your code ?** → `./` (racine)
- **Want to modify settings ?** → `N`

### 2.3 Ajouter les variables d'environnement

```powershell
# Ajoutez l'URL de votre backend (vous l'aurez après le déploiement Render)
vercel env add VITE_API_URL
```

Quand demandé :
- **What's the value ?** → `https://votre-backend.onrender.com`
- **Add to which environments ?** → **Production, Preview, Development** (toutes)

### 2.4 Déployer en production

```powershell
vercel --prod
```

✅ **Votre frontend est en ligne !** L'URL s'affichera dans le terminal.

---

## 🔧 Étape 3 : Déployer le Backend sur Render

### Option A : Via GitHub (Recommandée - Automatique)

1. **Pushez votre code** :
```powershell
git add .
git commit -m "Production ready"
git push
```

2. **Allez sur [render.com](https://render.com)** (une seule fois)
3. **New +** → **Web Service** → Connectez votre repo
4. Configuration :
   - Root : `backend`
   - Build : `npm install`
   - Start : `npm start`
5. **Environment Variables** :
   ```
   NODE_ENV=production
   OPENAI_API_KEY=sk-...
   JWT_SECRET=<votre_secret>
   ALLOWED_ORIGINS=https://votre-projet.vercel.app
   ```

✅ **C'est tout !** À chaque `git push`, Render redéploie automatiquement.

### Option B : Via Render CLI (Avancé)

```powershell
# Installer et se connecter
npm install -g render
render login

# Créer un nouveau service
render create web --name meetizy-backend --region frankfurt --plan free --root backend

# Configurer les variables
render env set NODE_ENV=production
render env set OPENAI_API_KEY=sk-...

# Déployer
render deploy
```

---

## ⚡ Étape 4 : Connecter Frontend ↔ Backend

Une fois le backend déployé sur Render, **mettez à jour l'URL** dans Vercel :

```powershell
# Mettre à jour la variable d'environnement
vercel env rm VITE_API_URL production
vercel env add VITE_API_URL
# Entrez : https://meetizy-backend.onrender.com

# Redéployer le frontend avec la nouvelle URL
vercel --prod
```

---

## 🔄 Déploiements Futurs (Ultra-Rapide)

### Pour le Frontend :

```powershell
# À chaque modification du frontend
git add .
git commit -m "Update frontend"
git push

# OU directement avec Vercel CLI
vercel --prod
```

### Pour le Backend :

```powershell
# À chaque modification du backend
git add .
git commit -m "Update backend"
git push

# Render redéploie automatiquement !
```

---

## 📊 Commandes Utiles

### Vercel

```powershell
# Voir les logs
vercel logs

# Ouvrir le dashboard
vercel inspect

# Lister les déploiements
vercel ls

# Promouvoir un déploiement en production
vercel promote <url>

# Voir les variables d'environnement
vercel env ls
```

### Render (via dashboard)

Allez sur [dashboard.render.com](https://dashboard.render.com) pour :
- 📊 Voir les logs en temps réel
- 🔄 Redéployer manuellement
- ⚙️ Modifier les variables d'environnement

---

## ✅ Vérification Rapide

### Tester le backend :

```powershell
curl https://votre-backend.onrender.com/api/health
```

### Tester le frontend :

```powershell
# Ouvrir dans le navigateur
start https://votre-projet.vercel.app
```

---

## 🎉 Résumé des Commandes

```powershell
# Installation (une seule fois)
npm install -g vercel

# Déploiement initial
vercel login
vercel
vercel env add VITE_API_URL
vercel --prod

# Redéploiements futurs
git add .
git commit -m "Update"
git push
vercel --prod
```

---

## 💡 Astuce Pro

Créez des **alias dans PowerShell** pour aller plus vite :

```powershell
# Ajoutez dans votre profil PowerShell
function Deploy-Frontend { vercel --prod }
function Deploy-All { 
    git add .
    git commit -m "Deploy $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
    git push
    vercel --prod
}

# Utilisation
Deploy-Frontend
Deploy-All
```

---

**Besoin d'aide ?**
- [Vercel CLI Docs](https://vercel.com/docs/cli)
- [Render Docs](https://render.com/docs)
