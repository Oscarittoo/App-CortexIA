// Configuration de l'extension Meetizy

export const CONFIG = {
  // URL du backend Meetizy
  API_URL: 'http://localhost:3001/api',
  
  // Endpoints
  ENDPOINTS: {
    AUTH: {
      REGISTER: '/auth/register',
      LOGIN: '/auth/login',
      ME: '/auth/me',
      REFRESH: '/auth/refresh',
      UPDATE_PLAN: '/auth/update-plan'
    },
    AI: {
      SUMMARY: '/ai/summary',
      ACTION_PLAN: '/ai/action-plan',
      SUGGESTION: '/ai/suggestion',
      ENRICH: '/ai/enrich',
      ANALYZE_BATCH: '/ai/analyze-batch'
    },
    SESSIONS: {
      BASE: '/sessions',
      SYNC: '/sessions/sync'
    },
    QUOTAS: {
      BASE: '/quotas',
      USAGE_STATS: '/quotas/usage-stats'
    }
  },
  
  // Durée de vie des tokens (30 jours)
  TOKEN_EXPIRATION: 30 * 24 * 60 * 60 * 1000,
  
  // Version de l'extension
  VERSION: '1.0.0'
};
