// Service d'authentification Meetizy
import { CONFIG } from './config.js';

class AuthService {
  constructor() {
    this.token = null;
    this.user = null;
    this.loadToken();
  }

  // Charger le token depuis le stockage
  async loadToken() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['meetizy_token', 'meetizy_user'], (result) => {
        this.token = result.meetizy_token || null;
        this.user = result.meetizy_user || null;
        resolve(this.token);
      });
    });
  }

  // Sauvegarder le token et les infos utilisateur
  async saveToken(token, user) {
    return new Promise((resolve) => {
      chrome.storage.local.set({
        meetizy_token: token,
        meetizy_user: user,
        token_saved_at: Date.now()
      }, () => {
        this.token = token;
        this.user = user;
        resolve(true);
      });
    });
  }

  // Supprimer le token (déconnexion)
  async clearToken() {
    return new Promise((resolve) => {
      chrome.storage.local.remove(['meetizy_token', 'meetizy_user', 'token_saved_at'], () => {
        this.token = null;
        this.user = null;
        resolve(true);
      });
    });
  }

  // Vérifier si l'utilisateur est connecté
  isAuthenticated() {
    return this.token !== null && this.token.length > 0;
  }

  // Récupérer le token actuel
  getToken() {
    return this.token;
  }

  // Récupérer l'utilisateur actuel
  getUser() {
    return this.user;
  }

  // Inscription
  async register(name, email, password) {
    try {
      const response = await fetch(`${CONFIG.API_URL}${CONFIG.ENDPOINTS.AUTH.REGISTER}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de l\'inscription');
      }

      // Sauvegarder le token et les infos utilisateur
      await this.saveToken(data.token, data.user);

      return {
        success: true,
        user: data.user,
        token: data.token
      };
    } catch (error) {
      console.error('Erreur registration:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Connexion
  async login(email, password) {
    try {
      const response = await fetch(`${CONFIG.API_URL}${CONFIG.ENDPOINTS.AUTH.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la connexion');
      }

      // Sauvegarder le token et les infos utilisateur
      await this.saveToken(data.token, data.user);

      return {
        success: true,
        user: data.user,
        token: data.token
      };
    } catch (error) {
      console.error('Erreur login:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Déconnexion
  async logout() {
    await this.clearToken();
    return { success: true };
  }

  // Récupérer le profil utilisateur
  async getProfile() {
    if (!this.isAuthenticated()) {
      throw new Error('Non authentifié');
    }

    try {
      const response = await fetch(`${CONFIG.API_URL}${CONFIG.ENDPOINTS.AUTH.ME}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la récupération du profil');
      }

      // Mettre à jour les infos utilisateur
      await this.saveToken(this.token, data.user);

      return {
        success: true,
        user: data.user
      };
    } catch (error) {
      console.error('Erreur getProfile:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Récupérer les quotas
  async getQuotas() {
    if (!this.isAuthenticated()) {
      throw new Error('Non authentifié');
    }

    try {
      const response = await fetch(`${CONFIG.API_URL}${CONFIG.ENDPOINTS.QUOTAS.BASE}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la récupération des quotas');
      }

      return {
        success: true,
        quotas: data.quotas
      };
    } catch (error) {
      console.error('Erreur getQuotas:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Faire une requête authentifiée
  async authenticatedRequest(endpoint, options = {}) {
    if (!this.isAuthenticated()) {
      throw new Error('Non authentifié');
    }

    const defaultOptions = {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const response = await fetch(`${CONFIG.API_URL}${endpoint}`, {
      ...options,
      ...defaultOptions
    });

    // Si token expiré, tenter de rafraîchir
    if (response.status === 401) {
      const refreshResult = await this.refreshToken();
      if (refreshResult.success) {
        // Réessayer la requête avec le nouveau token
        defaultOptions.headers.Authorization = `Bearer ${this.token}`;
        return fetch(`${CONFIG.API_URL}${endpoint}`, {
          ...options,
          ...defaultOptions
        });
      } else {
        // Token invalide, déconnecter
        await this.clearToken();
        throw new Error('Session expirée, veuillez vous reconnecter');
      }
    }

    return response;
  }

  // Rafraîchir le token
  async refreshToken() {
    if (!this.token) {
      return { success: false, error: 'Aucun token à rafraîchir' };
    }

    try {
      const response = await fetch(`${CONFIG.API_URL}${CONFIG.ENDPOINTS.AUTH.REFRESH}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors du rafraîchissement du token');
      }

      await this.saveToken(data.token, this.user);

      return { success: true, token: data.token };
    } catch (error) {
      console.error('Erreur refreshToken:', error);
      return { success: false, error: error.message };
    }
  }
}

// Exporter une instance singleton
const authService = new AuthService();
export default authService;
