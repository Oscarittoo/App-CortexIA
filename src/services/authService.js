/**
 * Service d'authentification pour CORTEXIA
 * Gère la connexion, l'inscription et la session utilisateur
 */

class AuthService {
  constructor() {
    this.currentUser = null;
    this.loadCurrentUser();
  }

  /**
   * Charge l'utilisateur actuel depuis localStorage
   */
  loadCurrentUser() {
    try {
      const userData = localStorage.getItem('cortexia_user');
      if (userData) {
        this.currentUser = JSON.parse(userData);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'utilisateur:', error);
    }
  }

  /**
   * Connecte un utilisateur
   */
  login(email, password) {
    // TODO: Implémenter la vraie authentification avec backend
    const userData = {
      email,
      plan: 'free',
      loginAt: Date.now()
    };
    
    this.currentUser = userData;
    localStorage.setItem('cortexia_user', JSON.stringify(userData));
    
    return userData;
  }

  /**
   * Crée un nouveau compte
   */
  register(email, password, companyName, plan = 'free') {
    // TODO: Implémenter le vrai enregistrement avec backend
    const userData = {
      id: `user-${Date.now()}`,
      email,
      companyName,
      plan,
      registeredAt: Date.now(),
      trialEndsAt: Date.now() + (14 * 24 * 60 * 60 * 1000) // 14 jours
    };

    this.currentUser = userData;
    localStorage.setItem('cortexia_user', JSON.stringify(userData));

    // Sauvegarder aussi dans la base de données clients
    this.saveToClientDatabase(userData);
    
    return userData;
  }

  /**
   * Déconnecte l'utilisateur
   */
  logout() {
    this.currentUser = null;
    localStorage.removeItem('cortexia_user');
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
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Met à jour le plan de l'utilisateur
   */
  updatePlan(plan, stripeSubscriptionId = null) {
    if (!this.currentUser) return null;

    this.currentUser.plan = plan;
    this.currentUser.stripeSubscriptionId = stripeSubscriptionId;
    this.currentUser.updatedAt = Date.now();

    localStorage.setItem('cortexia_user', JSON.stringify(this.currentUser));
    this.saveToClientDatabase(this.currentUser);

    return this.currentUser;
  }

  /**
   * Sauvegarde les données client dans la base de données
   * (pour accès admin uniquement)
   */
  saveToClientDatabase(userData) {
    try {
      const clients = JSON.parse(localStorage.getItem('cortexia_clients_db') || '[]');
      
      // Vérifier si le client existe déjà
      const existingIndex = clients.findIndex(c => c.email === userData.email);
      
      if (existingIndex !== -1) {
        // Mettre à jour
        clients[existingIndex] = {
          ...clients[existingIndex],
          ...userData,
          lastUpdated: Date.now()
        };
      } else {
        // Ajouter nouveau
        clients.push({
          ...userData,
          createdAt: Date.now(),
          lastUpdated: Date.now()
        });
      }

      localStorage.setItem('cortexia_clients_db', JSON.stringify(clients));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde dans la BD clients:', error);
    }
  }

  /**
   * Récupère tous les clients (admin uniquement)
   * TODO: Protéger avec authentification admin
   */
  getAllClients() {
    try {
      return JSON.parse(localStorage.getItem('cortexia_clients_db') || '[]');
    } catch (error) {
      console.error('Erreur lors de la récupération des clients:', error);
      return [];
    }
  }

  /**
   * Recherche un client par email (admin uniquement)
   */
  getClientByEmail(email) {
    const clients = this.getAllClients();
    return clients.find(c => c.email === email);
  }

  /**
   * Récupère les statistiques clients (admin uniquement)
   */
  getClientStats() {
    const clients = this.getAllClients();
    
    const planCounts = clients.reduce((acc, client) => {
      acc[client.plan] = (acc[client.plan] || 0) + 1;
      return acc;
    }, {});

    return {
      totalClients: clients.length,
      planDistribution: planCounts,
      recentClients: clients
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 10)
    };
  }
}

const authService = new AuthService();
export default authService;
