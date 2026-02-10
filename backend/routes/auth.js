import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { createUser, getUserByEmail, updateUser } from '../services/userService.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/auth/register
 * Créer un nouveau compte utilisateur
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, plan = 'free' } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: 'Email, mot de passe et nom requis'
      });
    }

    // Vérifier si l'email existe déjà
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Cet email est déjà utilisé'
      });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const user = await createUser({
      id: uuidv4(),
      email,
      password: hashedPassword,
      name,
      plan,
      role: 'user',
      createdAt: new Date().toISOString(),
      quotas: {
        aiMeetingsUsed: 0,
        transcriptionMinutesUsed: 0,
        lastReset: new Date().toISOString()
      }
    });

    // Générer le token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Ne pas retourner le mot de passe
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      success: true,
      data: {
        user: userWithoutPassword,
        token
      }
    });
  } catch (error) {
    console.error('Erreur register:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création du compte'
    });
  }
});

/**
 * POST /api/auth/login
 * Connexion utilisateur
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email et mot de passe requis'
      });
    }

    // Trouver l'utilisateur
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Email ou mot de passe incorrect'
      });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Email ou mot de passe incorrect'
      });
    }

    // Générer le token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Ne pas retourner le mot de passe
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token
      }
    });
  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la connexion'
    });
  }
});

/**
 * GET /api/auth/me
 * Récupérer les informations de l'utilisateur connecté
 */
router.get('/me', authenticate, async (req, res) => {
  try {
    const { password: _, ...userWithoutPassword } = req.user;

    res.json({
      success: true,
      data: {
        user: userWithoutPassword
      }
    });
  } catch (error) {
    console.error('Erreur me:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération du profil'
    });
  }
});

/**
 * PUT /api/auth/update-plan
 * Mettre à jour le plan de l'utilisateur
 */
router.put('/update-plan', authenticate, async (req, res) => {
  try {
    const { plan } = req.body;
    
    const validPlans = ['free', 'pro', 'business', 'expert', 'enterprise'];
    if (!validPlans.includes(plan)) {
      return res.status(400).json({
        success: false,
        error: 'Plan invalide'
      });
    }

    const updatedUser = await updateUser(req.user.id, { plan });
    const { password: _, ...userWithoutPassword } = updatedUser;

    res.json({
      success: true,
      data: {
        user: userWithoutPassword
      }
    });
  } catch (error) {
    console.error('Erreur update-plan:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour du plan'
    });
  }
});

/**
 * POST /api/auth/refresh
 * Rafraîchir le token JWT
 */
router.post('/refresh', authenticate, async (req, res) => {
  try {
    // Générer un nouveau token
    const token = jwt.sign(
      { userId: req.user.id, email: req.user.email },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      data: { token }
    });
  } catch (error) {
    console.error('Erreur refresh:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors du rafraîchissement du token'
    });
  }
});

export default router;
