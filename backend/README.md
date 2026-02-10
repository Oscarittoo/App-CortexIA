# Meetizy Backend

Serveur Node.js/Express centralisé pour Meetizy - gestion des utilisateurs, authentification, quotas et proxy OpenAI.

## 🚀 Démarrage rapide

### 1. Installation

```powershell
cd backend
npm install
```

### 2. Configuration

Créer un fichier `.env` à partir du template :

```powershell
cp .env.example .env
```

Puis éditer `.env` avec vos clés :

```env
PORT=3001
OPENAI_API_KEY=sk-votre-cle-openai-ici
JWT_SECRET=votre-secret-jwt-tres-securise-ici
ALLOWED_ORIGINS=http://localhost:5173,chrome-extension://*
```

### 3. Lancer le serveur

**Mode développement** (avec auto-reload) :
```powershell
npm run dev
```

**Mode production** :
```powershell
npm start
```

Le serveur démarre sur `http://localhost:3001`

## 📁 Architecture

```
backend/
├── server.js                # Point d'entrée Express
├── package.json
├── .env                     # Configuration (à créer)
├── middleware/              # Middlewares Express
│   ├── auth.js             # JWT authentication
│   ├── quotaCheck.js       # Gestion quotas par plan
│   └── errorHandler.js     # Gestion erreurs centralisée
├── routes/                  # Routes API
│   ├── auth.js             # /api/auth/* (register, login)
│   ├── ai.js               # /api/ai/* (summary, actions, suggestions)
│   ├── sessions.js         # /api/sessions/* (CRUD + sync)
│   ├── quotas.js           # /api/quotas/* (stats quotas)
│   └── admin.js            # /api/admin/* (stats système)
├── services/                # Logique métier
│   ├── userService.js      # Gestion utilisateurs
│   ├── aiService.js        # Appels OpenAI
│   ├── sessionService.js   # Gestion sessions
│   ├── quotaService.js     # Calculs quotas
│   └── adminService.js     # Stats admin
└── data/                    # Stockage JSON (temporaire)
    ├── users.json          # Base utilisateurs
    └── sessions.json       # Base sessions
```

## 🔑 Endpoints API

### Authentification (`/api/auth`)

- `POST /register` - Créer un compte
- `POST /login` - Se connecter (retourne JWT)
- `GET /me` - Profil utilisateur (nécessite JWT)
- `PUT /update-plan` - Changer d'abonnement
- `POST /refresh` - Renouveler le token JWT

### IA (`/api/ai`) - Nécessite authentification + quotas

- `POST /summary` - Générer synthèse cognitive
- `POST /action-plan` - Extraire plan d'action
- `POST /suggestion` - Suggestion temps réel
- `POST /enrich` - Enrichissement sémantique
- `POST /analyze-batch` - Analyse complète (parallèle)

### Sessions (`/api/sessions`)

- `POST /` - Créer une session
- `GET /` - Lister ses sessions
- `GET /:id` - Détails session
- `PUT /:id` - Modifier session
- `DELETE /:id` - Supprimer session
- `POST /sync` - Synchroniser depuis extension Chrome

### Quotas (`/api/quotas`)

- `GET /` - Voir ses quotas actuels
- `GET /usage-stats` - Statistiques d'utilisation

### Admin (`/api/admin`) - Nécessite rôle admin

- `GET /stats` - Statistiques globales système
- `GET /users` - Liste tous les utilisateurs
- `PUT /users/:id` - Modifier un utilisateur

## 🎯 Plans et Quotas

| Plan       | Réunions IA/mois | Transcription/mois | Prix     |
|------------|------------------|--------------------|----------|
| Free       | 1                | 60 min             | Gratuit  |
| Pro        | 10               | 600 min            | 29,99€   |
| Business   | 20               | Illimité           | 79,99€   |
| Expert     | Illimité         | Illimité           | 129,99€  |
| Enterprise | Illimité         | Illimité           | Sur mesure |

Les quotas sont vérifiés automatiquement par le middleware `checkQuota` avant chaque appel IA.

## 🔐 Sécurité

- **JWT** : Tokens avec expiration 30 jours
- **bcrypt** : Hash mots de passe (12 rounds)
- **helmet** : Headers sécurisés
- **rate-limit** : 100 requêtes / 15 min par IP
- **CORS** : Restreint à localhost:5173 + chrome-extension

## 🧪 Tester l'API

Exemple avec curl (remplacer `YOUR_JWT_TOKEN`) :

```powershell
# Register
curl -X POST http://localhost:3001/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{"email":"test@meetizy.com","password":"SecurePass123","name":"Test User"}'

# Login
curl -X POST http://localhost:3001/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"test@meetizy.com","password":"SecurePass123"}'

# Get summary (avec JWT)
curl -X POST http://localhost:3001/api/ai/summary `
  -H "Authorization: Bearer YOUR_JWT_TOKEN" `
  -H "Content-Type: application/json" `
  -d '{"transcript":"Nous avons discuté du lancement produit..."}'
```

## 🔄 Flux d'utilisation

1. **Inscription** : Extension Chrome → `POST /api/auth/register`
2. **Connexion** : Extension → `POST /api/auth/login` → Reçoit JWT
3. **Stock token** : Extension stocke JWT dans Chrome Storage
4. **Appels IA** : Extension → `POST /api/ai/summary` (avec JWT)
   - Middleware `authenticate` vérifie JWT
   - Middleware `checkQuota` vérifie plan utilisateur
   - Backend appelle OpenAI avec clé centralisée
   - Middleware `incrementQuota` décrémente quota
5. **Sync** : Extension → `POST /api/sessions/sync` synchronise sessions

## 📊 Migration vers PostgreSQL (futur)

Le système utilise actuellement JSON pour le stockage. Pour passer à PostgreSQL :

1. Installer `pg` : `npm install pg`
2. Créer base : `CREATE DATABASE meetizy;`
3. Créer tables (users, sessions, quotas)
4. Modifier services pour utiliser SQL queries
5. Ajouter `DATABASE_URL` dans `.env`

## 🛠️ Développement

```powershell
# Installer dépendances
npm install

# Lancer en mode dev
npm run dev

# Structure du code
# - Toujours utiliser import/export (ESM)
# - Services = logique métier
# - Routes = endpoints HTTP
# - Middleware = logique transversale
```

## 📝 TODO

- [ ] Implémenter PostgreSQL
- [ ] Ajouter tests unitaires (Jest)
- [ ] Ajouter logs (Winston)
- [ ] CI/CD (GitHub Actions)
- [ ] Déploiement (Railway/Heroku)
- [ ] Monitoring (Sentry)
- [ ] Cache Redis pour quotas
- [ ] Webhooks Stripe pour paiements

