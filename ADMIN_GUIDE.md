# Guide d'administration - CORTEXIA

## 📊 Accès au Dashboard Admin

Le dashboard admin vous permet de visualiser tous les clients inscrits et leurs abonnements.

### Accès
1. Connectez-vous à l'application CORTEXIA
2. Dans la barre de navigation, cliquez sur **"Admin"**
3. Le dashboard s'affiche avec les statistiques et la liste des clients

### Fonctionnalités

#### 🔢 Statistiques globales
Le dashboard affiche en temps réel :
- **Total clients** : Nombre total de comptes créés
- **Plan Free** : Nombre d'utilisateurs gratuits
- **Plan Pro** : Nombre d'abonnements professionnels
- **Plan Enterprise** : Nombre de clients entreprise

#### 🔍 Recherche de clients
- Barre de recherche pour filtrer par **email** ou **nom d'entreprise**
- Recherche instantanée (live search)
- Case insensitive (majuscules/minuscules)

#### 📋 Liste des clients
Tableau avec les informations suivantes :
- **Email** : Adresse email du client
- **Entreprise** : Nom de l'entreprise (si renseigné)
- **Plan** : Free / Pro / Enterprise (avec badge coloré)
- **Date d'inscription** : Date et heure de création du compte
- **Dernière mise à jour** : Dernière modification du compte
- **ID Stripe** : Identifiant de l'abonnement Stripe (pour les plans payants)

## 💾 Stockage des données

### Base de données clients
Les données sont stockées dans **localStorage** sous la clé `cortexia_clients_db`.

#### Structure d'un client
```json
{
  "id": "1234567890",
  "email": "contact@entreprise.com",
  "companyName": "Ma Société SAS",
  "plan": "pro",
  "createdAt": "2026-02-03T10:30:00.000Z",
  "lastUpdated": "2026-02-03T10:30:00.000Z",
  "trialEndsAt": null,
  "stripeSubscriptionId": "sub_xxxxxxxxxxxxxxxxxx"
}
```

### Méthodes du service Auth

#### `getAllClients()`
Récupère la liste complète des clients inscrits.

```javascript
import authService from './services/authService';

const clients = authService.getAllClients();
console.log(clients);
```

#### `getClientStats()`
Récupère les statistiques agrégées.

```javascript
const stats = authService.getClientStats();
// Retourne :
// {
//   totalClients: 42,
//   planDistribution: {
//     free: 30,
//     pro: 10,
//     enterprise: 2
//   }
// }
```

#### `saveToClientDatabase(user)`
Enregistre ou met à jour un client dans la base de données.

```javascript
const newUser = {
  email: 'nouveau@client.com',
  companyName: 'Nouvelle Société',
  plan: 'free'
};

authService.saveToClientDatabase(newUser);
```

## 🔄 Migration vers une vraie base de données

Actuellement, les données sont stockées dans localStorage. Pour passer en production, voici les étapes :

### 1. Choisir une base de données

#### Option A : PostgreSQL (Recommandé)
- Base de données robuste et éprouvée
- Support JSON natif
- Idéal pour les relations complexes

#### Option B : MongoDB
- Base NoSQL flexible
- Documents JSON natifs
- Scalabilité horizontale

#### Option C : Supabase
- PostgreSQL hébergé
- APIs REST/GraphQL automatiques
- Auth intégrée

### 2. Créer le schéma SQL (PostgreSQL)

```sql
CREATE TABLE clients (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  company_name VARCHAR(255),
  plan VARCHAR(50) NOT NULL DEFAULT 'free',
  created_at TIMESTAMP DEFAULT NOW(),
  last_updated TIMESTAMP DEFAULT NOW(),
  trial_ends_at TIMESTAMP,
  stripe_subscription_id VARCHAR(255),
  stripe_customer_id VARCHAR(255),
  password_hash VARCHAR(255) NOT NULL,
  metadata JSONB
);

CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_plan ON clients(plan);
CREATE INDEX idx_clients_stripe_sub ON clients(stripe_subscription_id);
```

### 3. Créer une API backend

Exemple avec Node.js + Express + PostgreSQL :

```javascript
// server/routes/clients.js
const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// GET /api/clients - Récupérer tous les clients
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM clients ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/clients/stats - Statistiques
router.get('/stats', async (req, res) => {
  try {
    const totalResult = await pool.query('SELECT COUNT(*) FROM clients');
    const plansResult = await pool.query(`
      SELECT plan, COUNT(*) 
      FROM clients 
      GROUP BY plan
    `);
    
    const stats = {
      totalClients: parseInt(totalResult.rows[0].count),
      planDistribution: {}
    };
    
    plansResult.rows.forEach(row => {
      stats.planDistribution[row.plan] = parseInt(row.count);
    });
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/clients - Créer un client
router.post('/', async (req, res) => {
  const { email, companyName, plan, passwordHash } = req.body;
  
  try {
    const result = await pool.query(
      `INSERT INTO clients (email, company_name, plan, password_hash) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [email, companyName, plan, passwordHash]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') { // Duplicate key
      res.status(409).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// PUT /api/clients/:id - Mettre à jour un client
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { plan, stripeSubscriptionId } = req.body;
  
  try {
    const result = await pool.query(
      `UPDATE clients 
       SET plan = $1, stripe_subscription_id = $2, last_updated = NOW() 
       WHERE id = $3 
       RETURNING *`,
      [plan, stripeSubscriptionId, id]
    );
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Client not found' });
    } else {
      res.json(result.rows[0]);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

### 4. Modifier le service authService.js

```javascript
// services/authService.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class AuthService {
  async getAllClients() {
    const response = await fetch(`${API_URL}/api/clients`);
    if (!response.ok) throw new Error('Failed to fetch clients');
    return await response.json();
  }

  async getClientStats() {
    const response = await fetch(`${API_URL}/api/clients/stats`);
    if (!response.ok) throw new Error('Failed to fetch stats');
    return await response.json();
  }

  async saveToClientDatabase(user) {
    const response = await fetch(`${API_URL}/api/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });
    
    if (!response.ok) throw new Error('Failed to save client');
    return await response.json();
  }
}
```

### 5. Exporter les données localStorage vers BDD

Script de migration :

```javascript
// migrate.js
const clients = JSON.parse(localStorage.getItem('cortexia_clients_db') || '[]');

async function migrate() {
  for (const client of clients) {
    try {
      const response = await fetch('http://localhost:3001/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(client)
      });
      
      if (response.ok) {
        console.log(`✅ Migrated: ${client.email}`);
      } else {
        console.error(`❌ Failed: ${client.email}`);
      }
    } catch (error) {
      console.error(`❌ Error: ${client.email}`, error);
    }
  }
}

migrate();
```

## 🔒 Sécurité

### Authentification admin
Pour sécuriser l'accès au dashboard admin en production :

1. **Créer un rôle admin** dans la table clients :
```sql
ALTER TABLE clients ADD COLUMN role VARCHAR(50) DEFAULT 'user';
UPDATE clients SET role = 'admin' WHERE email = 'admin@cortexia.com';
```

2. **Vérifier le rôle** dans le composant :
```javascript
// AdminDashboard.jsx
useEffect(() => {
  const user = authService.getCurrentUser();
  if (!user || user.role !== 'admin') {
    toast.error('Accès refusé : admin requis');
    navigate('/');
  }
}, []);
```

3. **Sécuriser l'API** :
```javascript
// middleware/requireAdmin.js
function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin required' });
  }
  next();
}

// routes
router.get('/api/clients', requireAdmin, getClients);
```

## 📈 Analytics avancés

### Ajouter des métriques utiles

```javascript
// Nouveaux endpoints analytics
GET /api/admin/analytics/revenue - Revenu mensuel
GET /api/admin/analytics/churn - Taux de désabonnement
GET /api/admin/analytics/cohorts - Analyse par cohorte
GET /api/admin/analytics/growth - Croissance MRR
```

### Graphiques recommandés
- Évolution du nombre de clients (ligne)
- Distribution des plans (camembert)
- Revenu mensuel récurrent (barres)
- Taux de conversion (funnel)

## 🚀 Déploiement

### Checklist de production
- [ ] Migrer localStorage vers PostgreSQL
- [ ] Créer API backend sécurisée
- [ ] Implémenter authentification JWT
- [ ] Ajouter rôle admin en BDD
- [ ] Sécuriser routes admin
- [ ] Ajouter logs d'audit
- [ ] Configurer backup automatique
- [ ] Tester migrations de données
- [ ] Documenter procédures admin

## 📞 Support

Pour toute question sur l'administration :
- Documentation technique : [DOCUMENTATION_TECHNIQUE.md](./DOCUMENTATION_TECHNIQUE.md)
- Configuration Stripe : [STRIPE_CONFIGURATION.md](./STRIPE_CONFIGURATION.md)
- Architecture générale : [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)
