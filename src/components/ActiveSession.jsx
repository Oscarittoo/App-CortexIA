import { useState, useEffect, useRef } from 'react';
import transcriptionService from '../services/transcriptionService';

export default function ActiveSession({ config, onEnd }) {
  const [transcript, setTranscript] = useState([]);
  const [duration, setDuration] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [micStatus, setMicStatus] = useState('Initialisation...');
  const [demoMode, setDemoMode] = useState(false);
  const mediaRecorderRef = useRef(null);
  const recognitionRef = useRef(null);
  const transcriptEndRef = useRef(null);
  const demoIntervalRef = useRef(null);

  useEffect(() => {
    startRecording();
    const timer = setInterval(() => {
      if (!isPaused) {
        setDuration(d => d + 1);
      }
    }, 1000);

    return () => {
      clearInterval(timer);
      stopRecording();
      if (demoIntervalRef.current) {
        clearInterval(demoIntervalRef.current);
      }
    };
  }, []);

  const startDemoMode = () => {
    setDemoMode(true);
    setMicStatus('🎭 MODE DÉMO - Transcription simulée pour tests');
    
    const demoTexts = [
      "Bonjour à tous, bienvenue dans cette réunion",
      "Aujourd'hui nous allons discuter du projet CORTEXIA",
      "Il faut terminer l'architecture technique d'ici vendredi",
      "Nous avons décidé de valider l'approche proposée",
      "L'équipe de développement va commencer les tests",
      "Le planning est confirmé pour la semaine prochaine",
      "Il est important de finaliser la documentation",
      "Nous devons organiser une démonstration client",
      "Les prochaines étapes sont clairement définies",
      "Merci pour votre participation à cette session"
    ];
    
    let index = 0;
    demoIntervalRef.current = setInterval(() => {
      if (!isPaused && index < demoTexts.length) {
        setTranscript(prev => [...prev, {
          id: Date.now(),
          timestamp: Date.now(),
          text: demoTexts[index],
          speaker: 'Participant',
          isFinal: true
        }]);
        setMicStatus(`🎭 MODE DÉMO - ${index + 1}/${demoTexts.length} segments générés`);
        index++;
      } else if (index >= demoTexts.length) {
        clearInterval(demoIntervalRef.current);
        setMicStatus('🎭 MODE DÉMO - Tous les segments générés');
      }
    }, 3000); // Un segment toutes les 3 secondes
  };

  useEffect(() => {
    // Auto-scroll vers le bas
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  const startRecording = async () => {
    try {
      setMicStatus('🎤 Demande accès microphone...');
      
      // Vérifier si une clé API Whisper est disponible
      const hasWhisperKey = import.meta.env.VITE_OPENAI_API_KEY;
      
      if (hasWhisperKey) {
        // Utiliser Whisper API
        setMicStatus('🚀 Initialisation Whisper API...');
        
        await transcriptionService.startTranscription(
          config.language,
          (transcriptText) => {
            setTranscript(prev => [...prev, {
              id: Date.now(),
              timestamp: Date.now(),
              text: transcriptText,
              speaker: 'Participant',
              isFinal: true
            }]);
          }
        );
        
        setMicStatus('✅ Whisper API actif - Transcription professionnelle');
        setIsRecording(true);
        return;
      }
      
      // Sinon utiliser Web Speech API
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      setMicStatus('✅ Microphone connecté');
      mediaRecorderRef.current = new MediaRecorder(stream);

      // Web Speech API
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = config.language === 'fr' ? 'fr-FR' : 'en-US';

        recognition.onstart = () => {
          setMicStatus('🎤 Écoute en cours... Parlez maintenant !');
          console.log('Recognition started');
        };

        recognition.onresult = (event) => {
          const last = event.results.length - 1;
          const text = event.results[last][0].transcript;
          const isFinal = event.results[last].isFinal;

          console.log('Transcription:', text, 'Final:', isFinal);

          if (isFinal) {
            setMicStatus('✅ Transcription active');
            setTranscript(prev => [...prev, {
              id: Date.now(),
              timestamp: Date.now(),
              text: text.trim(),
              speaker: 'Participant',
              isFinal: true
            }]);
          } else {
            setMicStatus('🎤 En cours : ' + text.substring(0, 30) + '...');
          }
        };

        recognition.onerror = (event) => {
          console.error('Erreur reconnaissance:', event.error);
          if (event.error === 'no-speech') {
            setMicStatus('⚠️ Aucune voix détectée - parlez plus fort');
            recognition.start();
          } else if (event.error === 'not-allowed') {
            setMicStatus('❌ Permission microphone refusée');
            alert('❌ Accès au microphone refusé. Autorisez le microphone dans les paramètres.');
          } else if (event.error === 'network') {
            setMicStatus('🔄 Mode démo activé - Simulation de transcription');
            console.log('Web Speech API indisponible, passage en mode démo');
            // Activer le mode simulation
            startDemoMode();
          } else {
            setMicStatus('⚠️ Erreur: ' + event.error);
          }
        };

        recognition.onend = () => {
          console.log('Recognition ended, restarting...');
          if (isRecording && !isPaused) {
            recognition.start();
          }
        };

        recognition.start();
        recognitionRef.current = recognition;
        setMicStatus('🎤 Prêt - Commencez à parler');
      } else {
        setMicStatus('❌ Web Speech API non supporté');
        alert('❌ Votre navigateur ne supporte pas la reconnaissance vocale');
      }

      setIsRecording(true);
    } catch (error) {
      console.error('Erreur capture audio:', error);
      setMicStatus('❌ Erreur microphone');
      alert('❌ Impossible d\'accéder au microphone : ' + error.message);
    }
  };

  const stopRecording = () => {
    // Arrêter Whisper ou Web Speech
    if (transcriptionService.isRecording) {
      transcriptionService.stop();
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (demoIntervalRef.current) {
      clearInterval(demoIntervalRef.current);
    }
    setIsRecording(false);
  };

  const handlePauseResume = () => {
    if (isPaused) {
      if (recognitionRef.current && !demoMode) {
        recognitionRef.current.start();
      }
      if (demoMode && demoIntervalRef.current) {
        // Le mode démo continue automatiquement
      }
      setTranscript(prev => [...prev, {
        id: Date.now(),
        timestamp: Date.now(),
        text: '▶ Session reprise',
        speaker: 'Système',
        isSystem: true
      }]);
    } else {
      if (recognitionRef.current && !demoMode) {
        recognitionRef.current.stop();
      }
      setTranscript(prev => [...prev, {
        id: Date.now(),
        timestamp: Date.now(),
        text: '⏸ Session en pause',
        speaker: 'Système',
        isSystem: true
      }]);
    }
    setIsPaused(!isPaused);
  };

  const handleStop = () => {
    if (confirm('🛑 Voulez-vous vraiment terminer cette session ?')) {
      stopRecording();
      onEnd(transcript, duration);
    }
  };

  const handleMarkMoment = () => {
    const note = prompt('📌 Note pour ce moment important :');
    if (note) {
      setTranscript(prev => [...prev, {
        id: Date.now(),
        timestamp: Date.now(),
        text: `📌 ${note}`,
        speaker: 'Système',
        marked: true
      }]);
    }
  };

  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="screen active-session">
      <div className="session-header">
        <div className="session-info">
          <h2>{config.title}</h2>
          <div className="recording-indicator">
            {!isPaused && <span className="red-dot"></span>}
            {isPaused ? '⏸️ En pause' : '🔴 Enregistrement en cours'} • {formatDuration(duration)}
          </div>
          <div className="mic-status" style={{ fontSize: '14px', marginTop: '8px', opacity: 0.8 }}>
            {micStatus}
          </div>
        </div>
      </div>

      <div className="transcript-container">
        <div className="transcript-stats">
          {transcript.filter(t => t.isFinal).length} segments • 
          📌 {transcript.filter(t => t.marked).length} moments marqués
        </div>
        
        {transcript.length === 0 && (
          <div className="transcript-empty">
            <p>🎤 En attente de parole...</p>
            <small>Commencez à parler pour voir la transcription apparaître</small>
            <br />
            <small style={{ marginTop: '10px', display: 'block', color: '#666' }}>
              Statut: {micStatus}
            </small>
          </div>
        )}

        {transcript.map((item) => (
          <div 
            key={item.id} 
            className={`transcript-line ${item.marked ? 'marked' : ''} ${item.isSystem ? 'system' : ''}`}
          >
            <span className="timestamp">
              {new Date(item.timestamp).toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit'
              })}
            </span>
            <span className="speaker">{item.speaker}:</span>
            <span className="text">{item.text}</span>
          </div>
        ))}
        <div ref={transcriptEndRef} />
      </div>

      <div className="session-controls">
        <button 
          onClick={handlePauseResume} 
          className={`btn-secondary ${isPaused ? 'btn-resume' : ''}`}
        >
          {isPaused ? '▶️ Reprendre' : '⏸️ Pause'}
        </button>
        
        <button onClick={handleMarkMoment} className="btn-secondary">
          📌 Marquer ce moment
        </button>
        
        <button onClick={handleStop} className="btn-danger">
          ⏹️ Terminer la session
        </button>
      </div>
    </div>
  );
}
