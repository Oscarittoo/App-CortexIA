import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Pause, Play, Square, AlertCircle } from 'lucide-react';
import toast from './Toast';

export default function ActiveSessionV2({ config, onEnd }) {
  const [transcript, setTranscript] = useState([]);
  const [duration, setDuration] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [micStatus, setMicStatus] = useState('Initializing...');
  const [hasAudio, setHasAudio] = useState(false);
  const transcriptEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const streamRef = useRef(null);
  const durationTimerRef = useRef(null);

  useEffect(() => {
    startRecording();
    
    return () => {
      stopRecording();
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  const startRecording = async () => {
    try {
      console.log('Starting recording with Web Speech API...');
      setMicStatus('Requesting microphone access...');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        }
      });

      streamRef.current = stream;
      setMicStatus('Microphone access granted');
      toast.success('Microphone access granted');
      console.log('Microphone access granted');

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        throw new Error('Web Speech API not supported in this browser');
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.lang = config.language === 'fr' ? 'fr-FR' : 'en-US';

      let restartCount = 0;
      const maxRestarts = 50;
      let lastTranscriptTime = Date.now();

      recognition.onstart = () => {
        console.log('Recognition started successfully');
        setMicStatus('Listening... Speak now');
        setIsRecording(true);
        setHasAudio(true);
        
        durationTimerRef.current = setInterval(() => {
          if (!isPaused) {
            setDuration(d => d + 1);
          }
        }, 1000);
      };

      recognition.onaudiostart = () => {
        console.log('Audio capture active');
      };

      recognition.onsoundstart = () => {
        console.log('Sound detected');
        setHasAudio(true);
      };

      recognition.onspeechstart = () => {
        console.log('Speech detected');
        setMicStatus('Recording speech...');
        lastTranscriptTime = Date.now();
      };

      recognition.onresult = (event) => {
        console.log(`Result received (${event.results.length} results)`);
        lastTranscriptTime = Date.now();
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const text = result[0].transcript;
          const isFinal = result.isFinal;
          const confidence = result[0].confidence || 1;
          
          console.log(`${isFinal ? 'FINAL' : 'interim'}: "${text.substring(0, 50)}..." (${(confidence * 100).toFixed(1)}%)`);
          
          if (isFinal) {
            setTranscript(prev => [
              ...prev,
              {
                text,
                timestamp: Date.now(),
                isFinal: true,
                confidence
              }
            ]);
          }
        }
      };

      recognition.onspeechend = () => {
        console.log('Speech ended');
        setMicStatus('Listening... Speak now');
      };

      recognition.onerror = (event) => {
        console.error(`Recognition error: ${event.error}`, event.message || '');
        
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setMicStatus('Microphone permission denied');
          toast.error('Microphone permission denied');
          setIsRecording(false);
        } else if (event.error === 'audio-capture') {
          setMicStatus('Failed to capture audio');
          toast.error('Failed to capture audio');
        } else if (event.error === 'network') {
          setMicStatus('Network error - requires internet');
          toast.warning('Web Speech API requires internet connection');
        } else if (event.error === 'no-speech') {
          console.log('No speech detected, continuing...');
        }
      };

      recognition.onend = () => {
        const timeSinceLastTranscript = Date.now() - lastTranscriptTime;
        console.log(`Recognition ended (${timeSinceLastTranscript}ms since last transcript)`);
        setMicStatus('Recognition ended, restarting...');
        
        if (isRecording && !isPaused && restartCount < maxRestarts) {
          restartCount++;
          console.log(`Restart ${restartCount}/${maxRestarts}`);
          
          setTimeout(() => {
            if (isRecording && !isPaused) {
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

      recognitionRef.current = recognition;
      
      console.log('Starting recognition...');
      recognition.start();
      
    } catch (error) {
      console.error('Failed to start recording:', error);
      setMicStatus(`Error: ${error.message}`);
      toast.error(`Failed to start recording: ${error.message}`);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    console.log('Stopping recording...');
    setIsRecording(false);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.log('Recognition already stopped');
      }
      recognitionRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      console.log('Microphone released');
    }

    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
    }
  };

  const handlePauseResume = () => {
    if (isPaused) {
      setIsPaused(false);
      setMicStatus('Recording resumed');
      toast.info('Recording resumed');
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.error('Failed to resume:', e);
        }
      }
    } else {
      setIsPaused(true);
      setMicStatus('Recording paused');
      toast.info('Recording paused');
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }
  };

  const handleEnd = () => {
    stopRecording();
    toast.success('Session ended successfully');
    
    onEnd({
      title: config.title,
      transcript: transcript.filter(t => t.isFinal),
      duration,
      language: config.language,
      tags: config.tags || [],
      participants: config.participants || [],
      createdAt: Date.now()
    });
  };

  const formatDuration = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="active-session">
      <div className="session-header card">
        <div className="session-info">
          <h2>{config.title}</h2>
          <div className="session-meta">
            <span className="duration">{formatDuration(duration)}</span>
            <span className="separator">·</span>
            <span className="language">{config.language === 'fr' ? 'French' : 'English'}</span>
            {config.tags && config.tags.length > 0 && (
              <>
                <span className="separator">·</span>
                <div className="tags-inline">
                  {config.tags.map(tag => (
                    <span key={tag} className="badge badge-neutral">{tag}</span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
        
        <div className="session-controls">
          <button
            className={`btn ${isPaused ? 'btn-primary' : 'btn-secondary'}`}
            onClick={handlePauseResume}
            disabled={!isRecording}
          >
            {isPaused ? <Play size={18} /> : <Pause size={18} />}
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          
          <button
            className="btn btn-danger"
            onClick={handleEnd}
          >
            <Square size={18} />
            End Session
          </button>
        </div>
      </div>

      <div className="session-status card">
        <div className="status-indicator">
          {isRecording && !isPaused ? (
            <div className="recording-indicator">
              <Mic size={20} className="recording-icon" />
              <span className="recording-pulse"></span>
            </div>
          ) : (
            <MicOff size={20} className="text-secondary" />
          )}
        </div>
        <div className="status-text">
          <div className="status-label">{micStatus}</div>
          <div className="status-detail">
            {isRecording && !isPaused && (
              <span className="text-success">Recording active</span>
            )}
            {isPaused && <span className="text-warning">Paused</span>}
            {!isRecording && <span className="text-tertiary">Not recording</span>}
          </div>
        </div>
        {!hasAudio && isRecording && (
          <div className="status-warning">
            <AlertCircle size={16} />
            <span>No audio detected yet. Please speak louder or check your microphone.</span>
          </div>
        )}
      </div>

      <div className="transcript-container card">
        <div className="card-header">
          <h3>Live Transcript</h3>
          <span className="transcript-count">{transcript.filter(t => t.isFinal).length} segments</span>
        </div>
        <div className="card-body transcript-content">
          {transcript.length === 0 ? (
            <div className="transcript-empty">
              <Mic size={48} className="text-tertiary" />
              <p>Waiting for speech...</p>
              <p className="text-sm text-tertiary">Speak into your microphone to start transcribing</p>
            </div>
          ) : (
            <div className="transcript-list">
              {transcript.filter(t => t.isFinal).map((item, index) => (
                <div key={index} className="transcript-item">
                  <div className="transcript-text">{typeof item.text === 'string' ? item.text.trim().replace(/\.0$/, '') : item.text}</div>
                  <div className="transcript-meta">
                    {new Date(item.timestamp).toLocaleTimeString()}
                    {item.confidence && (
                      <span className="confidence">
                        {(item.confidence * 100).toFixed(0)}% confidence
                      </span>
                    )}
                  </div>
                </div>
              ))}
              <div ref={transcriptEndRef} />
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .active-session {
          max-width: 1200px;
          margin: 0 auto;
          padding: var(--space-8);
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
        }

        .session-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-6);
        }

        .session-info h2 {
          margin-bottom: var(--space-2);
        }

        .session-meta {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          flex-wrap: wrap;
          color: var(--color-text-secondary);
          font-size: var(--font-size-sm);
        }

        .duration {
          font-weight: var(--font-weight-semibold);
          color: var(--color-primary);
        }

        .tags-inline {
          display: flex;
          gap: var(--space-1);
          flex-wrap: wrap;
        }

        .session-controls {
          display: flex;
          gap: var(--space-3);
        }

        .session-status {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          padding: var(--space-4);
        }

        .status-indicator {
          position: relative;
        }

        .recording-indicator {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .recording-icon {
          color: var(--color-error);
          z-index: 1;
        }

        .recording-pulse {
          position: absolute;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: var(--color-error);
          opacity: 0.3;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(0.8);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.1;
          }
        }

        .status-text {
          flex: 1;
        }

        .status-label {
          font-weight: var(--font-weight-medium);
          color: var(--color-text-primary);
          margin-bottom: var(--space-1);
        }

        .status-detail {
          font-size: var(--font-size-sm);
        }

        .status-warning {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-3);
          background-color: var(--color-warning-light);
          color: var(--color-warning);
          border-radius: var(--radius-md);
          font-size: var(--font-size-sm);
        }

        .transcript-container {
          flex: 1;
          min-height: 400px;
          display: flex;
          flex-direction: column;
        }

        .transcript-count {
          font-size: var(--font-size-sm);
          color: var(--color-text-tertiary);
        }

        .transcript-content {
          flex: 1;
          overflow-y: auto;
        }

        .transcript-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-align: center;
          padding: var(--space-16);
        }

        .transcript-empty p {
          margin: var(--space-2) 0 0 0;
        }

        .transcript-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .transcript-item {
          padding: var(--space-4);
          background-color: var(--color-bg-secondary);
          border-radius: var(--radius-md);
          border-left: 3px solid var(--color-primary);
        }

        .transcript-text {
          color: var(--color-text-primary);
          line-height: var(--line-height-relaxed);
          margin-bottom: var(--space-2);
        }

        .transcript-meta {
          display: flex;
          gap: var(--space-3);
          font-size: var(--font-size-xs);
          color: var(--color-text-tertiary);
        }

        .confidence {
          padding: 2px 6px;
          background-color: var(--color-bg-tertiary);
          border-radius: var(--radius-sm);
        }
      `}</style>
    </div>
  );
}
