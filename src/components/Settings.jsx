import { useState, useEffect } from 'react';

export default function Settings({ onClose }) {
  const [activeTab, setActiveTab] = useState('integrations');
  const [apiKeys, setApiKeys] = useState({
    // Visioconférence
    zoom_client_id: '',
    zoom_client_secret: '',
    google_client_id: '',
    google_client_secret: '',
    teams_client_id: '',
    teams_client_secret: '',
    teams_tenant_id: '',
    webex_client_id: '',
    slack_client_id: '',
    discord_client_id: '',
    
    // Transcription
    openai_api_key: '',
    deepgram_api_key: '',
    assemblyai_api_key: '',
    azure_speech_key: '',
    azure_speech_region: '',
    
    // Productivité
    notion_api_key: '',
    trello_api_key: '',
    asana_token: '',
    jira_api_token: '',
    linear_api_key: '',
  });

  const [testResults, setTestResults] = useState({});
  const [showKeys, setShowKeys] = useState({});

  useEffect(() => {
    // Charger les clés depuis localStorage
    const savedKeys = localStorage.getItem('cortexia_api_keys');
    if (savedKeys) {
      setApiKeys(JSON.parse(savedKeys));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('cortexia_api_keys', JSON.stringify(apiKeys));
    alert('Configuration sauvegardée avec succès !');
  };

  const handleTestConnection = async (service) => {
    setTestResults({ ...testResults, [service]: 'testing' });
    
    // Simulation de test
    setTimeout(() => {
      const success = Math.random() > 0.3;
      setTestResults({ ...testResults, [service]: success ? 'success' : 'error' });
    }, 1500);
  };

  const toggleShowKey = (key) => {
    setShowKeys({ ...showKeys, [key]: !showKeys[key] });
  };

  const renderInput = (key, label, placeholder) => {
    const inputType = showKeys[key] ? 'text' : 'password';
    
    return (
      <div className="settings-field">
        <label>{label}</label>
        <div className="input-with-action">
          <input
            type={inputType}
            value={apiKeys[key]}
            onChange={(e) => setApiKeys({ ...apiKeys, [key]: e.target.value })}
            placeholder={placeholder}
          />
          <button 
            className="btn-icon" 
            onClick={() => toggleShowKey(key)}
            title={showKeys[key] ? 'Masquer' : 'Afficher'}
          >
            {showKeys[key] ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="settings-overlay">
      <div className="settings-modal">
        <div className="settings-header">
          <h2>⚙️ Paramètres & Intégrations</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <div className="settings-tabs">
          <button 
            className={`settings-tab ${activeTab === 'integrations' ? 'active' : ''}`}
            onClick={() => setActiveTab('integrations')}
          >
            🔌 Intégrations
          </button>
          <button 
            className={`settings-tab ${activeTab === 'transcription' ? 'active' : ''}`}
            onClick={() => setActiveTab('transcription')}
          >
            🎤 Transcription
          </button>
          <button 
            className={`settings-tab ${activeTab === 'productivity' ? 'active' : ''}`}
            onClick={() => setActiveTab('productivity')}
          >
            📋 Productivité
          </button>
          <button 
            className={`settings-tab ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            ⚙️ Général
          </button>
        </div>

        <div className="settings-content">
          {activeTab === 'integrations' && (
            <div className="settings-section">
              <h3>🎥 Plateformes de Visioconférence</h3>
              <p className="section-description">
                Connectez CORTEXIA à vos outils de visioconférence pour enregistrer automatiquement vos réunions.
              </p>

              <div className="integration-card">
                <div className="integration-header">
                  <div className="integration-logo">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="#2D8CFF">
                      <rect x="4" y="4" width="24" height="24" rx="4" fill="currentColor"/>
                    </svg>
                  </div>
                  <div className="integration-info">
                    <h4>Zoom</h4>
                    <p>Enregistrez et transcrivez vos meetings Zoom</p>
                  </div>
                  <div className="integration-status">
                    {apiKeys.zoom_client_id && <span className="status-badge connected">Configuré</span>}
                    {!apiKeys.zoom_client_id && <span className="status-badge">Non configuré</span>}
                  </div>
                </div>
                
                {renderInput('zoom_client_id', 'Client ID', 'Votre Zoom Client ID')}
                {renderInput('zoom_client_secret', 'Client Secret', 'Votre Zoom Client Secret')}
                
                <div className="integration-actions">
                  <button 
                    className="btn-secondary btn-sm"
                    onClick={() => handleTestConnection('zoom')}
                    disabled={!apiKeys.zoom_client_id || !apiKeys.zoom_client_secret}
                  >
                    {testResults.zoom === 'testing' && '⏳ Test...'}
                    {testResults.zoom === 'success' && 'Connexion OK'}
                    {testResults.zoom === 'error' && '❌ Échec'}
                    {!testResults.zoom && '🔍 Tester la connexion'}
                  </button>
                  <a 
                    href="https://marketplace.zoom.us/docs/guides/build/jwt-app" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-link"
                  >
                    📚 Documentation
                  </a>
                </div>
              </div>

              <div className="integration-card">
                <div className="integration-header">
                  <div className="integration-logo">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="#4285F4">
                      <circle cx="16" cy="16" r="12" fill="currentColor"/>
                    </svg>
                  </div>
                  <div className="integration-info">
                    <h4>Google Meet</h4>
                    <p>Intégration avec Google Workspace</p>
                  </div>
                  <div className="integration-status">
                    {apiKeys.google_client_id && <span className="status-badge connected">Configuré</span>}
                    {!apiKeys.google_client_id && <span className="status-badge">Non configuré</span>}
                  </div>
                </div>
                
                {renderInput('google_client_id', 'Client ID', 'Votre Google Client ID')}
                {renderInput('google_client_secret', 'Client Secret', 'Votre Google Client Secret')}
                
                <div className="integration-actions">
                  <button 
                    className="btn-secondary btn-sm"
                    onClick={() => handleTestConnection('google')}
                    disabled={!apiKeys.google_client_id}
                  >
                    🔍 Tester la connexion
                  </button>
                  <a 
                    href="https://developers.google.com/meet/api" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-link"
                  >
                    📚 Documentation
                  </a>
                </div>
              </div>

              <div className="integration-card">
                <div className="integration-header">
                  <div className="integration-logo">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="#6264A7">
                      <rect x="4" y="8" width="24" height="16" rx="2" fill="currentColor"/>
                    </svg>
                  </div>
                  <div className="integration-info">
                    <h4>Microsoft Teams</h4>
                    <p>Connectez vos meetings Teams</p>
                  </div>
                  <div className="integration-status">
                    {apiKeys.teams_client_id && <span className="status-badge connected">Configuré</span>}
                    {!apiKeys.teams_client_id && <span className="status-badge">Non configuré</span>}
                  </div>
                </div>
                
                {renderInput('teams_client_id', 'Client ID', 'Votre Teams Client ID')}
                {renderInput('teams_client_secret', 'Client Secret', 'Votre Teams Client Secret')}
                {renderInput('teams_tenant_id', 'Tenant ID', 'Votre Azure Tenant ID')}
                
                <div className="integration-actions">
                  <button 
                    className="btn-secondary btn-sm"
                    onClick={() => handleTestConnection('teams')}
                    disabled={!apiKeys.teams_client_id}
                  >
                    🔍 Tester la connexion
                  </button>
                  <a 
                    href="https://learn.microsoft.com/en-us/graph/api/resources/teams-api-overview" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-link"
                  >
                    📚 Documentation
                  </a>
                </div>
              </div>

              <div className="integration-card">
                <div className="integration-header">
                  <div className="integration-logo">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="#00BEF0">
                      <rect x="6" y="10" width="20" height="12" rx="2" fill="currentColor"/>
                    </svg>
                  </div>
                  <div className="integration-info">
                    <h4>Cisco Webex</h4>
                    <p>Support des meetings Webex</p>
                  </div>
                  <div className="integration-status">
                    {apiKeys.webex_client_id && <span className="status-badge connected">Configuré</span>}
                    {!apiKeys.webex_client_id && <span className="status-badge">Non configuré</span>}
                  </div>
                </div>
                
                {renderInput('webex_client_id', 'Client ID', 'Votre Webex Client ID')}
                
                <div className="integration-actions">
                  <a 
                    href="https://developer.webex.com/docs/api/getting-started" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-link"
                  >
                    📚 Documentation
                  </a>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transcription' && (
            <div className="settings-section">
              <h3>🎤 Services de Transcription</h3>
              <p className="section-description">
                Configurez votre service de transcription préféré pour une précision maximale.
              </p>

              <div className="integration-card">
                <div className="integration-header">
                  <div className="integration-info">
                    <h4>OpenAI Whisper</h4>
                    <p>Transcription multilingue de haute qualité</p>
                  </div>
                  <div className="integration-status">
                    {apiKeys.openai_api_key && <span className="status-badge connected">Configuré</span>}
                    {!apiKeys.openai_api_key && <span className="status-badge recommended">Recommandé</span>}
                  </div>
                </div>
                
                {renderInput('openai_api_key', 'API Key', 'sk-...')}
                
                <div className="integration-actions">
                  <a 
                    href="https://platform.openai.com/docs/guides/speech-to-text" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-link"
                  >
                    📚 Documentation
                  </a>
                </div>
              </div>

              <div className="integration-card">
                <div className="integration-header">
                  <div className="integration-info">
                    <h4>Deepgram</h4>
                    <p>Transcription en temps réel ultra-rapide</p>
                  </div>
                  <div className="integration-status">
                    {apiKeys.deepgram_api_key && <span className="status-badge connected">Configuré</span>}
                  </div>
                </div>
                
                {renderInput('deepgram_api_key', 'API Key', 'Votre Deepgram API Key')}
                
                <div className="integration-actions">
                  <a 
                    href="https://developers.deepgram.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-link"
                  >
                    📚 Documentation
                  </a>
                </div>
              </div>

              <div className="integration-card">
                <div className="integration-header">
                  <div className="integration-info">
                    <h4>AssemblyAI</h4>
                    <p>Transcription avec détection automatique de locuteurs</p>
                  </div>
                </div>
                
                {renderInput('assemblyai_api_key', 'API Key', 'Votre AssemblyAI API Key')}
              </div>

              <div className="integration-card">
                <div className="integration-header">
                  <div className="integration-info">
                    <h4>Azure Speech Services</h4>
                    <p>Service Microsoft de reconnaissance vocale</p>
                  </div>
                </div>
                
                {renderInput('azure_speech_key', 'Subscription Key', 'Votre Azure Speech Key')}
                {renderInput('azure_speech_region', 'Région', 'ex: westeurope')}
              </div>
            </div>
          )}

          {activeTab === 'productivity' && (
            <div className="settings-section">
              <h3>📋 Outils de Productivité</h3>
              <p className="section-description">
                Exportez automatiquement vos comptes-rendus et actions vers vos outils favoris.
              </p>

              <div className="integration-card">
                <div className="integration-header">
                  <div className="integration-info">
                    <h4>Notion</h4>
                    <p>Exportez vos notes directement vers Notion</p>
                  </div>
                </div>
                {renderInput('notion_api_key', 'Integration Token', 'secret_...')}
              </div>

              <div className="integration-card">
                <div className="integration-header">
                  <div className="integration-info">
                    <h4>Trello</h4>
                    <p>Créez des cartes automatiquement depuis les actions</p>
                  </div>
                </div>
                {renderInput('trello_api_key', 'API Key', 'Votre Trello API Key')}
              </div>

              <div className="integration-card">
                <div className="integration-header">
                  <div className="integration-info">
                    <h4>Asana</h4>
                    <p>Synchronisez vos tâches avec Asana</p>
                  </div>
                </div>
                {renderInput('asana_token', 'Personal Access Token', 'Votre Asana Token')}
              </div>

              <div className="integration-card">
                <div className="integration-header">
                  <div className="integration-info">
                    <h4>Jira</h4>
                    <p>Créez des tickets depuis vos actions</p>
                  </div>
                </div>
                {renderInput('jira_api_token', 'API Token', 'Votre Jira API Token')}
              </div>

              <div className="integration-card">
                <div className="integration-header">
                  <div className="integration-info">
                    <h4>Linear</h4>
                    <p>Gestion de projet moderne et rapide</p>
                  </div>
                </div>
                {renderInput('linear_api_key', 'API Key', 'lin_api_...')}
              </div>
            </div>
          )}

          {activeTab === 'general' && (
            <div className="settings-section">
              <h3>⚙️ Paramètres Généraux</h3>
              
              <div className="settings-field">
                <label>Langue par défaut</label>
                <select defaultValue="fr">
                  <option value="fr">Français</option>
                  <option value="en">Anglais</option>
                  <option value="es">Espagnol</option>
                  <option value="de">Allemand</option>
                  <option value="it">Italien</option>
                </select>
              </div>

              <div className="settings-field">
                <label>Qualité d'enregistrement</label>
                <select defaultValue="high">
                  <option value="high">Haute (recommandé)</option>
                  <option value="medium">Moyenne</option>
                  <option value="low">Basse</option>
                </select>
              </div>

              <div className="settings-field">
                <label>Format d'export par défaut</label>
                <select defaultValue="markdown">
                  <option value="markdown">Markdown (.md)</option>
                  <option value="pdf">PDF</option>
                  <option value="docx">Word (.docx)</option>
                  <option value="txt">Texte (.txt)</option>
                </select>
              </div>

              <div className="settings-field">
                <label className="checkbox-label">
                  <input type="checkbox" defaultChecked />
                  <span>Activer les notifications de bureau</span>
                </label>
              </div>

              <div className="settings-field">
                <label className="checkbox-label">
                  <input type="checkbox" defaultChecked />
                  <span>Sauvegarder automatiquement les transcriptions</span>
                </label>
              </div>

              <div className="settings-field">
                <label className="checkbox-label">
                  <input type="checkbox" />
                  <span>Mode sombre</span>
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="settings-footer">
          <button className="btn-secondary" onClick={onClose}>
            Annuler
          </button>
          <button className="btn-primary" onClick={handleSave}>
            💾 Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
}
