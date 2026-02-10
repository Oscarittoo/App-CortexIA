import express from 'express';
import dotenv from 'dotenv';
import { authenticate } from '../middleware/auth.js';
import { checkQuota, incrementQuota, requireFeature } from '../middleware/quotaCheck.js';

// S'assurer que .env est chargé avant de vérifier la variable
dotenv.config();

// Utiliser le mock si MOCK_OPENAI=true dans .env, sinon le vrai service
const USE_MOCK = process.env.MOCK_OPENAI === 'true';
console.log('🔍 AI Routes - MOCK_OPENAI env:', process.env.MOCK_OPENAI);
console.log('🔍 AI Routes -USE_MOCK:', USE_MOCK);
const aiService = USE_MOCK 
  ? await import('../services/aiService.mock.js')
  : await import('../services/aiService.js');
console.log('✅ AI Service loaded:', USE_MOCK ? 'MOCK' : 'REAL');

const router = express.Router();

/**
 * POST /api/ai/summary
 * Générer une synthèse cognitive de la réunion
 */
router.post('/summary', 
  authenticate, 
  requireFeature('ai_summary'),
  checkQuota('ai_meeting'),
  incrementQuota('ai_meeting'),
  async (req, res) => {
    try {
      const { transcript, sessionId } = req.body;

      if (!transcript) {
        return res.status(400).json({
          success: false,
          error: 'Transcription requise'
        });
      }

      const result = await aiService.generateSummary(transcript);

      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: result.error
        });
      }

      res.json({
        success: true,
        data: {
          summary: result.summary,
          sessionId,
          usage: result.usage,
          quotaRemaining: req.quotaStatus.remaining
        }
      });
    } catch (error) {
      console.error('Erreur summary:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la génération de la synthèse'
      });
    }
  }
);

/**
 * POST /api/ai/action-plan
 * Générer un plan d'action à partir de la transcription
 */
router.post('/action-plan', 
  authenticate, 
  requireFeature('ai_action_plan'),
  checkQuota('ai_meeting'),
  async (req, res) => {
    try {
      const { transcript, summary, sessionId } = req.body;

      if (!transcript) {
        return res.status(400).json({
          success: false,
          error: 'Transcription requise'
        });
      }

      const result = await aiService.generateActionPlan(transcript, summary);

      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: result.error
        });
      }

      res.json({
        success: true,
        data: {
          actions: result.actions,
          sessionId,
          usage: result.usage,
          quotaRemaining: req.quotaStatus.remaining
        }
      });
    } catch (error) {
      console.error('Erreur action-plan:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la génération du plan d\'action'
      });
    }
  }
);

/**
 * POST /api/ai/suggestion
 * Obtenir une suggestion en temps réel
 */
router.post('/suggestion', 
  authenticate, 
  requireFeature('ai_summary'),
  async (req, res) => {
    try {
      const { recentTranscript, context } = req.body;

      if (!recentTranscript) {
        return res.status(400).json({
          success: false,
          error: 'Transcription récente requise'
        });
      }

      const result = await aiService.getRealTimeSuggestion(recentTranscript, context);

      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: result.error
        });
      }

      res.json({
        success: true,
        data: {
          suggestion: result.suggestion,
          usage: result.usage
        }
      });
    } catch (error) {
      console.error('Erreur suggestion:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la génération de la suggestion'
      });
    }
  }
);

/**
 * POST /api/ai/enrich
 * Enrichir une transcription avec analyse sémantique
 */
router.post('/enrich', 
  authenticate, 
  requireFeature('semantic_search'),
  async (req, res) => {
    try {
      const { transcript } = req.body;

      if (!transcript) {
        return res.status(400).json({
          success: false,
          error: 'Transcription requise'
        });
      }

      const result = await aiService.enrichTranscription(transcript);

      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: result.error
        });
      }

      res.json({
        success: true,
        data: {
          enrichment: result.enrichment,
          usage: result.usage
        }
      });
    } catch (error) {
      console.error('Erreur enrich:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de l\'enrichissement'
      });
    }
  }
);

/**
 * POST /api/ai/analyze-batch
 * Analyse complète (summary + action plan + enrichment) en une seule requête
 */
router.post('/analyze-batch', 
  authenticate, 
  requireFeature('ai_summary'),
  checkQuota('ai_meeting'),
  incrementQuota('ai_meeting'),
  async (req, res) => {
    try {
      const { transcript, sessionId } = req.body;

      if (!transcript) {
        return res.status(400).json({
          success: false,
          error: 'Transcription requise'
        });
      }

      // Exécuter toutes les analyses en parallèle
      const [summaryResult, enrichResult] = await Promise.all([
        generateSummary(transcript),
        enrichTranscription(transcript)
      ]);

      // Générer le plan d'action avec la synthèse
      const actionPlanResult = summaryResult.success 
        ? await aiService.generateActionPlan(transcript, summaryResult.summary)
        : { success: false, error: 'Synthèse échouée' };

      res.json({
        success: true,
        data: {
          summary: summaryResult.success ? summaryResult.summary : null,
          actions: actionPlanResult.success ? actionPlanResult.actions : [],
          enrichment: enrichResult.success ? enrichResult.enrichment : null,
          sessionId,
          quotaRemaining: req.quotaStatus.remaining,
          totalUsage: {
            total_tokens: (summaryResult.usage?.total_tokens || 0) + 
                         (actionPlanResult.usage?.total_tokens || 0) +
                         (enrichResult.usage?.total_tokens || 0)
          }
        }
      });
    } catch (error) {
      console.error('Erreur analyze-batch:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de l\'analyse complète'
      });
    }
  }
);

export default router;
