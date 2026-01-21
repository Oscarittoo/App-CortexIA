/**
 * Service de transcription audio avec Whisper API (OpenAI)
 * Gère la transcription en temps réel avec streaming
 */

class TranscriptionService {
  constructor() {
    this.apiKey = import.meta.env?.VITE_OPENAI_API_KEY;
    this.apiUrl = 'https://api.openai.com/v1/audio/transcriptions';
    this.isRecording = false;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.onTranscriptCallback = null;
    this.language = 'fr';
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

      // Vérifier si l'API key est configurée
      if (!this.apiKey || this.apiKey === 'your_openai_api_key_here') {
        console.warn('⚠️ API OpenAI non configurée, utilisation de Web Speech API en fallback');
        return this.startWebSpeechAPI(stream, language, onTranscript);
      }

      // Créer MediaRecorder pour capturer l'audio
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];

      // Capturer les chunks audio
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      // Envoyer à Whisper toutes les 5 secondes
      this.mediaRecorder.onstop = async () => {
        if (this.audioChunks.length > 0 && this.isRecording) {
          await this.sendToWhisper();
          this.audioChunks = [];
          
          // Redémarrer pour continuer l'enregistrement
          if (this.isRecording && this.mediaRecorder.state !== 'recording') {
            this.mediaRecorder.start();
            setTimeout(() => {
              if (this.isRecording && this.mediaRecorder.state === 'recording') {
                this.mediaRecorder.stop();
              }
            }, 5000);
          }
        }
      };

      // Démarrer l'enregistrement par chunks de 5 secondes
      this.mediaRecorder.start();
      setTimeout(() => {
        if (this.isRecording && this.mediaRecorder.state === 'recording') {
          this.mediaRecorder.stop();
        }
      }, 5000);

      return stream;

    } catch (error) {
      console.error('❌ Erreur lors du démarrage de la transcription:', error);
      throw error;
    }
  }

  /**
   * Envoie l'audio à l'API Whisper
   */
  async sendToWhisper() {
    try {
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
      
      // Créer FormData pour l'API
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('model', 'whisper-1');
      formData.append('language', this.language === 'fr' ? 'fr' : 'en');
      formData.append('response_format', 'json');

      // Appeler l'API Whisper
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Erreur API Whisper: ${response.status}`);
      }

      const result = await response.json();
      
      // Callback avec le texte transcrit
      if (result.text && this.onTranscriptCallback) {
        this.onTranscriptCallback({
          text: result.text,
          timestamp: Date.now(),
          isFinal: true
        });
      }

    } catch (error) {
      console.error('❌ Erreur Whisper API:', error);
      // En cas d'erreur, continuer sans crash
    }
  }

  /**
   * Fallback vers Web Speech API si Whisper n'est pas disponible
   */
  startWebSpeechAPI(stream, language, onTranscript) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      throw new Error('Web Speech API non supportée dans ce navigateur');
    }

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

    return stream;
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
      }, 5000);
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
  }
}

// Singleton
const transcriptionService = new TranscriptionService();
export default transcriptionService;
