import { useState } from 'react';
import { FileText, Video, Mic, Globe, Shield, Play } from 'lucide-react';

export default function NewSession({ onStart }) {
  const [audioSource, setAudioSource] = useState('microphone');
  const [platform, setPlatform] = useState('local');
  const [language, setLanguage] = useState('fr');
  const [consent, setConsent] = useState(false);
  const [meetingTitle, setMeetingTitle] = useState('');

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
      title: meetingTitle 
    });
  };

  return (
    <div className="screen new-session">
      <h2>Nouvelle Session</h2>
      <p className="screen-description">
        Configurez votre session de transcription pour votre réunion ou appel
      </p>

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
          className="btn-primary btn-large"
          onClick={handleStart}
          disabled={!consent || !meetingTitle.trim()}
        >
          <Play size={20} />
          Démarrer la session
        </button>
      </div>
    </div>
  );
}
