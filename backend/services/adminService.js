import { getAllUsers as getUsers } from './userService.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Récupérer les statistiques globales du système (admin)
 */
export async function getSystemStats() {
  try {
    // Charger les utilisateurs
    const users = await getUsers({ limit: 10000 });
    
    // Charger les sessions
    const SESSIONS_FILE = path.join(__dirname, '../data/sessions.json');
    const sessionsData = await fs.readFile(SESSIONS_FILE, 'utf8');
    const sessions = JSON.parse(sessionsData);

    // Statistiques utilisateurs par plan
    const usersByPlan = users.reduce((acc, user) => {
      acc[user.plan] = (acc[user.plan] || 0) + 1;
      return acc;
    }, {});

    // Statistiques sessions
    const completedSessions = sessions.filter(s => s.status === 'completed');
    const inProgressSessions = sessions.filter(s => s.status === 'in_progress');

    // Calcul des quotas utilisés
    const totalAIMeetingsUsed = users.reduce((sum, user) => 
      sum + (user.quotas?.aiMeetingsUsed || 0), 0
    );

    const totalTranscriptionMinutes = users.reduce((sum, user) => 
      sum + (user.quotas?.transcriptionMinutesUsed || 0), 0
    );

    // Sessions ce mois
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const sessionsThisMonth = sessions.filter(s => 
      new Date(s.startTime) >= firstDayOfMonth
    );

    return {
      users: {
        total: users.length,
        byPlan: usersByPlan,
        newThisMonth: users.filter(u => new Date(u.createdAt) >= firstDayOfMonth).length
      },
      sessions: {
        total: sessions.length,
        completed: completedSessions.length,
        inProgress: inProgressSessions.length,
        thisMonth: sessionsThisMonth.length
      },
      usage: {
        totalAIMeetingsUsed,
        totalTranscriptionMinutes,
        averageAIMeetingsPerUser: users.length > 0 ? (totalAIMeetingsUsed / users.length).toFixed(2) : 0
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Erreur getSystemStats:', error);
    throw error;
  }
}
