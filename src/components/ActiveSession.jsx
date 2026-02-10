import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Pause, Play, Square, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';

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
      setMicStatus('🔄 Initialisation Web Speech API...');

      // Vérifier support Web Speech API
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        throw new Error('Web Speech API non supportée par ce navigateur');
      }

      console.log('✅ Web Speech API supportée');

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
        console.log('✅ [onstart] Recognition started successfully');
        setMicStatus('✅ Écoute active - Parlez maintenant');
        setIsRecording(true);
      };

      recognition.onaudiostart = () => {
        console.log('🎤 [onaudiostart] Audio capture active');
        setAudioDetected(true);
      };

      recognition.onsoundstart = () => {
        console.log('🔊 [onsoundstart] Sound detected');
      };

      recognition.onspeechstart = () => {
        console.log('🗣️ [onspeechstart] Speech detected');
        setSpeechDetected(true);
        setMicStatus('🗣️ Parole détectée...');
      };

      recognition.onresult = (event) => {
        console.log('📝 [onresult] Result received, results count:', event.results.length);
        
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
          console.log('✅ Résultat final ajouté à la transcription');
          setMicStatus('✅ Transcription active');
          
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
          setMicStatus(`🎤 ${preview}`);
        }
      };

      recognition.onspeechend = () => {
        console.log('⏸️ [onspeechend] Speech ended');
        setSpeechDetected(false);
      };

      recognition.onsoundend = () => {
        console.log('🔇 [onsoundend] Sound ended');
      };

      recognition.onaudioend = () => {
        console.log('⏹️ [onaudioend] Audio capture ended');
        setAudioDetected(false);
      };

      recognition.onerror = (event) => {
        console.error('❌ [onerror] Error occurred:', event.error);
        console.error('Error details:', {
          error: event.error,
          message: event.message || 'No message'
        });

        let errorMessage = '';
        switch (event.error) {
          case 'no-speech':
            errorMessage = '⚠️ Aucune parole détectée - parlez plus fort';
            console.warn('Conseil: Assurez-vous que le microphone fonctionne et que vous parlez clairement');
            break;
          case 'audio-capture':
            errorMessage = '❌ Impossible de capturer l\'audio';
            console.error('Le microphone est peut-être utilisé par une autre application');
            break;
          case 'not-allowed':
            errorMessage = '❌ Permission microphone refusée';
            console.error('Autorisez l\'accès au microphone dans les paramètres du navigateur');
            alert('❌ Accès au microphone refusé. Veuillez autoriser l\'accès dans les paramètres de votre navigateur.');
            break;
          case 'network':
            errorMessage = '❌ Erreur réseau';
            console.error('Vérifiez votre connexion internet');
            break;
          case 'aborted':
            errorMessage = '⚠️ Reconnaissance interrompue';
            break;
          default:
            errorMessage = `❌ Erreur: ${event.error}`;
        }
        
        setMicStatus(errorMessage);
      };

      recognition.onend = () => {
        console.log('🔄 [onend] Recognition ended');
        
        if (isRecording && !isPaused && restartCountRef.current < 50) {
          console.log(`🔄 Auto-restart (tentative ${restartCountRef.current + 1}/50)`);
          restartCountRef.current += 1;
          
          setTimeout(() => {
            try {
              recognition.start();
              console.log('✅ Recognition restarted');
            } catch (error) {
              console.error('❌ Restart failed:', error);
              setMicStatus('❌ Erreur redémarrage reconnaissance');
            }
          }, 100);
        } else if (restartCountRef.current >= 50) {
          console.warn('⚠️ Limite de redémarrage atteinte (50)');
          setMicStatus('⚠️ Limite de redémarrage atteinte');
        }
      };

      // Démarrer la reconnaissance
      console.log('🚀 Tentative de démarrage...');
      recognitionRef.current = recognition;
      recognition.start();
      
      console.log('=== INITIALISATION TERMINÉE ===');
      setMicStatus('🔄 Démarrage en cours...');

    } catch (error) {
      console.error('❌ ERREUR FATALE:', error);
      console.error('Stack trace:', error.stack);
      setMicStatus('❌ Erreur: ' + error.message);
      alert('❌ Erreur d\'initialisation: ' + error.message);
    }
  };

  const stopRecording = () => {
    console.log('🛑 Arrêt de la reconnaissance');
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
      console.log('▶️ Reprise de la session');
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
      setTranscript(prev => [...prev, {
        id: Date.now(),
        timestamp: Date.now(),
        text: '▶ Session reprise',
        speaker: 'Système',
        isSystem: true
      }]);
    } else {
      console.log('⏸️ Pause de la session');
      if (recognitionRef.current) {
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

  // Analyse IA en temps réel des actions et décisions
  const analyzeTextForActionsAndDecisions = (text) => {
    const lowerText = text.toLowerCase();
    
    // Mots-clés pour actions
    const actionKeywords = [
      'doit', 'dois', 'devons', 'devez', 'va', 'vais', 'allons', 'allez',
      'devra', 'faut', 'il faut', 'faudra', 'besoin', 'action', 'faire',
      'réaliser', 'tâche', 'planifier', 'organiser', 'préparer', 'prévoir',
      'créer', 'mettre en place', 'lancer', 'développer', 'implémenter',
      'à suivre', 'next step', 'prochaine étape', 'todo'
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
    if (confirm('🛑 Voulez-vous vraiment terminer cette session ?')) {
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
      {/* FORCE LAYOUT STYLES */}
      <style>{`
        .session-layout {
          display: grid !important;
          grid-template-columns: 1fr 400px !important;
          gap: 24px !important;
          height: calc(100vh - 140px) !important;
          width: 100% !important;
          align-items: start !important;
        }
        .session-main {
          height: 100% !important;
          display: flex !important;
          flex-direction: column !important;
          overflow: hidden !important;
          background: var(--panel, #1e293b) !important;
          border: 1px solid var(--border, #334155) !important;
          border-radius: 12px !important;
          padding: 24px !important;
        }
        .session-sidebar {
          height: 100% !important;
          display: flex !important;
          flex-direction: column !important;
          overflow: hidden !important;
          background: var(--panel, #1e293b) !important;
          border: 1px solid var(--border, #334155) !important;
          border-radius: 12px !important;
        }
        .transcript-container {
          flex: 1 !important;
          overflow-y: auto !important;
          min-height: 0 !important;
        }
        .ai-panel {
          height: 100% !important;
          display: flex !important;
          flex-direction: column !important;
        }
        .ai-section {
          flex: 1 !important;
          overflow: hidden !important;
          display: flex !important;
          flex-direction: column !important;
        }
        .ai-items {
          flex: 1 !important;
          overflow-y: auto !important;
        }
        @media (max-width: 1024px) {
          .session-layout {
            grid-template-columns: 1fr !important;
            height: auto !important;
          }
          .session-sidebar {
             height: 500px !important;
          }
        }
      `}</style>

      <div className="session-layout">
        {/* Panneau principal - Transcription */}
        <div className="session-main">
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
              Audio: {audioDetected ? '✓ Actif' : '○ Inactif'}
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px',
              color: speechDetected ? '#10b981' : '#94a3b8',
              fontWeight: speechDetected ? '600' : '400'
            }}>
              <AlertCircle size={14} />
              Parole: {speechDetected ? '✓ Détectée' : '○ Aucune'}
            </div>
          </div>

          <div style={{ fontSize: '11px', marginTop: '6px', color: '#64748b', fontStyle: 'italic' }}>
            💡 Ouvrez la console (F12) pour voir les logs détaillés
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
            <b>⚠️ La transcription vocale ne fonctionne pas dans l'application installée.</b><br />
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
          📌 {transcript.filter(t => t.marked).length} moments marqués
        </div>
        
        {transcript.length === 0 && (
          <div className="transcript-empty">
            <div style={{ marginBottom: '16px' }}>
              <Mic size={48} style={{ color: audioDetected ? '#10b981' : '#94a3b8' }} />
            </div>
            <p>🎤 En attente de parole...</p>
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
                <div>⚠️ Aucun audio détecté</div>
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
            <span className="text">
              {typeof item.text === 'string' 
                ? item.text.trim()
                    .replace(/\.0+\s*$/g, '')
                    .replace(/\s+0+\s*$/g, '')
                    .replace(/\.0+(\s+|$)/g, '$1')
                    .trim()
                : item.text
              }
            </span>
            {item.confidence && (
              <span style={{ 
                fontSize: '11px', 
                color: '#94a3b8', 
                marginLeft: '8px' 
              }}>
                ({(item.confidence * 100).toFixed(0)}%)
              </span>
            )}
          </div>
        ))}
        <div ref={transcriptEndRef} />
      </div>

      <div className="session-controls">
        <button 
          onClick={handlePauseResume} 
          className={`btn-secondary ${isPaused ? 'btn-resume' : ''}`}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
        >
          {isPaused ? <><Play size={18} /> Reprendre</> : <><Pause size={18} /> Pause</>}
        </button>
        
        <button 
          onClick={handleMarkMoment} 
          className="btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
        >
          📌 Marquer ce moment
        </button>
        
        <button 
          onClick={handleStop} 
          className="btn-danger"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
        >
          <Square size={18} /> Terminer la session
        </button>
      </div>
    </div>

    {/* Panneau latéral - Analyse IA en temps réel */}
    <div className="session-sidebar">
          <div className="ai-panel">
            <h3 className="ai-panel-title">🤖 Analyse IA en temps réel</h3>
            
            {/* Actions détectées */}
            <div className="ai-section">
              <div className="ai-section-header">
                <CheckCircle size={18} />
                <h4>Actions à suivre</h4>
                <span className="ai-badge">{detectedActions.length}</span>
              </div>
              
              <div className="ai-items">
                {detectedActions.length === 0 ? (
                  <div className="ai-empty">
                    Aucune action détectée pour le moment
                  </div>
                ) : (
                  detectedActions.map(action => (
                    <div key={action.id} className="ai-item action-item">
                      <div className="ai-item-meta">
                        <span className="ai-time">{action.timestamp}</span>
                        <span className={`priority-badge priority-${action.priority.toLowerCase()}`}>
                          {action.priority}
                        </span>
                      </div>
                      <div className="ai-item-text">{action.text}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Décisions détectées */}
            <div className="ai-section">
              <div className="ai-section-header">
                <AlertTriangle size={18} />
                <h4>Décisions prises</h4>
                <span className="ai-badge">{detectedDecisions.length}</span>
              </div>
              
              <div className="ai-items">
                {detectedDecisions.length === 0 ? (
                  <div className="ai-empty">
                    Aucune décision détectée pour le moment
                  </div>
                ) : (
                  detectedDecisions.map(decision => (
                    <div key={decision.id} className="ai-item decision-item">
                      <div className="ai-item-meta">
                        <span className="ai-time">{decision.timestamp}</span>
                        <span className={`impact-badge impact-${decision.impact.toLowerCase()}`}>
                          Impact {decision.impact}
                        </span>
                      </div>
                      <div className="ai-item-text">{decision.text}</div>
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
