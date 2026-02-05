import { useState, useEffect } from 'react';
import { User, Settings as SettingsIcon, Download, CreditCard, Bell, Palette, Globe, FileText, Save } from 'lucide-react';
import '../styles/settings.css';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState({
    // Profile
    fullName: 'Jean Dupont',
    email: 'jean.dupont@entreprise.fr',
    company: 'Entreprise SAS',
    position: 'Directeur Commercial',
    
    // Preferences
    language: 'fr',
    theme: 'dark',
    notifications: true,
    autoSave: true,
    
    // Export
    defaultFormat: 'pdf',
    companyLogo: null,
    includeLogo: true,
    
    // Subscription
    plan: 'Professional',
    nextBillingDate: '2026-03-05',
    usage: {
      sessions: 42,
      maxSessions: 100,
      storage: 2.4,
      maxStorage: 10
    }
  });

  useEffect(() => {
    const savedSettings = localStorage.getItem('cortexia_settings');
    if (savedSettings) {
      setSettings({ ...settings, ...JSON.parse(savedSettings) });
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('cortexia_settings', JSON.stringify(settings));
    alert('✅ Paramètres sauvegardés avec succès !');
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 2 * 1024 * 1024) { // 2MB max
      const reader = new FileReader();
      reader.onload = (event) => {
        setSettings({ ...settings, companyLogo: event.target.result });
      };
      reader.readAsDataURL(file);
    } else {
      alert('⚠️ Le fichier doit faire moins de 2 Mo');
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-container">
        <div className="settings-header">
          <div className="settings-title">
            <SettingsIcon size={28} />
            <h1>Paramètres</h1>
          </div>
          <button className="btn-save" onClick={handleSave}>
            <Save size={18} />
            Sauvegarder
          </button>
        </div>

        <div className="settings-tabs">
          <button 
            className={`settings-tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={16} /> Profil
          </button>
          <button 
            className={`settings-tab ${activeTab === 'preferences' ? 'active' : ''}`}
            onClick={() => setActiveTab('preferences')}
          >
            <Palette size={16} /> Préférences
          </button>
          <button 
            className={`settings-tab ${activeTab === 'exports' ? 'active' : ''}`}
            onClick={() => setActiveTab('exports')}
          >
            <Download size={16} /> Exports
          </button>
          <button 
            className={`settings-tab ${activeTab === 'subscription' ? 'active' : ''}`}
            onClick={() => setActiveTab('subscription')}
          >
            <CreditCard size={16} /> Abonnement
          </button>
        </div>

        <div className="settings-content">
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="settings-section">
              <h3>Informations personnelles</h3>
              <p className="section-description">
                Ces informations seront affichées sur vos rapports et documents exportés.
              </p>

              <div className="settings-field">
                <label>Nom complet</label>
                <input
                  type="text"
                  value={settings.fullName}
                  onChange={(e) => setSettings({ ...settings, fullName: e.target.value })}
                  placeholder="Jean Dupont"
                />
              </div>

              <div className="settings-field">
                <label>Email professionnel</label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  placeholder="jean.dupont@entreprise.fr"
                />
              </div>

              <div className="settings-field">
                <label>Entreprise</label>
                <input
                  type="text"
                  value={settings.company}
                  onChange={(e) => setSettings({ ...settings, company: e.target.value })}
                  placeholder="Nom de votre entreprise"
                />
              </div>

              <div className="settings-field">
                <label>Poste / Fonction</label>
                <input
                  type="text"
                  value={settings.position}
                  onChange={(e) => setSettings({ ...settings, position: e.target.value })}
                  placeholder="Directeur Commercial"
                />
              </div>
            </div>
          )}

          {/* PREFERENCES TAB */}
          {activeTab === 'preferences' && (
            <div className="settings-section">
              <h3>Préférences d'utilisation</h3>
              
              <div className="settings-field">
                <label><Globe size={16} /> Langue de l'interface</label>
                <select 
                  value={settings.language}
                  onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="de">Deutsch</option>
                  <option value="it">Italiano</option>
                </select>
              </div>

              <div className="settings-field">
                <label><Palette size={16} /> Thème de l'interface</label>
                <select 
                  value={settings.theme}
                  onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
                >
                  <option value="dark">Sombre (NovaPulse)</option>
                  <option value="light">Clair</option>
                  <option value="auto">Automatique (système)</option>
                </select>
              </div>

              <div className="settings-field">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={settings.notifications}
                    onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })}
                  />
                  <span><Bell size={16} /> Activer les notifications de bureau</span>
                </label>
                <p className="field-hint">Recevez une alerte lorsqu'une transcription est terminée.</p>
              </div>

              <div className="settings-field">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={settings.autoSave}
                    onChange={(e) => setSettings({ ...settings, autoSave: e.target.checked })}
                  />
                  <span>Sauvegarde automatique des sessions</span>
                </label>
                <p className="field-hint">Les transcriptions sont sauvegardées toutes les 30 secondes.</p>
              </div>

              <div className="settings-field">
                <label>Raccourcis clavier</label>
                <div className="shortcuts-list">
                  <div className="shortcut-item">
                    <span className="shortcut-label">Nouvelle session</span>
                    <kbd>Ctrl</kbd> + <kbd>N</kbd>
                  </div>
                  <div className="shortcut-item">
                    <span className="shortcut-label">Rechercher</span>
                    <kbd>Ctrl</kbd> + <kbd>F</kbd>
                  </div>
                  <div className="shortcut-item">
                    <span className="shortcut-label">Paramètres</span>
                    <kbd>Ctrl</kbd> + <kbd>,</kbd>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* EXPORTS TAB */}
          {activeTab === 'exports' && (
            <div className="settings-section">
              <h3>Configuration des exports</h3>
              
              <div className="settings-field">
                <label><FileText size={16} /> Format par défaut</label>
                <select 
                  value={settings.defaultFormat}
                  onChange={(e) => setSettings({ ...settings, defaultFormat: e.target.value })}
                >
                  <option value="pdf">PDF (Recommandé)</option>
                  <option value="docx">Word (.docx)</option>
                  <option value="markdown">Markdown (.md)</option>
                  <option value="txt">Texte brut (.txt)</option>
                </select>
                <p className="field-hint">Les rapports seront exportés dans ce format par défaut.</p>
              </div>

              <div className="settings-field">
                <label>Logo de votre entreprise</label>
                <div className="logo-upload">
                  {settings.companyLogo ? (
                    <div className="logo-preview">
                      <img src={settings.companyLogo} alt="Logo" />
                      <button 
                        className="btn-remove"
                        onClick={() => setSettings({ ...settings, companyLogo: null })}
                      >
                        Supprimer
                      </button>
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleLogoUpload}
                        id="logo-upload"
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="logo-upload" className="upload-btn">
                        <Download size={20} />
                        Télécharger un logo
                      </label>
                      <p>PNG, JPG ou SVG (max 2 Mo)</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="settings-field">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={settings.includeLogo}
                    onChange={(e) => setSettings({ ...settings, includeLogo: e.target.checked })}
                  />
                  <span>Inclure le logo sur les exports PDF</span>
                </label>
              </div>
            </div>
          )}

          {/* SUBSCRIPTION TAB */}
          {activeTab === 'subscription' && (
            <div className="settings-section">
              <h3>Abonnement & Facturation</h3>
              
              <div className="subscription-card">
                <div className="subscription-header">
                  <div>
                    <h4>Plan {settings.plan}</h4>
                    <p>Renouvellement le {new Date(settings.nextBillingDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                  <div className="plan-badge">{settings.plan}</div>
                </div>

                <div className="usage-stats">
                  <div className="usage-item">
                    <div className="usage-header">
                      <span>Sessions ce mois</span>
                      <span className="usage-count">{settings.usage.sessions} / {settings.usage.maxSessions}</span>
                    </div>
                    <div className="usage-bar">
                      <div 
                        className="usage-fill" 
                        style={{ width: `${(settings.usage.sessions / settings.usage.maxSessions) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="usage-item">
                    <div className="usage-header">
                      <span>Stockage utilisé</span>
                      <span className="usage-count">{settings.usage.storage} GB / {settings.usage.maxStorage} GB</span>
                    </div>
                    <div className="usage-bar">
                      <div 
                        className="usage-fill" 
                        style={{ width: `${(settings.usage.storage / settings.usage.maxStorage) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="subscription-actions">
                  <button className="btn-secondary">Modifier l'abonnement</button>
                  <button className="btn-secondary">Historique de facturation</button>
                </div>
              </div>

              <div className="info-box">
                <p><strong>Besoin d'augmenter vos limites ?</strong></p>
                <p>Contactez notre équipe commerciale pour un plan Enterprise sur mesure.</p>
                <button className="btn-primary">Contacter le support</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
