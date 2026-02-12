# Configuration Stripe pour Meetizy

## 🚀 Étape 1 : Créer un compte Stripe

1. Rendez-vous sur [stripe.com](https://stripe.com)
2. Créez un compte ou connectez-vous
3. Activez votre compte en fournissant les informations requises

## 🔑 Étape 2 : Récupérer les clés API

1. Allez dans **Developers** > **API keys**
2. Copiez la clé **Publishable key** (commence par `pk_`)
3. Copiez la clé **Secret key** (commence par `sk_`)
4. **IMPORTANT** : Ne partagez JAMAIS votre Secret key

## 💰 Étape 3 : Créer les produits et prix

### Plan Pro (29,99€/mois)
1. Allez dans **Products** > **Add product**
2. Nom: `Meetizy Pro`
3. Prix: `29.99 EUR`
4. Type: `Recurring` (monthly)
5. Copiez l'ID du prix (commence par `price_`)

### Plan Business (49,99€/membre/mois)
1. Créez un nouveau produit
2. Nom: `Meetizy Business`
3. Prix: `49.99 EUR`
4. Type: `Recurring` (monthly)
5. Copiez l'ID du prix

### Plan Expert (129,99€/membre/mois)
1. Créez un nouveau produit
2. Nom: `Meetizy Expert`  
3. Prix: `129.99 EUR`
4. Type: `Recurring` (monthly)
5. Copiez l'ID du prix

## ⚙️ Étape 4 : Configurer les variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
# Clé publique Stripe (Frontend)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# IDs des prix Stripe
VITE_STRIPE_PRICE_PRO=price_...
VITE_STRIPE_PRICE_BUSINESS=price_...
VITE_STRIPE_PRICE_EXPERT=price_...
```

**Note** : Remplacez `pk_test_` par `pk_live_` en production.

## 🔧 Étape 5 : Configurer le backend (API)

Vous devez créer un backend pour gérer les paiements de manière sécurisée.

### Endpoints requis :

#### 1. Créer une session de checkout
```
POST /api/create-checkout-session
```
**Body:**
```json
{
  "priceId": "price_...",
  "userId": "user123",
  "userEmail": "user@example.com",
  "successUrl": "https://meetizy.com/success",
  "cancelUrl": "https://meetizy.com/pricing"
}
```

**Réponse:**
```json
{
  "sessionId": "cs_test_..."
}
```

#### 2. Créer une session de portail client
```
POST /api/create-portal-session
```
**Body:**
```json
{
  "customerId": "cus_...",
  "returnUrl": "https://meetizy.com/settings"
}
```

**Réponse:**
```json
{
  "url": "https://billing.stripe.com/session/..."
}
```

#### 3. Webhook Stripe
```
POST /api/stripe-webhook
```
Écoute les événements Stripe :
- `checkout.session.completed` - Paiement réussi
- `customer.subscription.created` - Abonnement créé
- `customer.subscription.updated` - Abonnement modifié
- `customer.subscription.deleted` - Abonnement annulé

## 📝 Exemple de code backend (Node.js)

```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Créer une session de checkout
app.post('/api/create-checkout-session', async (req, res) => {
  const { priceId, userId, userEmail, successUrl, cancelUrl } = req.body;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'subscription',
    line_items: [{
      price: priceId,
      quantity: 1,
    }],
    customer_email: userEmail,
    metadata: { userId },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  res.json({ sessionId: session.id });
});

// Créer une session de portail client
app.post('/api/create-portal-session', async (req, res) => {
  const { customerId, returnUrl } = req.body;

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  res.json({ url: session.url });
});

// Webhook Stripe
app.post('/api/stripe-webhook', express.raw({type: 'application/json'}), (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Gérer les événements
  switch (event.type) {
    case 'checkout.session.completed':
      // Activer l'abonnement dans votre BDD
      const session = event.data.object;
      const userId = session.metadata.userId;
      const customerId = session.customer;
      // Mettre à jour la BDD
      break;
    
    case 'customer.subscription.deleted':
      // Rétrograder l'utilisateur au plan gratuit
      break;
  }

  res.json({received: true});
});
```

## 🔔 Étape 6 : Configurer les webhooks

1. Allez dans **Developers** > **Webhooks**
2. Cliquez sur **Add endpoint**
3. URL: `https://votre-domaine.com/api/stripe-webhook`
4. Événements à écouter :
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copiez le **Signing secret** (commence par `whsec_`)
6. Ajoutez-le dans votre `.env` : `STRIPE_WEBHOOK_SECRET=whsec_...`

## 🧪 Étape 7 : Tester en mode test

1. Utilisez les clés de test (`pk_test_` et `sk_test_`)
2. Utilisez les [cartes de test Stripe](https://stripe.com/docs/testing) :
   - **Succès** : `4242 4242 4242 4242`
   - **Échec** : `4000 0000 0000 0002`
   - **3D Secure** : `4000 0027 6000 3184`
3. Date d'expiration : N'importe quelle date future
4. CVC : N'importe quel 3 chiffres

## 🚀 Étape 8 : Passer en production

1. Activez votre compte Stripe
2. Remplacez les clés de test par les clés de production
3. Mettez à jour vos webhooks pour l'URL de production
4. Testez avec une vraie carte (montant minimum)
5. Configurez les emails de confirmation dans Stripe Dashboard

## 📊 Étape 9 : Gestion des abonnements

Dans [src/services/authService.js](src/services/authService.js), ajoutez le champ `stripeCustomerId` :

```javascript
// Lors de l'inscription ou du premier paiement
await authService.updateUserStripeId(userId, customerId);
```

## ✅ Vérifications finales

- [ ] Clés Stripe configurées dans `.env`
- [ ] Produits et prix créés dans Stripe Dashboard
- [ ] Backend API créé et déployé
- [ ] Webhooks configurés et testés
- [ ] Tests réalisés avec cartes de test
- [ ] Emails de confirmation activés
- [ ] Plan gratuit fonctionne sans paiement
- [ ] Portail client accessible pour les abonnés

## 🆘 Support

En cas de problème :
1. Vérifiez les logs dans Stripe Dashboard > Developers > Logs
2. Testez les webhooks dans Stripe Dashboard > Developers > Webhooks > Test
3. Consultez la [documentation Stripe](https://stripe.com/docs)
4. Contactez support@meetizy.com

## 🔒 Sécurité

- ❌ Ne jamais exposer la `STRIPE_SECRET_KEY` côté frontend
- ✅ Toujours valider les webhooks avec la signature
- ✅ Toujours vérifier les montants côté serveur
- ✅ Utiliser HTTPS en production
- ✅ Activer l'authentification 3D Secure
