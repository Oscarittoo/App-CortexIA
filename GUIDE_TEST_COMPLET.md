# 🎯 Guide de Test - Flux Complet Meetizy

Ce guide vous permet de tester l'intégration complète entre l'extension Chrome et le backend Meetizy.

## ✅ Prérequis

Avant de commencer :

1. ✅ Backend démarré sur `http://localhost:3001`
2. ✅ Frontend démarré sur `http://localhost:5173`
3. ✅ Extension Chrome installée en mode développeur
4. ✅ Clé OpenAI configurée dans `backend/.env`

## 📋 Checklist de tests

### 🔐 Test 1 : Authentification

#### 1.1 Inscription
1. Cliquer sur l'icône de l'extension Chrome
2. Onglet **"Inscription"**
3. Remplir :
   - Nom : Test User
   - Email : test@meetizy.com
   - Mot de passe : Test123456
4. Cliquer **"Créer mon compte"**

✅ **Résultat attendu :**
- Message "Compte créé avec succès !"
- Redirection automatique vers le popup principal
- Affichage du nom et plan (FREE) dans le popup

#### 1.2 Déconnexion
1. Dans le popup, cliquer **"Déconnexion"**

✅ **Résultat attendu :**
- Redirection vers page de login

#### 1.3 Connexion
1. Onglet **"Connexion"**
2. Email : test@meetizy.com
3. Mot de passe : Test123456
4. Cliquer **"Se connecter"**

✅ **Résultat attendu :**
- Message "Connexion réussie !"
- Retour au popup principal
- Infos utilisateur affichées

### 📊 Test 2 : Affichage des quotas

1. Dans le popup, vérifier la section des quotas

✅ **Résultat attendu :**
```
Réunions IA: 0 / 1
[Barre de progression vide en bleu]

Transcription: 0 / 60 min
```

### 🎤 Test 3 : Transcription basique

1. Ouvrir Google Meet (ou créer une réunion test) : `https://meet.google.com/new`
2. Autoriser le micro si demandé
3. Cliquer sur l'icône Meetizy
4. Vérifier que "Plateforme détectée" = **Google Meet**
5. Cliquer **"Démarrer la transcription"**

✅ **Résultat attendu :**
- Bouton change en "Arrêter la transcription" (rouge)
- Widget apparaît en bas à droite de la page Meet
- La transcription commence à afficher le texte en temps réel

6. Parler quelques phrases dans le micro
7. Vérifier que la transcription s'affiche

✅ **Résultat attendu :**
- Les paroles apparaissent dans le widget
- Mise à jour en temps réel

### 🤖 Test 4 : Analyse IA (Synthèse)

#### 4.1 Créer une transcription de test

1. Dans le backend, créer un fichier de test `backend/test-ai.js` :

```javascript
import fetch from 'node-fetch';

// Remplacer par votre vrai token JWT
const TOKEN = 'VOTRE_TOKEN_ICI';

async function testSummary() {
  const transcript = `
Bonjour à tous. Aujourd'hui nous allons discuter du lancement du nouveau produit Meetizy.
Alice, peux-tu nous faire un point sur l'avancement du développement ?
Oui bien sûr. Le backend est terminé à 90%. Il reste quelques tests à faire. Je pense qu'on peut livrer d'ici vendredi.
Parfait. Bob, et toi sur le frontend ?
Le frontend est prêt. J'ai intégré toutes les fonctionnalités demandées. Par contre, j'aurais besoin d'aide pour les tests utilisateurs.
D'accord. Alice, tu peux aider Bob sur les tests cette semaine ?
Oui pas de problème.
Super. Donc on vise une mise en production lundi prochain. Tout le monde est d'accord ?
Oui, validé.
Parfait, merci à tous. On se retrouve demain pour un point rapide.
  `;

  try {
    const response = await fetch('http://localhost:3001/api/ai/summary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      },
      body: JSON.stringify({ transcript })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Synthèse générée avec succès!\n');
      console.log(data.summary);
      console.log('\n📊 Usage:', data.usage);
    } else {
      console.error('❌ Erreur:', data);
    }
  } catch (error) {
    console.error('❌ Erreur réseau:', error);
  }
}

testSummary();
```

2. Récupérer votre token JWT :
   - Ouvrir l'extension Chrome
   - F12 → Console
   - Taper : `chrome.storage.local.get(['meetizy_token'], (result) => console.log(result.meetizy_token))`
   - Copier le token affiché

3. Remplacer `VOTRE_TOKEN_ICI` dans test-ai.js

4. Exécuter le test :
```powershell
cd backend
node test-ai.js
```

✅ **Résultat attendu :**
```
✅ Synthèse générée avec succès!

## Points clés
- Lancement du nouveau produit Meetizy en discussion
- Backend à 90% d'avancement, livraison prévue vendredi
- Frontend prêt, tests utilisateurs nécessaires

## Décisions prises
- Mise en production fixée à lundi prochain
- Alice aidera Bob sur les tests cette semaine

## Actions à faire
- **Alice** : Finaliser les tests du backend (deadline: vendredi)
- **Alice** : Aider Bob sur les tests utilisateurs
- **Bob** : Réaliser les tests utilisateurs avec l'aide d'Alice

## Sujets en suspens
- Point rapide prévu demain pour suivi

📊 Usage: { prompt_tokens: 234, completion_tokens: 187, total_tokens: 421 }
```

### 📈 Test 5 : Vérification des quotas

1. Après l'appel IA, rouvrir le popup de l'extension
2. Vérifier les quotas

✅ **Résultat attendu :**
```
Réunions IA: 1 / 1
[Barre de progression pleine en rouge - quota atteint]

Transcription: 0 / 60 min
```

### 🚫 Test 6 : Quota dépassé

1. Essayer de refaire un appel IA (réexécuter `node test-ai.js`)

✅ **Résultat attendu :**
```json
{
  "success": false,
  "message": "Quota de réunions IA atteint (1/1)",
  "code": "QUOTA_EXCEEDED",
  "details": {
    "used": 1,
    "limit": 1,
    "resetDate": "2026-03-01T00:00:00.000Z"
  },
  "upgrade": {
    "recommendedPlan": "pro",
    "benefits": "10 réunions IA/mois au lieu de 1"
  }
}
```

### 🔄 Test 7 : Mise à niveau du plan

1. Dans le backend, créer `backend/test-upgrade.js` :

```javascript
import fetch from 'node-fetch';

const TOKEN = 'VOTRE_TOKEN_ICI';

async function upgradeToPro() {
  try {
    const response = await fetch('http://localhost:3001/api/auth/update-plan', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      },
      body: JSON.stringify({ plan: 'pro' })
    });

    const data = await response.json();
    console.log('✅ Plan mis à jour:', data);
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

upgradeToPro();
```

2. Exécuter : `node test-upgrade.js`

3. Recharger le popup de l'extension

✅ **Résultat attendu :**
```
Plan: PRO

Réunions IA: 0 / 10
[Barre bleue presque vide]
```

4. Réessayer l'appel IA → Devrait fonctionner maintenant !

### 🔍 Test 8 : Analyse complète (batch)

Créer `backend/test-batch.js` :

```javascript
import fetch from 'node-fetch';

const TOKEN = 'VOTRE_TOKEN_ICI';

async function testBatchAnalysis() {
  const transcript = `Réunion de lancement du projet CortexA.
Objectif : Définir les fonctionnalités principales et le planning.
Participants : Marie (PM), Paul (Dev), Sophie (Design).
Marie : On vise un MVP pour fin mars. Quelles sont les features prioritaires ?
Paul : Je propose de commencer par l'authentification et le dashboard.
Sophie : D'accord. Je vais préparer les maquettes cette semaine.
Marie : Parfait. Paul, tu peux estimer le temps de développement ?
Paul : Je dirais 3 semaines pour le MVP.
Marie : OK, on valide. Next meeting vendredi pour revue des maquettes.`;

  try {
    const response = await fetch('http://localhost:3001/api/ai/analyze-batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      },
      body: JSON.stringify({ transcript })
    });

    const data = await response.json();
    
    console.log('✅ Analyse complète terminée!\n');
    console.log('## 📝 SYNTHÈSE');
    console.log(data.summary);
    console.log('\n## ✅ PLAN D\'ACTION');
    console.log(JSON.stringify(data.actions, null, 2));
    console.log('\n## 🔍 ENRICHISSEMENT');
    console.log(JSON.stringify(data.enrichment, null, 2));
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

testBatchAnalysis();
```

✅ **Résultat attendu :**
- Synthèse structurée
- Liste d'actions JSON avec assignés
- Enrichissement (sujets, sentiment, mots-clés)

### 📱 Test 9 : Dashboard web

1. Ouvrir `http://localhost:5173`
2. Se connecter avec test@meetizy.com
3. Aller dans "Historique"

✅ **Résultat attendu :**
- Liste des sessions créées
- Possibilité de voir les détails

### 🎉 Test final : Flux complet

**Scénario :** Utilisateur inscrit, rejoint une réunion, l'enregistre, obtient l'analyse IA

1. Créer un nouveau compte : user2@meetizy.com
2. Ouvrir Google Meet
3. Démarrer la transcription
4. Parler 2-3 minutes
5. Arrêter la transcription
6. Dans le dashboard web, voir la session
7. Cliquer sur "Générer synthèse IA"
8. Vérifier que la synthèse s'affiche
9. Vérifier que le quota a été décrémenté

## 🐛 Erreurs courantes

| Erreur | Solution |
|--------|----------|
| "Non authentifié" | Se reconnecter dans l'extension |
| "Backend non accessible" | Vérifier que le backend tourne sur :3001 |
| "OPENAI_API_KEY missing" | Configurer la clé dans backend/.env |
| "Quota exceeded" | Upgrader le plan ou attendre reset mensuel |
| Widget ne s'affiche pas | Recharger l'extension dans chrome://extensions |

## ✅ Checklist finale

- [ ] Inscription OK
- [ ] Connexion OK
- [ ] Affichage quotas OK
- [ ] Transcription temps réel OK
- [ ] Synthèse IA OK
- [ ] Plan d'action OK
- [ ] Quota décrémenté OK
- [ ] Quota dépassé bloque OK
- [ ] Upgrade plan OK
- [ ] Dashboard web synchronisé OK

---

**Tous les tests passent ?** 🎉 Votre installation Meetizy est opérationnelle !
