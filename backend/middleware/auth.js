import jwt from 'jsonwebtoken';
import { getUserById } from '../services/userService.js';

/**
 * Middleware d'authentification JWT
 * Vérifie le token et attache l'utilisateur à req.user
 */
export const authenticate = async (req, res, next) => {
  try {
    // Récupérer le token depuis l'header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Token d\'authentification manquant'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer '

    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Récupérer l'utilisateur
    const user = await getUserById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }

    // Attacher l'utilisateur à la requête
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Token invalide'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expiré'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Erreur d\'authentification'
    });
  }
};

/**
 * Middleware pour vérifier si l'utilisateur est admin
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Accès interdit - Droits administrateur requis'
    });
  }
  next();
};

/**
 * Middleware optionnel d'authentification
 * Continue même si pas de token (pour routes publiques avec contenu enrichi si connecté)
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await getUserById(decoded.userId);
      
      if (user) {
        req.user = user;
      }
    }
  } catch (error) {
    // Ignore errors for optional auth
  }
  
  next();
};
