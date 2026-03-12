import express from 'express';
import OpenAI from 'openai';
import { toFile } from 'openai';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * POST /api/transcribe
 * Transcrit un fichier audio en texte via OpenAI Whisper
 * Body: { audio: <base64>, mimeType: string, language?: string }
 * Response: { text: string }
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const { audio, mimeType, language } = req.body;

    if (!audio || typeof audio !== 'string') {
      return res.status(400).json({ error: 'Champ audio (base64) requis' });
    }
    if (!mimeType || typeof mimeType !== 'string') {
      return res.status(400).json({ error: 'Champ mimeType requis' });
    }

    // Decode base64 → Buffer → File-like object for OpenAI SDK
    const buffer = Buffer.from(audio, 'base64');

    // Derive a filename extension from the mimeType (e.g. audio/webm → audio.webm)
    const ext = mimeType.split('/')[1]?.split(';')[0] || 'webm';
    const file = await toFile(buffer, `audio.${ext}`, { type: mimeType });

    const transcription = await openai.audio.transcriptions.create({
      file,
      model: 'whisper-1',
      ...(language ? { language } : {})
    });

    res.json({ text: transcription.text });
  } catch (error) {
    console.error('Erreur transcription Whisper:', error);
    res.status(500).json({ error: 'Échec de la transcription audio' });
  }
});

export default router;
