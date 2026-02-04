# Instructions d'installation pour les collaborateurs

## 1. Installation des dépendances
```bash
npm install
```

## 2. Configuration des variables d'environnement
1. Copier le fichier `.env.example` en `.env`
2. Remplir les variables avec vos clés API :
   - `VITE_OPENAI_API_KEY` : Clé API OpenAI (pour Whisper + GPT-4)
   - `VITE_SUPABASE_URL` : URL de votre projet Supabase
   - `VITE_SUPABASE_ANON_KEY` : Clé anonyme Supabase

## 3. Lancer l'application
```bash
npm run dev
```

## 4. Ouvrir dans le navigateur
Aller sur `http://localhost:5173/`

## 5. Créer un compte
1. Cliquer sur "Créer un compte"
2. Utiliser l'email : **oscarbrixon@gmail.com** (compte admin)
3. Se connecter

---

## Problèmes courants

### Le serveur ne démarre pas
- Vérifier que Node.js est installé : `node --version`
- Supprimer `node_modules` et réinstaller : `rm -rf node_modules && npm install`

### Écran noir après lancement
- Ouvrir manuellement `http://localhost:5173/` dans le navigateur
- Vérifier que le serveur est bien lancé dans le terminal

### Erreurs d'authentification
- Vérifier que les clés Supabase sont correctes dans `.env`
- Utiliser l'email admin : oscarbrixon@gmail.com
