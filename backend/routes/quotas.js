import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getUserQuota } from '../services/quotaService.js';
import { PLANS } from '../middleware/quotaCheck.js';

const router = express.Router();

/**
 * GET /api/quotas
 * Récupérer les quotas de l'utilisateur connecté
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const quota = await getUserQuota(req.user.id);
    const plan = PLANS[req.user.plan] || PLANS.free;

    res.json({
      success: true,
      data: {
        plan: req.user.plan,
        quotas: {
          aiMeetings: {
            used: quota.aiMeetingsUsed,
            limit: plan.aiMeetingsPerMonth,
            remaining: plan.aiMeetingsPerMonth === -1 ? -1 : plan.aiMeetingsPerMonth - quota.aiMeetingsUsed,
            unlimited: plan.aiMeetingsPerMonth === -1
          },
          transcriptionMinutes: {
            used: quota.transcriptionMinutesUsed,
            limit: plan.transcriptionMinutesPerMonth,
            remaining: plan.transcriptionMinutesPerMonth === -1 ? -1 : plan.transcriptionMinutesPerMonth - quota.transcriptionMinutesUsed,
            unlimited: plan.transcriptionMinutesPerMonth === -1
          }
        },
        resetDate: quota.lastReset,
        features: plan.features
      }
    });
  } catch (error) {
    console.error('Erreur get quotas:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des quotas'
    });
  }
});

/**
 * GET /api/quotas/usage-stats
 * Statistiques d'utilisation détaillées
 */
router.get('/usage-stats', authenticate, async (req, res) => {
  try {
    const quota = await getUserQuota(req.user.id);
    const plan = PLANS[req.user.plan] || PLANS.free;

    // Calculer des statistiques supplémentaires
    const aiMeetingsPercentage = plan.aiMeetingsPerMonth === -1 ? 0 :
      (quota.aiMeetingsUsed / plan.aiMeetingsPerMonth) * 100;
    
    const transcriptionPercentage = plan.transcriptionMinutesPerMonth === -1 ? 0 :
      (quota.transcriptionMinutesUsed / plan.transcriptionMinutesPerMonth) * 100;

    res.json({
      success: true,
      data: {
        current: {
          aiMeetingsUsed: quota.aiMeetingsUsed,
          transcriptionMinutesUsed: quota.transcriptionMinutesUsed,
          aiMeetingsPercentage: Math.min(aiMeetingsPercentage, 100),
          transcriptionPercentage: Math.min(transcriptionPercentage, 100)
        },
        limits: {
          aiMeetingsLimit: plan.aiMeetingsPerMonth,
          transcriptionMinutesLimit: plan.transcriptionMinutesPerMonth
        },
        period: {
          startDate: quota.lastReset,
          endDate: getNextResetDate(quota.lastReset)
        },
        warnings: {
          aiMeetingsLow: aiMeetingsPercentage >= 80 && plan.aiMeetingsPerMonth !== -1,
          transcriptionLow: transcriptionPercentage >= 80 && plan.transcriptionMinutesPerMonth !== -1
        }
      }
    });
  } catch (error) {
    console.error('Erreur usage stats:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des statistiques'
    });
  }
});

// Helper pour calculer la date de prochain reset
function getNextResetDate(lastReset) {
  const date = new Date(lastReset);
  date.setMonth(date.getMonth() + 1);
  return date.toISOString();
}

export default router;
