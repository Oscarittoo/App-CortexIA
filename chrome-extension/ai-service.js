// Meetizy AI Service - Intégration Backend Centralisé
// Ce service gère les interactions avec le backend Meetizy qui proxy OpenAI

import { CONFIG } from './config.js';
import authService from './auth-service.js';

class MeetizyAIService {
  constructor() {
    this.conversationHistory = [];
  }

  // Vérifier si l'utilisateur est authentifié
  isConfigured() {
    return authService.isAuthenticated();
  }

  // Analyser la transcription et générer une synthèse
  async generateSummary(transcript) {
    if (!this.isConfigured()) {
      throw new Error('Veuillez vous connecter à votre compte Meetizy');
    }

    try {
      const response = await authService.authenticatedRequest(
        CONFIG.ENDPOINTS.AI.SUMMARY,
        {
          method: 'POST',
          body: JSON.stringify({ transcript })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la génération de la synthèse');
      }

      return {
        success: true,
        summary: data.summary,
        usage: data.usage
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Générer un plan d'action à partir de la transcription
  async generateActionPlan(transcript, summary = null) {
    if (!this.isConfigured()) {
      throw new Error('Veuillez vous connecter à votre compte Meetizy');
    }

    try {
      const response = await authService.authenticatedRequest(
        CONFIG.ENDPOINTS.AI.ACTION_PLAN,
        {
          method: 'POST',
          body: JSON.stringify({ transcript, summary })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la génération du plan d\'action');
      }

      return {
        success: true,
        actions: data.actions,
        usage: data.usage
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Obtenir des suggestions en temps réel pendant la réunion
  async getRealTimeSuggestion(recentTranscript, context = '') {
    if (!this.isConfigured()) {
      throw new Error('Veuillez vous connecter à votre compte Meetizy');
    }

    try {
      const response = await authService.authenticatedRequest(
        CONFIG.ENDPOINTS.AI.SUGGESTION,
        {
          method: 'POST',
          body: JSON.stringify({ recentTranscript, context })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la génération de suggestion');
      }

      return {
        success: true,
        suggestion: data.suggestion,
        usage: data.usage
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Enrichir une transcription avec analyse sémantique
  async enrichTranscription(transcript) {
    if (!this.isConfigured()) {
      throw new Error('Veuillez vous connecter à votre compte Meetizy');
    }

    try {
      const response = await authService.authenticatedRequest(
        CONFIG.ENDPOINTS.AI.ENRICH,
        {
          method: 'POST',
          body: JSON.stringify({ transcript })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de l\'enrichissement');
      }

      return {
        success: true,
        enrichment: data.enrichment,
        usage: data.usage
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Analyse complète (batch) - Appel tous les services en parallèle
  async analyzeComplete(transcript) {
    if (!this.isConfigured()) {
      throw new Error('Veuillez vous connecter à votre compte Meetizy');
    }

    try {
      const response = await authService.authenticatedRequest(
        CONFIG.ENDPOINTS.AI.ANALYZE_BATCH,
        {
          method: 'POST',
          body: JSON.stringify({ transcript })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de l\'analyse complète');
      }

      return {
        success: true,
        summary: data.summary,
        actions: data.actions,
        enrichment: data.enrichment
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Placeholder pour maintenir la compatibilité avec le code existant
  async getRealTimeSuggestionLegacy(recentTranscript, context = '') {
    const prompt = `Contexte de la réunion : ${context}

Dernières paroles échangées :
${recentTranscript}

En tant qu'assistant IA en temps réel, fournis une suggestion courte et pertinente qui pourrait aider les participants.`;
    // Cette méthode est maintenant obsolète - utiliser getRealTimeSuggestion()
    return this.getRealTimeSuggestion(recentTranscript, context);
  }

  // Réinitialiser l'historique de conversation
  resetConversation() {
    this.conversationHistory = [];
  }

  // Obtenir les statistiques d'utilisation depuis le backend
  async getUsageStats() {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'Non authentifié'
      };
    }

    try {
      const response = await authService.authenticatedRequest(
        CONFIG.ENDPOINTS.QUOTAS.USAGE_STATS,
        { method: 'GET' }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la récupération des stats');
      }

      return {
        success: true,
        stats: data.stats
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Exporter une instance singleton
const meetizyAI = new MeetizyAIService();
export default meetizyAI;

// Rendre disponible globalement pour compatibilité
if (typeof window !== 'undefined') {
  window.meetizyAI = meetizyAI;
}
