import { getUserById, updateUser } from './userService.js';
import { PLANS } from '../middleware/quotaCheck.js';

/**
 * Récupérer les quotas d'un utilisateur
 */
export async function getUserQuota(userId) {
  const user = await getUserById(userId);
  
  if (!user) {
    throw new Error('Utilisateur non trouvé');
  }

  // Vérifier si les quotas doivent être réinitialisés (nouveau mois)
  const lastReset = new Date(user.quotas?.lastReset || user.createdAt);
  const now = new Date();
  
  // Si on est dans un nouveau mois, réinitialiser les quotas
  if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
    await resetMonthlyQuotas(userId);
    return {
      aiMeetingsUsed: 0,
      transcriptionMinutesUsed: 0,
      lastReset: now.toISOString()
    };
  }

  return user.quotas || {
    aiMeetingsUsed: 0,
    transcriptionMinutesUsed: 0,
    lastReset: user.createdAt
  };
}

/**
 * Vérifier si l'utilisateur peut utiliser un quota
 */
export async function checkUserQuota(userId, quotaType = 'ai_meeting') {
  const user = await getUserById(userId);
  const plan = PLANS[user.plan] || PLANS.free;
  const quota = await getUserQuota(userId);

  let used, limit, remaining, allowed, recommendedPlan;

  switch (quotaType) {
    case 'ai_meeting':
      used = quota.aiMeetingsUsed;
      limit = plan.aiMeetingsPerMonth;
      remaining = limit === -1 ? -1 : limit - used;
      allowed = limit === -1 || remaining > 0;
      recommendedPlan = !allowed ? getNextPlan(user.plan) : null;
      break;

    case 'transcription_minutes':
      used = quota.transcriptionMinutesUsed;
      limit = plan.transcriptionMinutesPerMonth;
      remaining = limit === -1 ? -1 : limit - used;
      allowed = limit === -1 || remaining > 0;
      recommendedPlan = !allowed ? getNextPlan(user.plan) : null;
      break;

    default:
      throw new Error('Type de quota inconnu');
  }

  return {
    allowed,
    used,
    limit,
    remaining,
    resetDate: getNextResetDate(quota.lastReset),
    recommendedPlan
  };
}

/**
 * Incrémenter l'utilisation d'un quota
 */
export async function incrementUsage(userId, quotaType = 'ai_meeting', amount = 1) {
  const user = await getUserById(userId);
  const quota = await getUserQuota(userId);

  const updates = { quotas: { ...quota } };

  switch (quotaType) {
    case 'ai_meeting':
      updates.quotas.aiMeetingsUsed = (quota.aiMeetingsUsed || 0) + amount;
      break;

    case 'transcription_minutes':
      updates.quotas.transcriptionMinutesUsed = (quota.transcriptionMinutesUsed || 0) + amount;
      break;

    default:
      throw new Error('Type de quota inconnu');
  }

  await updateUser(userId, updates);
  return updates.quotas;
}

/**
 * Réinitialiser les quotas mensuels
 */
async function resetMonthlyQuotas(userId) {
  await updateUser(userId, {
    quotas: {
      aiMeetingsUsed: 0,
      transcriptionMinutesUsed: 0,
      lastReset: new Date().toISOString()
    }
  });
}

/**
 * Obtenir le plan suivant recommandé
 */
function getNextPlan(currentPlan) {
  const planOrder = ['free', 'pro', 'business', 'expert', 'enterprise'];
  const currentIndex = planOrder.indexOf(currentPlan);
  
  if (currentIndex < planOrder.length - 1) {
    return planOrder[currentIndex + 1];
  }
  
  return 'enterprise';
}

/**
 * Calculer la date du prochain reset
 */
function getNextResetDate(lastReset) {
  const date = new Date(lastReset);
  date.setMonth(date.getMonth() + 1);
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}
