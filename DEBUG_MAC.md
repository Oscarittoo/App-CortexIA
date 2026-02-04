# 🐛 Debug - Page blanche sur Mac

## 1️⃣ Vérifier les erreurs dans la console du navigateur

1. Ouvrir `http://localhost:5173/` dans le navigateur
2. Appuyer sur **Cmd + Option + I** (ou clic droit → Inspecter)
3. Aller dans l'onglet **Console**
4. Copier toutes les erreurs en rouge et me les envoyer

---

## 2️⃣ Nettoyer et réinstaller (Solution la plus courante)

```bash
# Arrêter le serveur (Ctrl+C)

# Supprimer les dépendances et le cache
rm -rf node_modules
rm -rf .vite
rm package-lock.json

# Réinstaller proprement
npm install

# Relancer
npm run dev
```

---

## 3️⃣ Vérifier que le fichier .env est bien créé

```bash
# Dans le terminal, à la racine du projet
ls -la .env
cat .env
```

Le fichier `.env` doit contenir :
```
VITE_OPENAI_API_KEY=sk-proj-...
VITE_SUPABASE_URL=https://rgjjzsteaghpgsotkjhy.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
```

---

## 4️⃣ Vérifier les versions Node.js

```bash
node --version   # Doit être >= 16.x
npm --version    # Doit être >= 8.x
```

Si Node est trop ancien :
```bash
# Installer nvm (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Installer Node 18
nvm install 18
nvm use 18
```

---

## 5️⃣ Tester avec un autre navigateur

- Essayer **Chrome** si vous êtes sur Safari
- Essayer le mode navigation privée (Cmd + Shift + N)

---

## 6️⃣ Vérifier les permissions Mac

```bash
# Donner les permissions d'exécution
chmod -R 755 node_modules
```

---

## 🆘 Si rien ne fonctionne

Envoie-moi :
1. ✅ La **sortie complète** du terminal quand tu fais `npm run dev`
2. ✅ Les **erreurs dans la console** du navigateur (Cmd + Option + I)
3. ✅ Le résultat de `node --version` et `npm --version`
