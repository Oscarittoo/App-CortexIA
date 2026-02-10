import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { createSession, getSessionById, getUserSessions, updateSession, deleteSession } from '../services/sessionService.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

/**
 * POST /api/sessions
 * Créer une nouvelle session
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const { platform, title, transcript = [], participants = [] } = req.body;

    const session = await createSession({
      id: uuidv4(),
      userId: req.user.id,
      platform,
      title: title || 'Réunion sans titre',
      startTime: new Date().toISOString(),
      transcript,
      participants,
      status: 'in_progress'
    });

    res.status(201).json({
      success: true,
      data: { session }
    });
  } catch (error) {
    console.error('Erreur create session:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création de la session'
    });
  }
});

/**
 * GET /api/sessions
 * Récupérer toutes les sessions de l'utilisateur
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const { limit = 50, offset = 0, status } = req.query;
    
    const sessions = await getUserSessions(
      req.user.id, 
      { limit: parseInt(limit), offset: parseInt(offset), status }
    );

    res.json({
      success: true,
      data: { sessions }
    });
  } catch (error) {
    console.error('Erreur get sessions:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des sessions'
    });
  }
});

/**
 * GET /api/sessions/:id
 * Récupérer une session spécifique
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const session = await getSessionById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session non trouvée'
      });
    }

    // Vérifier que la session appartient à l'utilisateur
    if (session.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Accès non autorisé'
      });
    }

    res.json({
      success: true,
      data: { session }
    });
  } catch (error) {
    console.error('Erreur get session:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération de la session'
    });
  }
});

/**
 * PUT /api/sessions/:id
 * Mettre à jour une session
 */
router.put('/:id', authenticate, async (req, res) => {
  try {
    const session = await getSessionById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session non trouvée'
      });
    }

    if (session.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Accès non autorisé'
      });
    }

    const updatedSession = await updateSession(req.params.id, req.body);

    res.json({
      success: true,
      data: { session: updatedSession }
    });
  } catch (error) {
    console.error('Erreur update session:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour de la session'
    });
  }
});

/**
 * DELETE /api/sessions/:id
 * Supprimer une session
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const session = await getSessionById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session non trouvée'
      });
    }

    if (session.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Accès non autorisé'
      });
    }

    await deleteSession(req.params.id);

    res.json({
      success: true,
      message: 'Session supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur delete session:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la suppression de la session'
    });
  }
});

/**
 * POST /api/sessions/sync
 * Point d'entrée pour synchronisation depuis l'extension Chrome
 */
router.post('/sync', authenticate, async (req, res) => {
  try {
    const sessionData = req.body;

    // Si la session existe déjà, la mettre à jour
    if (sessionData.id) {
      const existingSession = await getSessionById(sessionData.id);
      
      if (existingSession && existingSession.userId === req.user.id) {
        const updatedSession = await updateSession(sessionData.id, sessionData);
        return res.json({
          success: true,
          data: { session: updatedSession },
          message: 'Session mise à jour'
        });
      }
    }

    // Sinon, créer une nouvelle session
    const newSession = await createSession({
      ...sessionData,
      id: sessionData.id || uuidv4(),
      userId: req.user.id
    });

    res.status(201).json({
      success: true,
      data: { session: newSession },
      message: 'Session créée'
    });
  } catch (error) {
    console.error('Erreur sync session:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la synchronisation'
    });
  }
});

export default router;
