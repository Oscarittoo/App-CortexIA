# Configuration Stripe pour MEETIZY

## Prérequis
- Un compte Stripe (https://stripe.com)
- Node.js installé
- Un backend pour gérer les webhooks Stripe

## Étapes de configuration

### 1. Créer un compte Stripe

1. Allez sur https://stripe.com et créez un compte
2. Vérifiez votre email et complétez votre profil entreprise
3. Activez les paiements (remplir les informations bancaires)

### 2. Récupérer les clés API

1. Allez dans **Dashboard > Developers > API keys**
2. Copiez vos clés :
   - **Clé publique (Publishable key)** : `pk_test_...` (test) ou `pk_live_...` (production)
   - **Clé secrète (Secret key)** : `sk_test_...` (test) ou `sk_live_...` (production)

⚠️ **IMPORTANT** : Ne jamais exposer la clé secrète dans le code frontend !

### 3. Créer les produits et prix

1. Allez dans **Dashboard > Products > Add product**
2. Créez les produits suivants :

#### Plan Professionnel
- **Nom** : MEETIZY Pro
- **Description** : Pour les professionnels et équipes
- **Prix** : 29€/mois (ou 290€/an avec 17% de réduction)
- **Facturation** : Récurrente, mensuelle ou annuelle

#### Plan Entreprise
- **Nom** : MEETIZY Enterprise
- **Description** : Pour les grandes organisations
- **Prix** : Sur mesure (créer un prix personnalisé après contact)

3. Copiez les **Price IDs** (format : `price_xxxxxxxxxxxxx`)

### 4. Configurer les variables d'environnement

Créez un fichier `.env.local` à la racine du projet :

```env
# Stripe - Clés publiques (frontend)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Stripe - Clés secrètes (backend uniquement)
STRIPE_SECRET_KEY=sk_test_REDACTED

# Stripe - Price IDs
STRIPE_PRICE_PRO_MONTHLY=price_xxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_PRICE_PRO_YEARLY=price_xxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_PRICE_ENTERPRISE=price_xxxxxxxxxxxxxxxxxxxxxxxx

# URLs de redirection
STRIPE_SUCCESS_URL=https://votre-domaine.com/success
STRIPE_CANCEL_URL=https://votre-domaine.com/pricing
```

### 5. Créer un backend pour Stripe

Vous devez créer un serveur backend (Node.js + Express recommandé) pour :
- Créer des sessions de paiement
- Gérer les webhooks Stripe
- Mettre à jour les abonnements

Exemple minimal de backend (Node.js + Express) :

```javascript
// server.js
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Créer une session de checkout
app.post('/api/stripe/create-checkout-session', async (req, res) => {
  try {
    const { planId, customerEmail } = req.body;
    
    // Déterminer le price ID en fonction du plan
    let priceId;
    if (planId === 'pro') {
      priceId = process.env.STRIPE_PRICE_PRO_MONTHLY;
    } else if (planId === 'enterprise') {
      priceId = process.env.STRIPE_PRICE_ENTERPRISE;
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.STRIPE_SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: process.env.STRIPE_CANCEL_URL,
      customer_email: customerEmail,
      metadata: {
        planId,
      },
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Webhook pour les événements Stripe
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);

    switch (event.type) {
      case 'checkout.session.completed':
        // Abonnement créé avec succès
        const session = event.data.object;
        // TODO: Mettre à jour la base de données utilisateur
        console.log('Abonnement créé:', session.customer_email);
        break;

      case 'customer.subscription.deleted':
        // Abonnement annulé
        const subscription = event.data.object;
        // TODO: Mettre à jour la base de données utilisateur
        console.log('Abonnement annulé:', subscription.customer);
        break;

      default:
        console.log(`Événement non géré: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

// Créer un portail client
app.post('/api/stripe/create-portal-session', async (req, res) => {
  try {
    const { customerId } = req.body;

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: process.env.STRIPE_SUCCESS_URL,
    });

    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
```

### 6. Configurer les webhooks

1. Allez dans **Dashboard > Developers > Webhooks**
2. Cliquez sur **Add endpoint**
3. URL de l'endpoint : `https://votre-domaine.com/api/stripe/webhook`
4. Sélectionnez les événements à écouter :
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
5. Copiez le **Signing secret** (commence par `whsec_...`)
6. Ajoutez-le dans votre `.env` : `STRIPE_WEBHOOK_SECRET=whsec_...`

### 7. Tester les paiements

1. Utilisez les cartes de test Stripe :
   - **Succès** : `4242 4242 4242 4242`
   - **Échec** : `4000 0000 0000 0002`
   - Date d'expiration : n'importe quelle date future
   - CVC : n'importe quel code à 3 chiffres

2. Testez le flux complet :
   - Sélectionner un plan
   - Passer par la page de paiement
   - Vérifier la redirection
   - Vérifier l'événement webhook
   - Vérifier la base de données

### 8. Passer en production

1. Activez votre compte Stripe (fournir documents entreprise)
2. Remplacez les clés test par les clés production
3. Testez avec de vraies cartes (petits montants)
4. Activez le mode production dans le dashboard

## Email de contact Stripe

Adresse email à configurer : **[Votre email à fournir]**

Cette adresse sera utilisée pour :
- Recevoir les notifications Stripe
- Support client
- Facturation

## Sécurité

- ✅ Ne jamais exposer `STRIPE_SECRET_KEY` dans le frontend
- ✅ Valider tous les webhooks avec la signature
- ✅ Utiliser HTTPS en production
- ✅ Logger tous les échecs de paiement
- ✅ Implémenter une stratégie de retry pour les webhooks

## Support

- Documentation Stripe : https://stripe.com/docs
- Support Stripe : support@stripe.com
- Dashboard : https://dashboard.stripe.com

## Notes importantes

1. **Test vs Production** : Toujours tester en mode test avant la production
2. **Webhooks** : Essentiels pour mettre à jour les statuts d'abonnement
3. **Sécurité** : Ne jamais traiter les paiements côté client uniquement
4. **Conformité** : Stripe gère la conformité PCI-DSS
5. **Taxes** : Configurer Stripe Tax si nécessaire

## Checklist de déploiement

- [ ] Compte Stripe créé et vérifié
- [ ] Produits et prix créés
- [ ] Clés API récupérées
- [ ] Variables d'environnement configurées
- [ ] Backend déployé
- [ ] Webhooks configurés
- [ ] Tests de paiement réussis
- [ ] Email de notification configuré
- [ ] Mode production activé

