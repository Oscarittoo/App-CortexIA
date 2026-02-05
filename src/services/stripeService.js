/**
 * Service Stripe pour MEETIZY
 * Gère les paiements et abonnements
 * 
 * TODO: Configurer avec vos vraies clés Stripe
 */

class StripeService {
  constructor() {
    // TODO: Remplacer par votre clé Stripe publique
    this.publishableKey = import.meta.env?.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_...';
    this.stripe = null;
    this.initialized = false;
  }

  /**
   * Initialise Stripe
   */
  async initialize() {
    if (this.initialized) return;

    try {
      // Charger Stripe.js
      if (!window.Stripe) {
        await this.loadStripeScript();
      }

      this.stripe = window.Stripe(this.publishableKey);
      this.initialized = true;
      console.log('Stripe initialisé');
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de Stripe:', error);
    }
  }

  /**
   * Charge le script Stripe.js
   */
  loadStripeScript() {
    return new Promise((resolve, reject) => {
      if (document.getElementById('stripe-js')) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.id = 'stripe-js';
      script.src = 'https://js.stripe.com/v3/';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  /**
   * Crée une session de paiement
   * @param {string} planId - L'ID du plan (pro, enterprise)
   * @param {string} customerEmail - Email du client
   */
  async createCheckoutSession(planId, customerEmail) {
    try {
      // TODO: Appeler votre backend pour créer la session Stripe
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          customerEmail,
          successUrl: `${window.location.origin}/success`,
          cancelUrl: `${window.location.origin}/pricing`,
        }),
      });

      const { sessionId } = await response.json();

      // Rediriger vers Stripe Checkout
      await this.stripe.redirectToCheckout({ sessionId });
    } catch (error) {
      console.error('Erreur lors de la création de la session:', error);
      throw error;
    }
  }

  /**
   * Récupère les détails d'un abonnement
   */
  async getSubscription(subscriptionId) {
    try {
      // TODO: Appeler votre backend
      const response = await fetch(`/api/stripe/subscription/${subscriptionId}`);
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'abonnement:', error);
      throw error;
    }
  }

  /**
   * Annule un abonnement
   */
  async cancelSubscription(subscriptionId) {
    try {
      // TODO: Appeler votre backend
      const response = await fetch(`/api/stripe/subscription/${subscriptionId}/cancel`, {
        method: 'POST',
      });
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de l\'annulation de l\'abonnement:', error);
      throw error;
    }
  }

  /**
   * Crée un portail client pour gérer les abonnements
   */
  async createCustomerPortal(customerId) {
    try {
      // TODO: Appeler votre backend
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          returnUrl: window.location.origin,
        }),
      });

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Erreur lors de la création du portail:', error);
      throw error;
    }
  }

  /**
   * Prix des plans (en centimes)
   */
  getPlanPrices() {
    return {
      free: 0,
      pro: 2900, // 29€
      enterprise: null, // Sur mesure
    };
  }

  /**
   * IDs des prix Stripe
   * TODO: Remplacer par vos vrais IDs de prix Stripe
   */
  getPriceIds() {
    return {
      pro_monthly: 'price_...',
      pro_yearly: 'price_...',
      enterprise: 'price_...',
    };
  }
}

const stripeService = new StripeService();
export default stripeService;

/**
 * INSTRUCTIONS DE CONFIGURATION:
 * 
 * 1. Créer un compte Stripe sur https://stripe.com
 * 2. Récupérer les clés API (Dashboard > Developers > API keys)
 * 3. Créer des produits et prix dans Stripe Dashboard
 * 4. Remplacer les clés et IDs ci-dessus
 * 5. Créer un backend pour gérer les webhooks Stripe
 * 6. Configurer les variables d'environnement:
 *    - VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
 *    - STRIPE_SECRET_KEY=sk_live_... (côté serveur uniquement)
 */
