# 🚀 Déploiement Rapide Meetizy

**Frontend :** Vercel → **Backend :** Render

---

## ⚡ En 5 Minutes

### 1️⃣ Backend (Render)
1. Créez un compte sur [render.com](https://render.com)
2. **New +** → **Web Service** → Connectez `App-CortexIA`
3. Config :
   - Root : `backend`
   - Build : `npm install`
   - Start : `npm start`
4. Variables d'environnement :
   ```
   NODE_ENV=production
   OPENAI_API_KEY=sk-...
   JWT_SECRET=<générez un secret sécurisé>
   ALLOWED_ORIGINS=https://votre-projet.vercel.app
   ```
5. **Déployer** → Notez l'URL : `https://meetizy-backend.onrender.com`

### 2️⃣ Frontend (Vercel)
1. Créez un compte sur [vercel.com](https://vercel.com)
2. **Add New** → **Project** → Importez `App-CortexIA`
3. Variable d'environnement :
   ```
   VITE_API_URL=https://meetizy-backend.onrender.com
   ```
4. **Deploy** → Votre site est en ligne ! 🎉

---

## 📖 Guide Complet

Consultez [GUIDE_DEPLOIEMENT.md](./GUIDE_DEPLOIEMENT.md) pour les instructions détaillées, le dépannage et la configuration.

---

## ✅ Post-Déploiement

- ✅ Testez : `https://votre-backend.onrender.com/api/health`
- ✅ Ouvrez votre site Vercel et connectez-vous
- ✅ Configurez un domaine personnalisé (optionnel)

**Les déploiements sont automatiques à chaque `git push` !** 🚀
