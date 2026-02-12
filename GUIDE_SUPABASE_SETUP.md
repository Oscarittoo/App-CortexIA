# 🚀 Guide de Configuration Supabase - Partage d'Équipe

Ce guide explique comment configurer Supabase pour activer le partage de données entre membres d'équipe.

---

## 📋 Prérequis

Votre projet Supabase existe déjà avec :
- URL: `https://rgjjzsteaghpgsotkjhy.supabase.co`
- Anon Key: Déjà configurée dans `.env`
- Table `clients` existante

---

## 🔧 Étape 1 : Créer le Schéma des Équipes

### A. Accéder au SQL Editor

1. Allez sur **https://supabase.com/dashboard**
2. Sélectionnez votre projet **rgjjzsteaghpgsotkjhy**
3. Dans le menu de gauche, cliquez sur l'icône **SQL Editor** (⚡)
4. Cliquez sur **New Query**

### B. Exécuter le Script

1. **Copiez TOUT le contenu** du fichier [`supabase/team_sharing_schema.sql`](supabase/team_sharing_schema.sql)
2. **Collez-le** dans l'éditeur SQL
3. Cliquez sur le bouton **RUN** en bas à droite
4. Attendez le message de succès ✅

**Ce que ce script fait :**
- ✅ Crée 5 tables: `teams`, `team_members`, `shared_sessions`, `shared_meetings`, `shared_actions`
- ✅ Configure les politiques RLS (Row Level Security) pour la sécurité
- ✅ Crée les indexes pour la performance
- ✅ Configure les relations entre tables (foreign keys)

---

## 🔍 Étape 2 : Vérifier que Tout est Créé

### Dans le SQL Editor, exécutez cette requête de vérification :

```sql
-- Vérifier que toutes les tables existent
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('teams', 'team_members', 'shared_sessions', 'shared_meetings', 'shared_actions')
ORDER BY table_name;
```

**Résultat attendu :** Vous devez voir 5 lignes (les 5 tables)

---

## 📊 Étape 3 : Vérifier les Politiques RLS

### Exécutez cette requête :

```sql
-- Vérifier que RLS est activé
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('teams', 'team_members', 'shared_sessions', 'shared_meetings', 'shared_actions')
  AND schemaname = 'public';
```

**Résultat attendu :** Toutes les tables doivent avoir `rowsecurity = true`

---

## 🎯 Étape 4 : Tester dans l'Application

### A. Se Connecter

1. Lancez l'application : `npm run dev`
2. Connectez-vous avec votre compte

### B. Créer une Équipe

1. Allez dans **Équipes** (menu de gauche)
2. Une équipe sera automatiquement créée lors de la première invitation
3. Invitez un membre par son email

### C. Vérifier dans Supabase

Retournez dans Supabase → **Table Editor** (menu gauche) → Sélectionnez `teams`

Vous devriez voir votre équipe créée avec :
- `id` : UUID généré
- `name` : Nom de l'équipe
- `owner_id` : Votre ID utilisateur
- `created_at` / `updated_at` : Dates

---

## 📁 Structure des Tables

### 1. **teams** (Équipes)
```
id              → UUID (clé primaire)
name            → Nom de l'équipe
owner_id        → ID du propriétaire
created_at      → Date de création
updated_at      → Date de mise à jour
```

### 2. **team_members** (Membres)
```
id              → UUID (clé primaire)
team_id         → Référence vers teams
user_id         → Référence vers clients
role            → 'owner' | 'admin' | 'member'
invited_at      → Date d'invitation
joined_at       → Date d'acceptation
```

### 3. **shared_sessions** (Sessions partagées)
```
id              → Text (ID de session)
team_id         → Référence vers teams
created_by      → Référence vers clients (créateur)
title           → Titre de la session
transcript      → JSONB (transcription)
summary         → Text (résumé)
actions         → JSONB (actions)
decisions       → JSONB (décisions)
...
```

### 4. **shared_meetings** (Réunions partagées)
```
id              → UUID
team_id         → Référence vers teams
created_by      → Référence vers clients
title           → Titre réunion
date            → Date
time            → Heure
duration        → Durée (minutes)
...
```

### 5. **shared_actions** (Actions partagées)
```
id              → UUID
team_id         → Référence vers teams
session_id      → Référence vers shared_sessions (optionnel)
created_by      → Référence vers clients
task            → Description de l'action
responsible     → Responsable
deadline        → Échéance
priority        → Priorité
completed       → Booléen
...
```

---

## 🔐 Politiques de Sécurité RLS

### Qui peut voir quoi ?

**Teams:**
- ✅ Le propriétaire peut tout faire
- ✅ Les membres peuvent seulement VOIR leur équipe

**Team Members:**
- ✅ Les membres voient les autres membres de leur équipe
- ✅ Les admins/propriétaires peuvent inviter/retirer

**Shared Sessions/Meetings/Actions:**
- ✅ Tous les membres de l'équipe peuvent LIRE
- ✅ Tous les membres peuvent CRÉER
- ✅ Le créateur peut MODIFIER/SUPPRIMER ses propres données

---

## 🐛 Dépannage

### Erreur : "ReferenceError: supabase is not defined"

**Solution :** Le fichier `teamService.js` importe mal supabase.

Modifiez la ligne 1 :
```javascript
// ❌ FAUX
import supabase from './supabaseClient';

// ✅ CORRECT
import { supabase } from './supabaseClient';
```

Vérifiez que `supabaseClient.js` exporte correctement :
```javascript
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

---

### Erreur : "relation 'teams' does not exist"

**Cause :** Le script SQL n'a pas été exécuté

**Solution :**
1. Retournez dans Supabase SQL Editor
2. Réexécutez le script `team_sharing_schema.sql`
3. Vérifiez les erreurs éventuelles dans la console

---

### Erreur : "policy violation"

**Cause :** Les politiques RLS bloquent l'accès

**Solution :**
1. Vérifiez que vous êtes bien connecté
2. Exécutez cette requête SQL pour vérifier les policies :
```sql
SELECT * FROM pg_policies 
WHERE tablename IN ('teams', 'team_members', 'shared_sessions');
```

---

## 🎓 Fonctionnement du Partage

### Création d'une Équipe

```
1. Utilisateur A crée équipe → Table teams
2. A est ajouté automatiquement → Table team_members (role: owner)
```

### Invitation d'un Membre

```
1. A invite B par email
2. Si B existe dans clients → Ajout direct dans team_members
3. Si B n'existe pas → Email d'invitation envoyé
4. B crée son compte → Automatiquement ajouté à l'équipe
```

### Partage des Données

```
Quand un membre crée une session/réunion/action :
1. L'app vérifie si l'utilisateur est dans une équipe (teamService.isInTeam())
2. Si OUI → Sauvegarde dans shared_* (Supabase)
3. Si NON → Sauvegarde dans localStorage (mode solo)

Tous les membres de l'équipe voient automatiquement les données grâce aux RLS policies.
```

---

## 📱 Utilisation dans l'App

### Sessions (Historique)
- Mode Solo : localStorage uniquement
- Mode Équipe : Supabase + localStorage (fusion)
- Affiche les sessions de tous les membres

### Calendrier (Réunions)
- Mode Solo : localStorage
- Mode Équipe : Supabase (temps réel)
- Synchronisé entre tous les membres

### Actions
- Mode Solo : localStorage
- Mode Équipe : Supabase
- Toute l'équipe peut marquer comme complétée

---

## ✅ Checklist de Vérification Finale

- [ ] Script SQL exécuté sans erreur
- [ ] 5 tables créées dans Supabase
- [ ] RLS activé sur toutes les tables
- [ ] Connexion à l'app réussie
- [ ] Création d'équipe fonctionne
- [ ] Invitation de membre fonctionne
- [ ] Session créée apparaît dans shared_sessions
- [ ] Réunion créée apparaît dans shared_meetings
- [ ] Calendrier synchronisé entre membres

---

## 🆘 Support

Si problème persistant :

1. **Vérifiez les logs de la console navigateur** (F12)
2. **Vérifiez les logs Supabase** : Dashboard → Logs
3. **Testez avec ce SQL** :
```sql
-- Voir toutes vos équipes
SELECT * FROM teams WHERE owner_id = auth.uid();

-- Voir vos membres
SELECT * FROM team_members WHERE user_id = auth.uid();
```

---

## 🎉 C'est Prêt !

Une fois configuré, les membres d'une même équipe peuvent :
- ✅ Voir toutes les sessions de l'équipe
- ✅ Partager le calendrier en temps réel
- ✅ Gérer les actions collaborativement
- ✅ Voir l'historique complet

Tout est synchronisé automatiquement via Supabase ! 🚀
