/**
 * Service d'authentification pour MEETIZY (Supabase)
 * Gère la connexion, l'inscription et la session utilisateur
 */
import { supabase } from './supabaseClient';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 heures en millisecondes
    this.LAST_ACTIVITY_KEY = 'meetizy_last_activity';
  }

  /**
   * Met à jour le timestamp de dernière activité
   */
  updateLastActivity() {
    localStorage.setItem(this.LAST_ACTIVITY_KEY, Date.now().toString());
  }

  /**
   * Vérifie si la session a expiré
   */
  isSessionExpired() {
    const lastActivity = localStorage.getItem(this.LAST_ACTIVITY_KEY);
    if (!lastActivity) return false;
    
    const elapsed = Date.now() - parseInt(lastActivity);
    return elapsed > this.SESSION_TIMEOUT;
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
      role: client?.role || 'user',
      loginAt: Date.now()
    };

    this.currentUser = userData;
    this.updateLastActivity(); // Enregistrer l'activité lors du login
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
    console.log('Inscription d\'un nouveau compte:', email, 'Plan:', plan);
    
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
      console.error('Erreur lors de l\'inscription Auth:', error);
      throw error;
    }

    console.log('Utilisateur créé dans Auth:', data.user?.email, 'ID:', data.user?.id);

    if (data.user) {
      try {
        console.log('Tentative de sauvegarde dans la table clients...');
        await this.saveToClientDatabase({
          id: data.user.id,
          email: data.user.email,
          company_name: companyName,
          plan
        });
        console.log('Utilisateur sauvegardé dans la table clients');
      } catch (e) {
        console.warn('Échec insertion dans table clients (confirmation email?):', e?.message || e);
        console.warn('Utilisez le bouton "Synchroniser utilisateurs" dans AdminDashboard pour corriger');
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
    localStorage.removeItem(this.LAST_ACTIVITY_KEY); // Nettoyer le timestamp
  }

  /**
   * Envoie un email de réinitialisation de mot de passe
   */
  async resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    if (error) throw error;
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
    // Vérifier si la session a expiré
    if (this.isSessionExpired()) {
      console.log('Session expirée après 24h d\'inactivité - Déconnexion automatique');
      await this.logout();
      return null;
    }

    const { data, error } = await supabase.auth.getUser();

    if (error || !data?.user) {
      localStorage.removeItem(this.LAST_ACTIVITY_KEY);
      return null;
    }

    // Mettre à jour l'activité si l'utilisateur est toujours connecté
    this.updateLastActivity();

    const client = await this.getClientById(data.user.id);
    const userData = {
      id: data.user.id,
      email: data.user.email,
      companyName: client?.company_name || null,
      plan: client?.plan || 'free',
      stripeSubscriptionId: client?.stripe_subscription_id || null,
      role: client?.role || 'user'
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

    console.log('Sauvegarde utilisateur dans BDD:', payload.email);

    const { data, error } = await supabase
      .from('clients')
      .upsert(payload, { onConflict: 'id', ignoreDuplicates: false });

    if (error) {
      console.error('Erreur lors de la sauvegarde dans la BD clients:', error);
      throw error; // Throw error pour qu'elle soit attrapée en amont
    }

    console.log('Utilisateur sauvegardé dans BDD:', payload.email);
    return data;
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
   * Synchronise l'utilisateur courant avec la table clients.
   * NOTE: supabase.auth.admin.listUsers() nécessite la Service Role Key côté serveur.
   * Cette méthode ne liste plus tous les utilisateurs (exposition de la clé admin supprimée).
   * Pour une sync complète, utiliser un trigger Supabase ou une Edge Function dédiée.
   */
  async syncAllUsersToClientDatabase() {
    console.log('Synchronisation de l\'utilisateur courant vers la BD clients...');
    try {
      const user = this.currentUser || await this.getCurrentUser();
      if (!user?.id) {
        return { success: false, error: 'Aucun utilisateur connecté' };
      }

      await this.saveToClientDatabase({
        id: user.id,
        email: user.email,
        company_name: user.companyName || null,
        plan: user.plan || 'free',
      });

      return { success: true, created: 0, updated: 1, errors: 0 };
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
      return { success: false, error: error.message };
    }
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
