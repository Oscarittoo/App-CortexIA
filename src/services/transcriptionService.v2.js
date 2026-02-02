class TranscriptionService {
  constructor() {
    this.isRecording = false;
    this.mediaRecorder = null;
    this.recognition = null;
    this.stream = null;
    this.audioChunks = [];
  }

  async startTranscription(language = 'fr', onTranscript) {
    if (this.isRecording) {
      console.warn('Transcription already in progress');
      return null;
    }

    this.isRecording = true;
    console.log('Starting transcription with Web Speech API');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        }
      });

      this.stream = stream;
      console.log('Microphone access granted');

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        throw new Error('Web Speech API not supported');
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.lang = language === 'fr' ? 'fr-FR' : 'en-US';

      let restartCount = 0;
      const maxRestarts = 50;
      let lastTranscriptTime = Date.now();

      recognition.onstart = () => {
        console.log('✓ Recognition started');
      };

      recognition.onaudiostart = () => {
        console.log('✓ Audio capture active');
      };

      recognition.onsoundstart = () => {
        console.log('✓ Sound detected');
      };

      recognition.onspeechstart = () => {
        console.log('✓ Speech detected');
        lastTranscriptTime = Date.now();
      };

      recognition.onresult = (event) => {
        console.log(`✓ Result received (${event.results.length} results)`);
        lastTranscriptTime = Date.now();
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          let text = result[0].transcript;
          text = text.trim().replace(/\.0$/, '');
          const isFinal = result.isFinal;
          const confidence = result[0].confidence || 1;
          
          console.log(`${isFinal ? '█' : '▒'} "${text.substring(0, 50)}..." (${(confidence * 100).toFixed(1)}%)`);
          
          onTranscript({
            text,
            timestamp: Date.now(),
            isFinal,
            confidence
          });
        }
      };

      recognition.onspeechend = () => {
        console.log('Speech ended');
      };

      recognition.onsoundend = () => {
        console.log('Sound ended');
      };

      recognition.onaudioend = () => {
        console.log('Audio capture ended');
      };

      recognition.onerror = (event) => {
        console.error(`✗ Error: ${event.error}`, event.message || '');
        
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          console.error('Microphone permission denied');
          this.isRecording = false;
        } else if (event.error === 'audio-capture') {
          console.error('Failed to capture audio');
        } else if (event.error === 'network') {
          console.error('Network error - Web Speech API requires internet connection');
        } else if (event.error === 'no-speech') {
          console.log('No speech detected, continuing...');
        } else if (event.error === 'aborted') {
          console.log('Recognition aborted');
        }
      };

      recognition.onend = () => {
        const timeSinceLastTranscript = Date.now() - lastTranscriptTime;
        console.log(`Recognition ended (${timeSinceLastTranscript}ms since last transcript)`);
        
        if (this.isRecording && restartCount < maxRestarts) {
          restartCount++;
          console.log(`↻ Restart ${restartCount}/${maxRestarts}`);
          
          setTimeout(() => {
            if (this.isRecording) {
              try {
                recognition.start();
              } catch (e) {
                if (e.name !== 'InvalidStateError') {
                  console.error('Failed to restart:', e);
                }
              }
            }
          }, 100);
        }
      };

      this.recognition = recognition;
      
      console.log('Starting recognition...');
      recognition.start();
      
      return stream;
    } catch (error) {
      console.error('Failed to start transcription:', error);
      this.isRecording = false;
      throw error;
    }
  }

  stopTranscription() {
    console.log('Stopping transcription...');
    this.isRecording = false;

    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.log('Recognition already stopped');
      }
      this.recognition = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
      console.log('Microphone released');
    }
  }

  pause() {
    this.isRecording = false;
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  resume() {
    this.isRecording = true;
    if (this.recognition) {
      try {
        this.recognition.start();
      } catch (e) {
        console.error('Failed to resume:', e);
      }
    }
  }
}

const transcriptionService = new TranscriptionService();
export default transcriptionService;
