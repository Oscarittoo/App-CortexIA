import { checkUserQuota, incrementUsage } from '../services/quotaService.js';

/**
 * Plans de quotas Meetizy
 */
export const PLANS = {
  free: {
    name: 'Free',
    aiMeetingsPerMonth: 10, // Augmenté pour les tests
    transcriptionMinutesPerMonth: 60,
    features: ['transcription', 'ai_summary', 'ai_action_plan', 'ai_suggestion', 'ai_enrich', 'export_txt', 'semantic_search']
  },
  pro: {
    name: 'Pro',
    aiMeetingsPerMonth: 10,
    transcriptionMinutesPerMonth: 600,
    features: ['transcription', 'ai_summary', 'ai_action_plan', 'export_pdf', 'semantic_search']
  },
  business: {
    name: 'Business',
    aiMeetingsPerMonth: 20,
    transcriptionMinutesPerMonth: 1200,
    features: ['transcription', 'ai_summary', 'ai_action_plan', 'export_pdf', 'semantic_search', 'collaboration', 'templates', 'analytics']
  },
  expert: {
    name: 'Expert',
    aiMeetingsPerMonth: -1, // Illimité
    transcriptionMinutesPerMonth: -1,
    features: ['all']
  },
  enterprise: {
    name: 'Enterprise',
    aiMeetingsPerMonth: -1, // Illimité
    transcriptionMinutesPerMonth: -1,
    features: ['all']
  }
};

/**
 * Middleware pour vérifier les quotas avant une requête IA
 */
export const checkQuota = (quotaType = 'ai_meeting') => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Authentification requise'
        });
      }

      const plan = PLANS[user.plan] || PLANS.free;
      
      // Vérifier si l'utilisateur a dépassé son quota
      const quotaStatus = await checkUserQuota(user.id, quotaType);
      
      if (!quotaStatus.allowed) {
        return res.status(403).json({
          success: false,
          error: `Quota ${quotaType} épuisé`,
          quota: {
            used: quotaStatus.used,
            limit: quotaStatus.limit,
            plan: user.plan,
            resetDate: quotaStatus.resetDate
          },
          upgrade: {
            message: 'Passez à un plan supérieur pour continuer',
            recommendedPlan: quotaStatus.recommendedPlan,
            link: '/pricing'
          }
        });
      }

      // Attacher les infos de quota à la requête
      req.quotaStatus = quotaStatus;
      
      next();
    } catch (error) {
      console.error('Erreur vérification quota:', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la vérification du quota'
      });
    }
  };
};

/**
 * Middleware pour incrémenter l'utilisation après une requête réussie
 */
export const incrementQuota = (quotaType = 'ai_meeting') => {
  return async (req, res, next) => {
    // Stocker la fonction send originale
    const originalSend = res.send;
    
    // Override la fonction send
    res.send = function (data) {
      // Si la réponse est un succès (2xx), incrémenter le quota
      if (res.statusCode >= 200 && res.statusCode < 300) {
        incrementUsage(req.user.id, quotaType).catch(error => {
          console.error('Erreur incrémentation quota:', error);
        });
      }
      
      // Appeler la fonction send originale
      originalSend.call(this, data);
    };
    
    next();
  };
};

/**
 * Middleware pour vérifier si une feature est disponible pour le plan
 */
export const requireFeature = (featureName) => {
  return (req, res, next) => {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Authentification requise'
      });
    }

    const plan = PLANS[user.plan] || PLANS.free;
    
    // Si le plan a 'all' features
    if (plan.features.includes('all')) {
      return next();
    }
    
    // Vérifier si la feature est dans le plan
    if (!plan.features.includes(featureName)) {
      return res.status(403).json({
        success: false,
        error: `La fonctionnalité "${featureName}" n'est pas disponible dans votre plan ${plan.name}`,
        upgrade: {
          message: 'Passez à un plan supérieur pour accéder à cette fonctionnalité',
          link: '/pricing'
        }
      });
    }
    
    next();
  };
};
