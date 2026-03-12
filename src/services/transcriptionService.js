/**
 * Service de transcription audio avec Whisper API (OpenAI)
 * Gère la transcription en temps réel avec streaming
 */

import { supabase } from './supabaseClient';

class TranscriptionService {
  constructor() {
    this.backendUrl = import.meta.env?.VITE_BACKEND_URL || 'https://meetizy-backend.onrender.com';
    this.isRecording = false;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.onTranscriptCallback = null;
    this.language = 'fr';
    this.hasWhisperFailed = false; // Flag pour éviter de réessayer Whisper
  }

  /**
   * Initialise la capture audio et démarre la transcription
   */
  async startTranscription(language = 'fr', onTranscript) {
    this.language = language;
    this.onTranscriptCallback = onTranscript;
    this.isRecording = true;

    try {
      // Demander permission microphone
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      this.stream = stream;

      // Utiliser Web Speech API par défaut (gratuit et fiable)
      console.log('Utilisation de Web Speech API (mode gratuit)');
      return this.startWebSpeechAPI(stream, language, onTranscript);
      
      // Code Whisper désactivé pour privilégier Web Speech API
      // Pour réactiver Whisper, décommentez le code ci-dessous
      /*
      if (this.hasWhisperFailed || !this.apiKey || this.apiKey === '' || this.apiKey === 'your_openai_api_key_here') {
        const reason = this.hasWhisperFailed ? 'quota dépassé' : 'non configurée';
        console.warn(`API OpenAI ${reason}, utilisation de Web Speech API en fallback`);
        console.log('Clé API actuelle:', this.apiKey ? '(présente)' : '(non définie)');
        return this.startWebSpeechAPI(stream, language, onTranscript);
      }
      
      console.log('API OpenAI configurée, utilisation de Whisper');
      console.log('Clé API (début):', this.apiKey ? this.apiKey.substring(0, 20) + '...' : 'non trouvée');
      */

      // MediaRecorder non utilisé en mode Web Speech API
      // (Garder pour compatibilité future si Whisper est réactivé)
      
      /*
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      // Code Whisper commenté (non utilisé)
      */

      return stream;

    } catch (error) {
      console.error('Erreur lors du démarrage de la transcription:', error);
      throw error;
    }
  }

  /**
   * Envoie l'audio au backend qui appelle Whisper
   */
  async sendToWhisper() {
    try {
      const mimeType = 'audio/webm';
      const audioBlob = new Blob(this.audioChunks, { type: mimeType });
      
      // Vérifier que l'audio a une taille suffisante (au moins 1KB)
      if (audioBlob.size < 1000) {
        console.log('Audio trop court, ignoré');
        return;
      }
      
      console.log('Envoi à Whisper via backend:', audioBlob.size, 'bytes');
      
      // Convertir le blob en base64
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

      // Récupérer le token JWT Supabase
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error('Utilisateur non authentifié');

      // Appeler le backend
      const response = await fetch(`${this.backendUrl}/api/transcribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          audio: base64,
          mimeType,
          language: this.language
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erreur transcription backend:', response.status, errorText);
        if (response.status === 429) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        throw new Error(`Erreur transcription: ${response.status}`);
      }

      const result = await response.json();
      console.log('Transcription reçue:', result.text);
      
      // Callback avec le texte transcrit
      if (result.text && this.onTranscriptCallback) {
        this.onTranscriptCallback({
          text: result.text,
          timestamp: Date.now(),
          isFinal: true
        });
      }

    } catch (error) {
      console.error('Erreur transcription:', error);
      if (error.message && (error.message.includes('429') || error.message.includes('quota'))) {
        console.warn('Quota dépassé, marquage pour basculement...');
        this.hasWhisperFailed = true;
      }
    }
  }

  /**
   * Fallback vers Web Speech API si Whisper n'est pas disponible
   */
  async startWebSpeechAPI(existingStream, language, onTranscript) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      throw new Error('Web Speech API non supportée dans ce navigateur');
    }

    // Si pas de stream existant, en créer un nouveau
    if (!existingStream) {
      try {
        existingStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
        // Stocker le stream pour pouvoir l'arrêter plus tard
        this.stream = existingStream;
      } catch (error) {
        console.error('Erreur accès microphone pour Web Speech:', error);
        throw error;
      }
    }

    // Toujours conserver la référence si un stream est déjà fourni
    this.stream = existingStream;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language === 'fr' ? 'fr-FR' : 'en-US';

    recognition.onresult = (event) => {
      const last = event.results.length - 1;
      const text = event.results[last][0].transcript;
      const isFinal = event.results[last].isFinal;

      onTranscript({
        text: text,
        timestamp: Date.now(),
        isFinal: isFinal
      });
    };

    recognition.onerror = (event) => {
      console.error('Erreur Web Speech API:', event.error);
      if (event.error === 'no-speech') {
        recognition.start(); // Redémarrer
      }
    };

    recognition.onend = () => {
      if (this.isRecording) {
        recognition.start(); // Redémarrer pour transcription continue
      }
    };

    recognition.start();
    
    // Stocker la référence
    this.recognition = recognition;

    return existingStream;
  }

  /**
   * Met en pause la transcription
   */
  pause() {
    this.isRecording = false;
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
    }
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  /**
   * Reprend la transcription
   */
  resume() {
    this.isRecording = true;
    if (this.mediaRecorder && this.mediaRecorder.state !== 'recording') {
      this.mediaRecorder.start();
      setTimeout(() => {
        if (this.isRecording && this.mediaRecorder.state === 'recording') {
          this.mediaRecorder.stop();
        }
      }, 10000); // 10 secondes
    }
    if (this.recognition) {
      this.recognition.start();
    }
  }

  /**
   * Arrête la transcription
   */
  stop() {
    this.isRecording = false;
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
    if (this.recognition) {
      this.recognition.stop();
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
  }
}

// Singleton
const transcriptionService = new TranscriptionService();
export default transcriptionService;
