/**
 * Service d'authentification pour CORTEXIA (Supabase)
 * Gère la connexion, l'inscription et la session utilisateur
 */
import { supabase } from './supabaseClient';

class AuthService {
  constructor() {
    this.currentUser = null;
  }

  /**
   * Connecte un utilisateur
   */
  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw error;
    }

    const client = await this.getClientById(data.user.id);
    const userData = {
      id: data.user.id,
      email: data.user.email,
      companyName: client?.company_name || null,
      plan: client?.plan || 'free',
      stripeSubscriptionId: client?.stripe_subscription_id || null,
      role: client?.role || this.determineRole(data.user.email),
      loginAt: Date.now()
    };

    this.currentUser = userData;
    await this.saveToClientDatabase({
      id: data.user.id,
      email: data.user.email,
      company_name: client?.company_name || null,
      plan: client?.plan || 'free',
      stripe_subscription_id: client?.stripe_subscription_id || null,
      role: userData.role
    });
    return userData;
  }

  /**
   * Crée un nouveau compte
   */
  async register(email, password, companyName, plan = 'free') {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          company_name: companyName,
          plan
        }
      }
    });

    if (error) {
      throw error;
    }

    if (data.user) {
      try {
        await this.saveToClientDatabase({
          id: data.user.id,
          email: data.user.email,
          company_name: companyName,
          plan
        });
      } catch (e) {
        console.warn('Insertion client différée (email confirmation active):', e?.message || e);
      }
    }

    const userData = {
      id: data.user?.id || null,
      email: data.user?.email || email,
      companyName,
      plan,
      registeredAt: Date.now()
    };

    this.currentUser = userData;
    return userData;
  }

  /**
   * Déconnecte l'utilisateur
   */
  async logout() {
    await supabase.auth.signOut();
    this.currentUser = null;
  }

  /**
   * Vérifie si l'utilisateur est connecté
   */
  isAuthenticated() {
    return this.currentUser !== null;
  }

  /**
   * Récupère l'utilisateur actuel
   */
  async getCurrentUser() {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data?.user) {
      return null;
    }

    const client = await this.getClientById(data.user.id);
    const userData = {
      id: data.user.id,
      email: data.user.email,
      companyName: client?.company_name || null,
      plan: client?.plan || 'free',
      stripeSubscriptionId: client?.stripe_subscription_id || null,
      role: client?.role || this.determineRole(data.user.email)
    };

    this.currentUser = userData;
    return userData;
  }

  /**
   * Met à jour le plan de l'utilisateur
   */
  async updatePlan(plan, stripeSubscriptionId = null) {
    const user = this.currentUser || await this.getCurrentUser();
    if (!user?.id) return null;

    const updates = {
      plan,
      stripe_subscription_id: stripeSubscriptionId,
      last_updated: new Date().toISOString()
    };

    await supabase.from('clients')
      .update(updates)
      .eq('id', user.id);

    this.currentUser = {
      ...user,
      plan,
      stripeSubscriptionId
    };

    return this.currentUser;
  }

  /**
   * Sauvegarde les données client dans la base de données
   */
  async saveToClientDatabase(userData) {
    const payload = {
      id: userData.id || null,
      email: userData.email,
      company_name: userData.company_name || userData.companyName || null,
      plan: userData.plan || 'free',
      stripe_subscription_id: userData.stripe_subscription_id || userData.stripeSubscriptionId || null,
      created_at: new Date().toISOString(),
      last_updated: new Date().toISOString()
    };

    const { error } = await supabase
      .from('clients')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.error('Erreur lors de la sauvegarde dans la BD clients:', error);
    }
  }

  /**
   * Récupère tous les clients (admin uniquement)
   */
  async getAllClients() {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur lors de la récupération des clients:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Recherche un client par email (admin uniquement)
   */
  async getClientByEmail(email) {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      console.error('Erreur lors de la récupération du client:', error);
      return null;
    }

    return data || null;
  }

  /**
   * Récupère un client par ID
   */
  async getClientById(id) {
    if (!id) return null;

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      return null;
    }

    return data || null;
  }

  /**
   * Détermine le rôle en fonction de l'email (liste d'admins)
   */
  determineRole(email) {
    const adminEmails = [
      'oscarbrixon@gmail.com'
    ];
    return adminEmails.includes(email?.toLowerCase()) ? 'admin' : 'user';
  }

  /**
   * Récupère les statistiques clients (admin uniquement)
   */
  async getClientStats() {
    const clients = await this.getAllClients();

    const planCounts = clients.reduce((acc, client) => {
      acc[client.plan] = (acc[client.plan] || 0) + 1;
      return acc;
    }, {});

    return {
      totalClients: clients.length,
      planDistribution: planCounts,
      recentClients: clients.slice(0, 10)
    };
  }
}

const authService = new AuthService();
export default authService;
