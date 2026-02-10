# 🚀 Guide de Démarrage Meetizy

## ⚠️ IMPORTANT : Configuration requise avant démarrage

### 1️⃣ Obtenir votre clé API OpenAI

1. Allez sur https://platform.openai.com/api-keys
2. Connectez-vous ou créez un compte OpenAI
3. Cliquez sur "Create new secret key"
4. Copiez la clé (elle commence par `sk-...`)

### 2️⃣ Configurer le backend

Ouvrez le fichier `backend\.env` et remplacez :

```env
OPENAI_API_KEY=sk-votre-cle-openai-ici
```

Par votre vraie clé OpenAI :

```env
OPENAI_API_KEY=sk-proj-abcd1234...votre_vraie_cle
```

### 3️⃣ Générer un secret JWT

Remplacez aussi le `JWT_SECRET` par une chaîne aléatoire sécurisée :

```powershell
# Générer un secret aléatoire avec PowerShell
-join ((33..126) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

Copiez le résultat dans `.env` :

```env
JWT_SECRET=votre_secret_genere_ici_tres_long_et_aleatoire
```

## 🖥️ Démarrer l'application

### Backend (Terminal 1)

```powershell
cd backend
npm run dev
```

✅ Le serveur devrait afficher :
```
✅ Serveur Meetizy démarré sur le port 3001
🌍 Environnement: development
```

### Frontend (Terminal 2)

```powershell
npm run dev
```

✅ L'app React devrait se lancer sur http://localhost:5173

### Extension Chrome (après configuration backend)

1. Ouvrir Chrome → `chrome://extensions/`
2. Activer "Mode développeur" (coin supérieur droit)
3. Cliquer "Charger l'extension non empaquetée"
4. Sélectionner le dossier `chrome-extension/`

## ✅ Vérifier que tout fonctionne

### Test 1 : Backend

Ouvrez http://localhost:3001/health dans votre navigateur

Résultat attendu :
```json
{
  "status": "ok",
  "timestamp": "2024-01-..."
}
```

### Test 2 : Frontend

Ouvrez http://localhost:5173

Vous devriez voir la page d'accueil Meetizy avec :
- Logo et slogan
- Vidéo démo YouTube
- Boutons d'action

### Test 3 : Extension Chrome

1. Cliquez sur l'icône de l'extension dans Chrome
2. Le popup devrait s'afficher sans erreurs
3. Vous pouvez commencer une session de test

## 🔧 Dépannage

### Erreur "OPENAI_API_KEY missing"

➡️ Vous n'avez pas configuré la clé dans `backend\.env`

### Port 3001 déjà utilisé

➡️ Changez le PORT dans `backend\.env` :
```env
PORT=3002
```

Puis mettez à jour `chrome-extension/config.js` :
```javascript
export const API_URL = 'http://localhost:3002/api';
```

### Extension ne charge pas

➡️ Vérifiez les erreurs dans Chrome DevTools :
- Clic droit sur l'icône extension → "Inspecter le popup"
- Console → Voir les erreurs

## 📚 Prochaines étapes

Une fois tout démarré :

1. ✅ **Tester l'enregistrement** : Créer un compte test
2. ✅ **Tester une session** : Enregistrer une réunion de test
3. ✅ **Tester l'IA** : Vérifier la génération de synthèse
4. 🔜 **Modifier l'extension** : La connecter au backend (au lieu d'OpenAI direct)

## 🆘 Besoin d'aide ?

Consultez :
- [README Backend](backend/README.md) - Documentation complète API
- [README Extension](chrome-extension/README.md) - Guide extension Chrome
- [DOCUMENTATION_TECHNIQUE.md](DOCUMENTATION_TECHNIQUE.md) - Architecture globale

