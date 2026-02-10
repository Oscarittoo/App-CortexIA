import express from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { getAllUsers, updateUser } from '../services/userService.js';
import { getSystemStats } from '../services/adminService.js';

const router = express.Router();

// Tous les endpoints nécessitent authentification + droits admin
router.use(authenticate);
router.use(requireAdmin);

/**
 * GET /api/admin/stats
 * Statistiques globales du système
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await getSystemStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Erreur admin stats:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des statistiques'
    });
  }
});

/**
 * GET /api/admin/users
 * Liste de tous les utilisateurs
 */
router.get('/users', async (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;
    
    const users = await getAllUsers({
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Retirer les mots de passe
    const usersWithoutPassword = users.map(({ password, ...user }) => user);

    res.json({
      success: true,
      data: {
        users: usersWithoutPassword,
        total: usersWithoutPassword.length
      }
    });
  } catch (error) {
    console.error('Erreur admin users:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des utilisateurs'
    });
  }
});

/**
 * PUT /api/admin/users/:id
 * Modifier un utilisateur (plan, quotas, etc.)
 */
router.put('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const updates = req.body;

    const updatedUser = await updateUser(userId, updates);
    const { password, ...userWithoutPassword } = updatedUser;

    res.json({
      success: true,
      data: { user: userWithoutPassword }
    });
  } catch (error) {
    console.error('Erreur admin update user:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour de l\'utilisateur'
    });
  }
});

export default router;
