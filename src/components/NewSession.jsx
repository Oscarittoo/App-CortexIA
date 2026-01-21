import { useState } from 'react';

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
        <div className="form-group">
          <label htmlFor="meeting-title">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" className="label-icon">
              <path d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm3 1a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm0 4a1 1 0 011-1h4a1 1 0 110 2H7a1 1 0 01-1-1z"/>
            </svg>
            Titre de la réunion
          </label>
          <input
            id="meeting-title"
            type="text"
            placeholder="ex: Réunion d'équipe hebdomadaire"
            value={meetingTitle}
            onChange={(e) => setMeetingTitle(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="platform">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" className="label-icon">
              <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 100 4v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2a2 2 0 100-4V6z"/>
            </svg>
            Plateforme de visioconférence
          </label>
          <select 
            id="platform"
            value={platform} 
            onChange={(e) => setPlatform(e.target.value)}
          >
            <option value="local">🎤 Local (microphone direct)</option>
            <option value="zoom">🎥 Zoom Meeting</option>
            <option value="google-meet">📹 Google Meet</option>
            <option value="teams">💼 Microsoft Teams</option>
            <option value="webex">🌐 Cisco Webex</option>
            <option value="slack">💬 Slack Huddle</option>
            <option value="discord">🎮 Discord</option>
          </select>
          <small className="form-help">
            Sélectionnez votre plateforme pour une intégration optimale (configuration requise dans Paramètres)
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="audio-source">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" className="label-icon">
              <path d="M10 2a3 3 0 00-3 3v5a3 3 0 006 0V5a3 3 0 00-3-3z"/>
              <path d="M4 10a1 1 0 112 0 4 4 0 008 0 1 1 0 112 0 6 6 0 01-5 5.917V18h3a1 1 0 110 2H6a1 1 0 110-2h3v-2.083A6 6 0 014 10z"/>
            </svg>
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
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" className="label-icon">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z"/>
            </svg>
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
            <p><strong>Informations légales :</strong></p>
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
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/>
          </svg>
          Démarrer la session
        </button>
      </div>
    </div>
  );
}
