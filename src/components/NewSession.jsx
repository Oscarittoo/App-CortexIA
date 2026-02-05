import { useState, useEffect } from 'react';
import { FileText, Video, Mic, Globe, Shield, Play, Layout, X } from 'lucide-react';
import toast from './Toast';

export default function NewSession({ onStart }) {
  const [audioSource, setAudioSource] = useState('microphone');
  const [platform, setPlatform] = useState('local');
  const [language, setLanguage] = useState('fr');
  const [consent, setConsent] = useState(false);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Charger le template sélectionné au montage
  useEffect(() => {
    const savedTemplate = localStorage.getItem('selectedTemplate');
    if (savedTemplate) {
      try {
        const template = JSON.parse(savedTemplate);
        setSelectedTemplate(template);
        toast.success(`Template "${template.name}" appliqué !`);
      } catch (error) {
        console.error('Erreur chargement template:', error);
      }
    }
  }, []);

  const clearTemplate = () => {
    setSelectedTemplate(null);
    localStorage.removeItem('selectedTemplate');
    toast.info('Template retiré');
  };

  const handleStart = () => {
    if (!consent) {
      alert('Vous devez confirmer le consentement des participants avant de commencer');
      return;
    }

    if (!meetingTitle.trim()) {
      alert('Veuillez fournir un titre de réunion');
      return;
    }

    onStart({ 
      audioSource, 
      platform,
      language, 
      title: meetingTitle,
      template: selectedTemplate // Passer le template à la session
    });
  };

  return (
    <div className="screen new-session">
      <h2>Nouvelle Session</h2>
      <p className="screen-description">
        Configurez votre session de transcription pour votre réunion ou appel
      </p>

      {/* Template sélectionné */}
      {selectedTemplate && (
        <div className="template-banner">
          <div className="template-banner-content">
            <Layout size={20} className="template-icon" />
            <div className="template-info">
              <strong>{selectedTemplate.name}</strong>
              <span>{selectedTemplate.description}</span>
            </div>
          </div>
          <button className="btn-remove-template" onClick={clearTemplate}>
            <X size={18} />
          </button>
        </div>
      )}

      <div className="form-container">
        {/* Section: Informations de base */}
        <div className="form-section">
          <div className="form-section-header">
            <div className="form-section-icon">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="form-section-title">Informations de base</h3>
              <p className="form-section-description">Identifiez votre réunion</p>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="meeting-title">
              <FileText size={16} className="label-icon" />
              Titre de la réunion
              <span className="label-badge">Requis</span>
            </label>
            <input
              id="meeting-title"
              type="text"
              placeholder="ex: Réunion d'équipe hebdomadaire"
              value={meetingTitle}
              onChange={(e) => setMeetingTitle(e.target.value)}
            />
          </div>
        </div>

        {/* Section: Configuration de la plateforme */}
        <div className="form-section">
          <div className="form-section-header">
            <div className="form-section-icon">
              <Video size={20} />
            </div>
            <div>
              <h3 className="form-section-title">Plateforme de visioconférence</h3>
              <p className="form-section-description">Sélectionnez votre outil de visioconférence</p>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="platform">
              <Video size={16} className="label-icon" />
              Plateforme
            </label>
            <select 
              id="platform"
              value={platform} 
              onChange={(e) => setPlatform(e.target.value)}
            >
              <option value="local">Local (microphone direct)</option>
              <option value="zoom">Zoom Meeting</option>
              <option value="google-meet">Google Meet</option>
              <option value="teams">Microsoft Teams</option>
              <option value="webex">Cisco Webex</option>
              <option value="slack">Slack Huddle</option>
              <option value="discord">Discord</option>
            </select>
            <small className="form-help">
              Sélectionnez votre plateforme pour une intégration optimale (configuration requise dans Paramètres)
            </small>
          </div>
        </div>

        {/* Section: Configuration audio */}
        <div className="form-section">
          <div className="form-section-header">
            <div className="form-section-icon">
              <Mic size={20} />
            </div>
            <div>
              <h3 className="form-section-title">Configuration audio</h3>
              <p className="form-section-description">Source audio et langue de transcription</p>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="audio-source">
              <Mic size={16} className="label-icon" />
              Source audio
            </label>
            <select 
              id="audio-source"
              value={audioSource} 
              onChange={(e) => setAudioSource(e.target.value)}
            >
              <option value="microphone">Microphone système</option>
              <option value="system">Audio système (si disponible)</option>
            </select>
            <small className="form-help">
              Choisissez le microphone pour les réunions en personne ou l'audio système pour les appels vidéo
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="language">
              <Globe size={16} className="label-icon" />
              Langue de transcription
            </label>
            <select 
              id="language"
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="fr">Français</option>
              <option value="en">Anglais</option>
            </select>
          </div>
        </div>

        {/* Section: Consentement et confidentialité */}
        <div className="consent-box">
          <label className="consent-label">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />
            <span>
              <strong>Je confirme avoir le consentement des participants</strong> pour cette transcription et le traitement des données associées
            </span>
          </label>
          
          <div className="legal-info">
            <p>
              <Shield size={16} />
              <strong>Informations légales</strong>
            </p>
            <ul>
              <li>Les données sont stockées localement sur votre appareil</li>
              <li>La transcription peut être envoyée à un service externe (API)</li>
              <li>Vous êtes responsable de la conformité RGPD</li>
            </ul>
          </div>
        </div>

        <button
          className="btn-primary btn-large btn-block"
          onClick={handleStart}
          disabled={!consent || !meetingTitle.trim()}
        >
          <Play size={20} />
          Démarrer la session
        </button>
      </div>
      
      <style jsx>{`
        .new-session {
          padding-bottom: 80px;
          /* Force full width and centering */
          max-width: 100% !important; 
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .screen-description {
          margin-bottom: 32px;
          color: var(--muted);
          font-size: 16px;
          text-align: center;
        }
        
        h2 {
           text-align: center;
           width: 100%;
           font-size: 36px;
           font-weight: 700;
           font-family: 'Orbitron', sans-serif;
           letter-spacing: -0.8px;
        }

        .form-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
          width: 100%;
          max-width: 800px;
          margin: 0 auto; /* Center the form */
        }

        .form-section {
          background: rgba(30, 41, 59, 0.4); /* Glass tile */
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 24px;
          transition: all 0.3s ease;
        }

        .form-section:hover {
            border-color: rgba(56, 189, 248, 0.3);
            background: rgba(30, 41, 59, 0.6);
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
        }

        .form-section-header {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding-bottom: 16px;
        }

        .form-section-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: rgba(56, 189, 248, 0.1);
          color: #38bdf8;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .form-section-title {
          margin: 0 0 4px 0;
          font-family: var(--font-display);
          font-size: 18px;
          color: var(--text);
        }

        .form-section-description {
          margin: 0;
          font-size: 14px;
          color: var(--muted);
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .label-icon {
          color: var(--accent);
        }

        .label-badge {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 4px;
          margin-left: auto;
        }

        /* High Visibility Inputs */
        input[type="text"],
        select {
          width: 100%;
          height: 52px;
          background: rgba(15, 23, 42, 0.6) !important;
          border: 1px solid rgba(255, 255, 255, 0.15) !important;
          border-radius: 12px;
          padding: 0 16px;
          font-family: var(--font-body);
          font-size: 16px;
          color: #fff !important;
          transition: all 0.2s;
        }

        input[type="text"]::placeholder {
           color: rgba(255, 255, 255, 0.3);
        }

        input[type="text"]:focus,
        select:focus {
          outline: none;
          border-color: #38bdf8 !important;
          background: rgba(15, 23, 42, 0.9) !important;
          box-shadow: 0 0 0 4px rgba(56, 189, 248, 0.1) !important;
        }

        .form-help {
          display: block;
          margin-top: 8px;
          font-size: 13px;
          color: var(--muted);
        }

        /* Consent Box */
        .consent-box {
          background: rgba(34, 197, 94, 0.05);
          border: 1px solid rgba(34, 197, 94, 0.2);
          border-radius: 16px;
          padding: 20px;
        }

        .consent-label {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          cursor: pointer;
          color: var(--text);
          font-size: 15px;
        }

        .consent-label input {
          width: 20px;
          height: 20px;
          margin-top: 2px;
          accent-color: #22c55e;
        }

        .legal-info {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid rgba(34, 197, 94, 0.2);
        }

        .legal-info p {
           display: flex;
           align-items: center;
           gap: 8px;
           color: #86efac; /* Light green */
           margin-bottom: 8px;
           font-size: 14px;
        }

        .legal-info ul {
          margin: 0;
          padding-left: 24px;
        }

        .legal-info li {
          font-size: 13px;
          color: var(--muted);
          margin-bottom: 4px;
        }

        .template-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: linear-gradient(135deg, rgba(56, 189, 248, 0.1), rgba(59, 130, 246, 0.05));
          border: 1px solid rgba(56, 189, 248, 0.3);
          border-radius: 12px;
          padding: 16px 20px;
          margin-bottom: 24px;
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .template-banner-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .template-icon {
          color: var(--accent);
        }

        .template-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .template-info strong {
          font-size: 15px;
          color: var(--text-primary);
          font-family: 'Orbitron', sans-serif;
        }

        .template-info span {
          font-size: 13px;
          color: var(--muted);
        }

        .btn-remove-template {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
          padding: 8px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-remove-template:hover {
          background: rgba(239, 68, 68, 0.2);
          border-color: #ef4444;
        }

        .btn-large {
          height: 56px;
          font-size: 18px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-top: 16px;
          background: linear-gradient(135deg, var(--accent), #3b82f6);
          border: none;
          border-radius: 14px;
          color: white;
          text-transform: uppercase;
          letter-spacing: 1px;
          cursor: pointer;
          box-shadow: 0 10px 30px rgba(56, 189, 248, 0.3);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .btn-large:hover:not(:disabled) {
           transform: translateY(-2px);
           box-shadow: 0 15px 40px rgba(56, 189, 248, 0.4);
        }

        .btn-large:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          filter: grayscale(1);
        }
      `}</style>
    </div>
  );
}
