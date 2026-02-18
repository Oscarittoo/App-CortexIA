import { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Pause, 
  Play, 
  Square, 
  AlertCircle, 
  CheckCircle, 
  AlertTriangle,
  BrainCircuit,
  Bookmark,
  Activity,
  Info
} from 'lucide-react';

export default function ActiveSession({ config, onEnd }) {
  const [transcript, setTranscript] = useState([]);
  const [duration, setDuration] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [micStatus, setMicStatus] = useState('Initialisation...');
  const [audioDetected, setAudioDetected] = useState(false);
  const [speechDetected, setSpeechDetected] = useState(false);
  const [detectedActions, setDetectedActions] = useState([]);
  const [detectedDecisions, setDetectedDecisions] = useState([]);
  const recognitionRef = useRef(null);
  const transcriptEndRef = useRef(null);
  const restartCountRef = useRef(0);
  const isPausedRef = useRef(false);
  const durationRef = useRef(0);

  useEffect(() => {
    startRecording();
    const timer = setInterval(() => {
      if (!isPausedRef.current) {
        durationRef.current += 1;
        setDuration(durationRef.current);
      }
    }, 1000);

    return () => {
      clearInterval(timer);
      stopRecording();
    };
  }, []);

  // Synchroniser le ref avec le state
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    // Auto-scroll vers le bas
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  const startRecording = async () => {
    try {
      console.log('=== DÉBUT INITIALISATION TRANSCRIPTION ===');
      console.log('Configuration:', config);
      setMicStatus('Initialisation Web Speech API...');

      // Vérifier support Web Speech API
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        throw new Error('Web Speech API non supportée par ce navigateur');
      }

      console.log('Web Speech API supportée');

      // Créer l'instance de reconnaissance
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = config.language === 'fr' ? 'fr-FR' : 'en-US';
      recognition.maxAlternatives = 1;

      console.log('Configuration reconnaissance:', {
        continuous: recognition.continuous,
        interimResults: recognition.interimResults,
        lang: recognition.lang
      });

      // === EVENT HANDLERS AVEC LOGS DÉTAILLÉS ===

      recognition.onstart = () => {
        console.log('[onstart] Recognition started successfully');
        setMicStatus('Écoute active - Parlez maintenant');
        setIsRecording(true);
      };

      recognition.onaudiostart = () => {
        console.log('[onaudiostart] Audio capture active');
        setAudioDetected(true);
      };

      recognition.onsoundstart = () => {
        console.log('[onsoundstart] Sound detected');
      };

      recognition.onspeechstart = () => {
        console.log('[onspeechstart] Speech detected');
        setSpeechDetected(true);
        setMicStatus('Parole détectée...');
      };

      recognition.onresult = (event) => {
        console.log('[onresult] Result received, results count:', event.results.length);
        
        const last = event.results.length - 1;
        const result = event.results[last];
        let text = result[0].transcript;
        const confidence = result[0].confidence;
        const isFinal = result.isFinal;

        // Log du texte brut pour debug
        console.log('Texte brut:', JSON.stringify(text));
        
        // Nettoyage robuste : supprime les patterns .0, 0 en fin, espaces+0, etc.
        text = text.trim()
          .replace(/\.0+\s*$/g, '')      // .0 ou .00 etc en fin
          .replace(/\s+0+\s*$/g, '')      // espace suivi de 0 en fin
          .replace(/\.0+(\s+|$)/g, '$1') // .0 suivi d'espace ou fin
          // Filtrer les mots parasites (hésitations)
          .replace(/\b(euh+|heu+|hmm+|hum+|ben|bah|bon|voilà|quoi|hein|genre|truc)\b/gi, '')
          // Nettoyer début de phrase avec connecteurs faibles
          .replace(/^(donc|alors|du coup|en fait|bon|bah|ben|ensuite)\s+/gi, '')
          // Supprimer répétitions de mots consécutifs (ex: "peut peut" → "peut")
          .replace(/\b(\w+)\s+\1\b/gi, '$1')
          // Nettoyer espaces multiples
          .replace(/\s+/g, ' ')
          .trim();

        console.log('Transcription:', {
          text,
          confidence: confidence ? (confidence * 100).toFixed(1) + '%' : 'N/A',
          isFinal,
          resultIndex: last
        });

        if (isFinal) {
          console.log('Résultat final ajouté à la transcription');
          setMicStatus('Transcription active');
          
          // Nettoyage final du texte avant ajout
          const cleanedText = text.trim()
            .replace(/\.0+\s*$/g, '')
            .replace(/\s+0+\s*$/g, '')
            .replace(/\.0+(\s+|$)/g, '$1')
            // Nettoyer encore les mots parasites qui auraient pu passer
            .replace(/\b(euh+|heu+|hmm+|hum+)\b/gi, '')
            // Nettoyer espaces multiples créés par les suppressions
            .replace(/\s{2,}/g, ' ')
            .trim();
          
          const newEntry = {
            id: Date.now(),
            timestamp: Date.now(),
            text: cleanedText,
            speaker: 'Participant',
            confidence: confidence,
            isFinal: true
          };
          
          setTranscript(prev => [...prev, newEntry]);
          
          // Analyse IA en temps réel
          analyzeTextForActionsAndDecisions(cleanedText);
        } else {
          const preview = text.length > 40 ? text.substring(0, 40) + '...' : text;
          setMicStatus(`Transcription: ${preview}`);
        }
      };

      recognition.onspeechend = () => {
        console.log('[onspeechend] Speech ended');
        setSpeechDetected(false);
      };

      recognition.onsoundend = () => {
        console.log('[onsoundend] Sound ended');
      };

      recognition.onaudioend = () => {
        console.log('[onaudioend] Audio capture ended');
        setAudioDetected(false);
      };

      recognition.onerror = (event) => {
        console.error('[onerror] Error occurred:', event.error);
        console.error('Error details:', {
          error: event.error,
          message: event.message || 'No message'
        });

        let errorMessage = '';
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'Aucune parole détectée - parlez plus fort';
            console.warn('Conseil: Assurez-vous que le microphone fonctionne et que vous parlez clairement');
            break;
          case 'audio-capture':
            errorMessage = 'Impossible de capturer l\'audio';
            console.error('Le microphone est peut-être utilisé par une autre application');
            break;
          case 'not-allowed':
            errorMessage = 'Permission microphone refusée';
            console.error('Autorisez l\'accès au microphone dans les paramètres du navigateur');
            alert('Accès au microphone refusé. Veuillez autoriser l\'accès dans les paramètres de votre navigateur.');
            break;
          case 'network':
            errorMessage = 'Erreur réseau';
            console.error('Vérifiez votre connexion internet');
            break;
          case 'aborted':
            errorMessage = 'Reconnaissance interrompue';
            break;
          default:
            errorMessage = `Erreur: ${event.error}`;
        }
        
        setMicStatus(errorMessage);
      };

      recognition.onend = () => {
        console.log('[onend] Recognition ended');
        
        if (isRecording && !isPaused && restartCountRef.current < 50) {
          console.log(`Auto-restart (tentative ${restartCountRef.current + 1}/50)`);
          restartCountRef.current += 1;
          
          setTimeout(() => {
            try {
              recognition.start();
              console.log('Recognition restarted');
            } catch (error) {
              console.error('Restart failed:', error);
              setMicStatus('Erreur redémarrage reconnaissance');
            }
          }, 100);
        } else if (restartCountRef.current >= 50) {
          console.warn('Limite de redémarrage atteinte (50)');
          setMicStatus('Limite de redémarrage atteinte');
        }
      };

      // Démarrer la reconnaissance
      console.log('Tentative de démarrage...');
      recognitionRef.current = recognition;
      recognition.start();
      
      console.log('=== INITIALISATION TERMINÉE ===');
      setMicStatus('Démarrage en cours...');

    } catch (error) {
      console.error('ERREUR FATALE:', error);
      console.error('Stack trace:', error.stack);
      setMicStatus('Erreur: ' + error.message);
      alert('Erreur d\'initialisation: ' + error.message);
    }
  };

  const stopRecording = () => {
    console.log('Arrêt de la reconnaissance');
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);
    setAudioDetected(false);
    setSpeechDetected(false);
  };

  const handlePauseResume = () => {
    if (isPaused) {
      console.log('Reprise de la session');
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
      setTranscript(prev => [...prev, {
        id: Date.now(),
        timestamp: Date.now(),
        text: 'Session reprise',
        speaker: 'Système',
        isSystem: true
      }]);
    } else {
      console.log('Pause de la session');
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setTranscript(prev => [...prev, {
        id: Date.now(),
        timestamp: Date.now(),
        text: 'Session en pause',
        speaker: 'Système',
        isSystem: true
      }]);
    }
    setIsPaused(!isPaused);
  };

  // Analyse IA en temps réel des actions et décisions
  const analyzeTextForActionsAndDecisions = (text) => {
    const lowerText = text.toLowerCase();
    
    // Mots-clés pour actions - UNIQUEMENT si le verbe "faire" est présent
    const actionKeywords = [
      'faire', 'fais', 'faut', 'il faut', 'faudra', 'faudrait', 'falloir'
    ];
    
    // Mots-clés pour décisions
    const decisionKeywords = [
      'décidons', 'décidé', 'décision', 'on part sur', 'on choisit',
      'on valide', 'validé', 'approuvé', 'refusé', 'rejeté', 'accepté',
      'accord', 'd\'accord', 'ok pour', 'go pour', 'on fait', 'on ne fait pas',
      'décide', 'resolved', 'résolu', 'statué', 'tranché'
    ];
    
    // Détection d'action
    const hasAction = actionKeywords.some(keyword => lowerText.includes(keyword));
    if (hasAction) {
      const newAction = {
        id: Date.now() + Math.random(),
        text: text.trim(),
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        priority: determinePriority(text)
      };
      
      setDetectedActions(prev => {
        // Éviter les doublons
        const isDuplicate = prev.some(action => 
          action.text.toLowerCase() === newAction.text.toLowerCase()
        );
        if (!isDuplicate) {
          return [...prev, newAction];
        }
        return prev;
      });
    }
    
    // Détection de décision
    const hasDecision = decisionKeywords.some(keyword => lowerText.includes(keyword));
    if (hasDecision) {
      const newDecision = {
        id: Date.now() + Math.random(),
        text: text.trim(),
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        impact: determineImpact(text)
      };
      
      setDetectedDecisions(prev => {
        // Éviter les doublons
        const isDuplicate = prev.some(decision => 
          decision.text.toLowerCase() === newDecision.text.toLowerCase()
        );
        if (!isDuplicate) {
          return [...prev, newDecision];
        }
        return prev;
      });
    }
  };

  const determinePriority = (text) => {
    const urgent = ['urgent', 'immédiat', 'asap', 'prioritaire', 'critique'];
    const high = ['important', 'doit', 'faut', 'rapidement', 'vite'];
    
    const lowerText = text.toLowerCase();
    if (urgent.some(word => lowerText.includes(word))) return 'Haute';
    if (high.some(word => lowerText.includes(word))) return 'Moyenne';
    return 'Basse';
  };

  const determineImpact = (text) => {
    const high = ['stratégique', 'majeur', 'important', 'critique', 'essentiel'];
    const medium = ['significatif', 'notable', 'conséquent'];
    
    const lowerText = text.toLowerCase();
    if (high.some(word => lowerText.includes(word))) return 'Fort';
    if (medium.some(word => lowerText.includes(word))) return 'Moyen';
    return 'Faible';
  };

  const handleStop = () => {
    if (confirm('Voulez-vous vraiment terminer cette session ?')) {
      stopRecording();
      // Ajouter les actions et décisions détectées à la session
      const enhancedData = {
        ...transcript,
        detectedActions,
        detectedDecisions
      };
      onEnd(transcript, duration, { detectedActions, detectedDecisions });
    }
  };

  const handleMarkMoment = () => {
    const note = prompt('Note pour ce moment important :');
    if (note) {
      setTranscript(prev => [...prev, {
        id: Date.now(),
        timestamp: Date.now(),
        text: `${note}`,
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
    <div className="screen active-session" style={{ width: '100%', height: 'calc(100vh - 120px)', boxSizing: 'border-box' }}>
      <style>{`
        .transcript-bubble {
          display: flex;
          flex-direction: column;
          margin-bottom: 12px;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: background 0.2s;
        }
        .transcript-bubble:hover {
          background: rgba(255, 255, 255, 0.05);
        }
        .transcript-bubble.system {
          background: transparent;
          border: none;
          align-items: center;
          padding: 4px;
        }
        .transcript-bubble.system .text {
          font-style: italic;
          color: var(--muted);
          font-size: 13px;
          background: rgba(255, 255, 255, 0.05);
          padding: 4px 12px;
          border-radius: 99px;
        }
        .bubble-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 6px;
          font-size: 12px;
        }
        .speaker-name {
          font-weight: 600;
          color: var(--accent);
        }
        .time-stamp {
          color: var(--muted);
          font-variant-numeric: tabular-nums;
        }
        .bubble-content {
          color: var(--text);
          line-height: 1.5;
          font-size: 14px;
        }
        /* AI Panel Enhancements */
        .ai-card {
          background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 10px;
          transition: transform 0.2s;
        }
        .ai-card:hover {
          transform: translateX(4px);
          border-color: var(--accent);
        }
        .badge-priority-haute, .badge-impact-fort { color: #f87171; background: rgba(248, 113, 113, 0.1); padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
        .badge-priority-moyenne, .badge-impact-moyen { color: #fbbf24; background: rgba(251, 191, 36, 0.1); padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
        .badge-priority-basse, .badge-impact-faible { color: #34d399; background: rgba(52, 211, 153, 0.1); padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
        
        /* New Soulful Styles */
        @keyframes pulse-ring {
          0% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(56, 189, 248, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(56, 189, 248, 0); }
          100% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(56, 189, 248, 0); }
        }
        
        .ai-pulse-indicator {
          width: 8px;
          height: 8px;
          background: var(--accent);
          border-radius: 50%;
          border: 2px solid rgba(56, 189, 248, 0.3);
          box-shadow: 0 0 0 0 rgba(56, 189, 248, 0.7);
          animation: pulse-ring 2s infinite;
        }

        .ai-header-gradient {
          background: linear-gradient(90deg, rgba(56, 189, 248, 0.1) 0%, transparent 100%);
          padding: 12px 16px;
          border-left: 3px solid var(--accent);
          margin-bottom: 12px;
          border-radius: 0 8px 8px 0;
        }

        .ai-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          padding: 40px 20px;
          text-align: center;
          color: var(--muted);
          opacity: 0.6;
          border: 2px dashed rgba(255,255,255,0.05);
          border-radius: 12px;
          margin: 10px;
        }

        .control-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(12px);
          border-top: 1px solid rgba(255,255,255,0.08);
          margin-top: auto;
        }

        .btn-terminate {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 99px;
          font-weight: 600;
          font-size: 14px;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
        }
        .btn-terminate:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
          filter: brightness(1.1);
        }

        .btn-tool {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: var(--text);
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
        }
        .btn-tool:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.2);
        }
        .btn-tool.active-pulse {
          background: rgba(251, 191, 36, 0.15);
          color: #fbbf24;
          border-color: rgba(251, 191, 36, 0.3);
        }
      `}</style>

      <div className="session-layout" style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '24px', 
        height: '100%', 
        overflow: 'hidden' 
      }}>
        {/* Panneau principal - Transcription */}
        <div className="session-main" style={{  
          display: 'flex', 
          flexDirection: 'column', 
          height: '100%', 
          overflow: 'hidden',
          background: 'var(--panel)',
          borderRadius: 'var(--r-md)',
          border: '1px solid var(--border)',
          padding: '24px'
        }}>
          <div className="session-header">
            <div className="session-info">
              <h2>{config.title}</h2>
              <div className="recording-indicator">
                {!isPaused && <span className="red-dot"></span>}
                {isPaused ? 'En pause' : 'Enregistrement en cours'} • {formatDuration(duration)}
              </div>
              
              <div className="mic-status" style={{ fontSize: '14px', marginTop: '8px', opacity: 0.8 }}>
                {micStatus}
              </div>

              {/* Indicateurs de détection */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px', fontSize: '12px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px',
              color: audioDetected ? '#10b981' : '#94a3b8',
              fontWeight: audioDetected ? '600' : '400'
            }}>
              <Mic size={14} />
              Audio: {audioDetected ? 'Actif' : 'Inactif'}
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px',
              color: speechDetected ? '#10b981' : '#94a3b8',
              fontWeight: speechDetected ? '600' : '400'
            }}>
              <Activity size={14} />
              Parole: {speechDetected ? 'Détectée' : 'Aucune'}
            </div>
          </div>

          <div style={{ fontSize: '11px', marginTop: '6px', color: '#64748b', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Info size={12} />
            Ouvrez la console (F12) pour voir les logs détaillés
          </div>
        </div>
      </div>

      {/* Détection d'environnement Electron */}
      {(() => {
        const isElectron = typeof window !== 'undefined' && window.process && window.process.type === 'renderer';
        if (!isElectron) return null;
        return (
          <div style={{
            background: '#fff3cd',
            color: '#856404',
            border: '1px solid #ffeeba',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '18px',
            fontSize: '15px',
            maxWidth: '600px',
            margin: '0 auto 18px auto',
            textAlign: 'center',
          }}>
            <b>La transcription vocale ne fonctionne pas dans l'application installée.</b><br />
            <span style={{ fontSize: '14px' }}>
              Veuillez utiliser la version navigateur (Chrome/Edge/Brave) pour profiter de la transcription en temps réel.<br />
              <span style={{ color: '#b91c1c', fontWeight: 500 }}>Limitation technique Electron/Web Speech API</span>
            </span>
          </div>
        );
      })()}
      <div className="transcript-container">
        <div className="transcript-stats">
          {transcript.filter(t => t.isFinal).length} segments • 
          Moments marqués: {transcript.filter(t => t.marked).length}
        </div>
        
        {transcript.length === 0 && (
          <div className="transcript-empty">
            <div style={{ marginBottom: '16px' }}>
              <Mic size={48} style={{ color: audioDetected ? '#10b981' : '#94a3b8' }} />
            </div>
            <p>En attente de parole...</p>
            <small>Commencez à parler pour voir la transcription apparaître</small>
            <br />
            <small style={{ marginTop: '12px', display: 'block', color: '#666' }}>
              Statut: {micStatus}
            </small>
            {!audioDetected && isRecording && (
              <div style={{ 
                marginTop: '16px', 
                padding: '12px', 
                background: '#fff3cd', 
                borderRadius: '8px',
                fontSize: '13px',
                color: '#856404'
              }}>
                <AlertCircle size={16} style={{ marginBottom: '4px' }} />
                <div>Aucun audio détecté</div>
                <div style={{ marginTop: '4px', fontSize: '12px' }}>
                  Vérifiez que votre microphone fonctionne et que les permissions sont accordées
                </div>
              </div>
            )}
          </div>
        )}

        {transcript.map((item) => (
          <div 
            key={item.id} 
            className={`transcript-bubble ${item.isSystem ? 'system' : ''}`}
          >
            {item.isSystem ? (
               <span className="text">{item.text}</span>
            ) : (
              <>
                 <div className="bubble-header">
                    <span className="speaker-name">{item.speaker}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                       {item.marked && <span style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}><Bookmark size={10} /> Important</span>}
                       <span className="time-stamp">
                         {new Date(item.timestamp).toLocaleTimeString('fr-FR', { 
                           hour: '2-digit', 
                           minute: '2-digit', 
                           second: '2-digit' 
                         })}
                       </span>
                    </div>
                 </div>
                 <div className="bubble-content">
                    {typeof item.text === 'string' 
                      ? item.text.trim()
                          .replace(/\.0+\s*$/g, '')
                          .replace(/\s+0+\s*$/g, '')
                          .replace(/\.0+(\s+|$)/g, '$1')
                          .trim()
                      : item.text
                    }
                 </div>
              </>
            )}
          </div>
        ))}
        <div ref={transcriptEndRef} />
      </div>

      <div className="control-bar">
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={handlePauseResume} 
            className={`btn-tool ${isPaused ? 'active-pulse' : ''}`}
          >
            {isPaused ? <><Play size={16} /> Reprendre</> : <><Pause size={16} /> Pause</>}
          </button>
          
          <button 
            onClick={handleMarkMoment} 
            className="btn-tool"
          >
            <Bookmark size={16} /> Marquer
          </button>
        </div>
        
        <button 
          onClick={handleStop} 
          className="btn-terminate"
        >
          <Square size={16} fill="currentColor" /> Terminer la session
        </button>
      </div>
    </div>

    {/* Panneau latéral - Analyse IA en temps réel */}
    <div className="session-sidebar" style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          height: '100%', 
          overflow: 'hidden',
          background: 'linear-gradient(180deg, var(--panel) 0%, rgba(15, 23, 42, 0.8) 100%)',
          borderRadius: 'var(--r-md)',
          border: '1px solid var(--border)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
        }}>
          <div className="ai-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <h3 className="ai-panel-title" style={{ 
                flexShrink: 0, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderBottom: '1px solid rgba(255,255,255,0.05)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <BrainCircuit size={20} className="text-accent" />
                <span>Analyse IA</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--accent)', fontWeight: 500 }}>
                <div className="ai-pulse-indicator"></div>
                LIVE
              </div>
            </h3>
            
            {/* Actions détectées */}
            <div className="ai-section" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderBottom: '1px solid var(--border)' }}>
              <div className="ai-header-gradient" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle size={16} />
                <h4 style={{ margin: 0, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions détectées</h4>
                <span className="ai-badge" style={{ marginLeft: 'auto' }}>{detectedActions.length}</span>
              </div>
              
              <div className="ai-items" style={{ flex: 1, overflowY: 'auto', padding: '0 16px 16px 16px' }}>
                {detectedActions.length === 0 ? (
                  <div className="ai-empty-state">
                    <CheckCircle size={32} style={{ marginBottom: '12px', opacity: 0.3 }} />
                    <div>En attente d'actions...</div>
                    <div style={{ fontSize: '11px', marginTop: '4px' }}>L'IA détecte les tâches automatiquement</div>
                  </div>
                ) : (
                  detectedActions.map(action => (
                    <div key={action.id} className="ai-card">
                      <div className="bubble-header">
                        <span className="time-stamp">{action.timestamp}</span>
                        <span className={`badge-priority-${action.priority.toLowerCase()}`}>
                          {action.priority}
                        </span>
                      </div>
                      <div className="bubble-content" style={{ fontSize: '13px' }}>{action.text}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Décisions détectées */}
            <div className="ai-section" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div className="ai-header-gradient" style={{ display: 'flex', alignItems: 'center', gap: '10px', borderLeftColor: '#fbbf24' }}>
                <AlertTriangle size={16} color="#fbbf24" />
                <h4 style={{ margin: 0, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#fbbf24' }}>Décisions validées</h4>
                <span className="ai-badge" style={{ marginLeft: 'auto', background: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24' }}>{detectedDecisions.length}</span>
              </div>
              
              <div className="ai-items" style={{ flex: 1, overflowY: 'auto', padding: '0 16px 16px 16px' }}>
                {detectedDecisions.length === 0 ? (
                  <div className="ai-empty-state">
                    <AlertTriangle size={32} style={{ marginBottom: '12px', opacity: 0.3 }} />
                    <div>Aucune décision</div>
                    <div style={{ fontSize: '11px', marginTop: '4px' }}>Les accords sont capturés ici</div>
                  </div>
                ) : (
                  detectedDecisions.map(decision => (
                    <div key={decision.id} className="ai-card" style={{ borderLeft: '3px solid #fbbf24' }}>
                      <div className="bubble-header">
                        <span className="time-stamp">{decision.timestamp}</span>
                        <span className={`badge-impact-${decision.impact.toLowerCase()}`}>
                          Impact {decision.impact}
                        </span>
                      </div>
                      <div className="bubble-content" style={{ fontSize: '13px' }}>{decision.text}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
