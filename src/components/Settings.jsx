import { useState, useEffect } from 'react';
import { User, Settings as SettingsIcon, Download, CreditCard, Bell, Palette, Globe, FileText, Save, Database, Trash2 } from 'lucide-react';
import authService from '../services/authService';
import storageService from '../utils/storage';
import stripeService from '../services/stripeService';
import toast from './Toast';
import '../styles/settings.css';

export default function Settings({ initialTab = 'profile' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [currentUser, setCurrentUser] = useState(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [userSessionsCount, setUserSessionsCount] = useState(0);
  const [legacyData, setLegacyData] = useState(null);
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
    plan: 'free',
    nextBillingDate: '2026-03-05',
    usage: {
      sessions: 42,
      maxSessions: 100,
      storage: 2.4,
      maxStorage: 10
    }
  });

  const plans = [
    { id: 'free', name: 'Free', price: '0€', desc: 'Pour découvrir' },
    { id: 'pro', name: 'Pro', price: '29,99€/mois', desc: 'Pour freelances' },
    { id: 'business', name: 'Business', price: '49,99€/membre', desc: 'Pour équipes' },
    { id: 'expert', name: 'Expert', price: '129,99€/membre', desc: 'Pour organisations' }
  ];

  useEffect(() => {
    const loadUserData = async () => {
      const user = await authService.getCurrentUser();
      if (user) {
        setCurrentUser(user);
        // Charger les settings isolés par utilisateur
        const localSettings = storageService.getSettings();
        
        // Compter les sessions de l'utilisateur
        const sessions = storageService.getAllSessions();
        setUserSessionsCount(sessions.length);
        
        // Détecter les anciennes données
        const legacy = storageService.detectLegacyData();
        setLegacyData(legacy);
        
        setSettings(prev => ({
          ...prev,
          ...localSettings,
          // Ne jamais écraser les données utilisateur réelles
          email: user.email,
          company: user.companyName || prev.company,
          plan: user.plan || 'free' // Toujours prendre le plan de la BDD
        }));
      }
    };
    loadUserData();
  }, []);

  const handleSave = () => {
    storageService.saveSettings(settings);
    toast.success('Paramètres sauvegardés avec succès !');
  };

  const handleChangePlan = async (newPlan) => {
    try {
      // Si l'utilisateur passe à un plan payant, rediriger vers Stripe
      if (newPlan !== 'free' && newPlan !== settings.plan) {
        // Initialiser Stripe
        await stripeService.initialize();
        
        // Afficher un message de chargement
        toast.info('Redirection vers la page de paiement...');
        
        // Rediriger vers Stripe Checkout
        try {
          await stripeService.createCheckoutSession(newPlan, currentUser.email);
        } catch (stripeError) {
          console.error('Erreur Stripe:', stripeError);
          toast.error('Le service de paiement n\'est pas encore configuré. Contactez support@meetizy.com');
        }
        return;
      }

      // Pour le plan gratuit ou downgrades, mise à jour directe
      await authService.updatePlan(newPlan);
      // Recharger les données utilisateur depuis la BDD pour être sûr
      const updatedUser = await authService.getCurrentUser();
      setCurrentUser(updatedUser);
      setSettings(prev => ({ ...prev, plan: updatedUser.plan }));
      setShowPlanModal(false);
      toast.success('Plan modifié avec succès !');
      // Forcer un rechargement de la page pour mettre à jour tous les composants
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      toast.error('Erreur lors de la modification du plan');
    }
  };

  const handleViewBillingHistory = async () => {
    try {
      // Si l'utilisateur a un abonnement payant, ouvrir le portail Stripe
      if (settings.plan !== 'free' && currentUser?.stripeCustomerId) {
        toast.info('Ouverture du portail de facturation...');
        await stripeService.createCustomerPortal(currentUser.stripeCustomerId);
      } else {
        toast.info('Historique de facturation disponible pour les abonnements payants');
      }
    } catch (error) {
      console.error('Erreur portail facturation:', error);
      toast.error('Impossible d\'accéder au portail de facturation');
    }
  };

  const handleContactSupport = () => {
    const subject = encodeURIComponent('Support Meetizy');
    const body = encodeURIComponent('Bonjour,\n\nJe souhaite être contacté pour un plan Enterprise.\n\nMerci.');
    const mailto = `mailto:support@meetizy.com?subject=${subject}&body=${body}`;
    try {
      window.location.href = mailto;
    } catch (error) {
      toast.info('Contactez support@meetizy.com');
    }
  };

  const handleClearUserData = () => {
    if (window.confirm(`ATTENTION : Cette action supprimera toutes vos ${userSessionsCount} sessions de manière irréversible. Continuer ?`)) {
      storageService.clearAllData();
      setUserSessionsCount(0);
      toast.success('Données supprimées avec succès');
    }
  };

  const handleClearAiReports = () => {
    if (window.confirm('Supprimer les rapports IA enregistrés (résumé, actions, décisions, email) pour régénérer avec Claude ?')) {
      const updated = storageService.clearAiReports();
      toast.success(`${updated} rapport(s) IA supprimé(s)`);
    }
  };

  const handleCleanOrphanSessions = () => {
    const orphans = storageService.getOrphanSessions();
    if (orphans.length === 0) {
      toast.info('Aucune session orpheline détectée');
      return;
    }

    if (window.confirm(`Vous avez ${orphans.length} session(s) orpheline(s) (sans propriétaire). Voulez-vous les supprimer ?`)) {
      const deleted = storageService.deleteOrphanSessions();
      toast.success(`${deleted} session(s) orpheline(s) supprimée(s)`);
      // Rafraîchir le compteur
      const currentCount = storageService.getAllSessions().length;
      setUserSessionsCount(currentCount);
    }
  };

  const getOrphanSessionsCount = () => {
    return storageService.getOrphanSessions().length;
  };

  const handleMigrateLegacyData = () => {
    const result = storageService.migrateLegacyDataToCurrentUser();
    if (result.success) {
      toast.success(`${result.count} type(s) de données récupérées avec succès !`);
      setLegacyData(storageService.detectLegacyData());
      // Rafraîchir la page pour voir les nouvelles données
      setTimeout(() => window.location.reload(), 1000);
    } else {
      toast.error('Erreur lors de la migration des données');
    }
  };

  const handleDeleteLegacyData = () => {
    if (window.confirm('Voulez-vous vraiment supprimer ces anciennes données ? Cette action est irréversible.')) {
      const count = storageService.deleteLegacyData();
      toast.success(`${count} anciennes données supprimées`);
      setLegacyData(storageService.detectLegacyData());
    }
  };

  const getPlanName = (planId) => {
    const plan = plans.find(p => p.id === planId);
    return plan ? plan.name : planId;
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
      alert('Le fichier doit faire moins de 2 Mo');
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
          <button 
            className={`settings-tab ${activeTab === 'data' ? 'active' : ''}`}
            onClick={() => setActiveTab('data')}
          >
            <Database size={16} /> Données
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
                    <h4>Plan {getPlanName(settings.plan)}</h4>
                    <p>Renouvellement le {new Date(settings.nextBillingDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                  <div className="plan-badge">{getPlanName(settings.plan)}</div>
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
                  <button className="btn-secondary" onClick={() => setShowPlanModal(true)}>Modifier l'abonnement</button>
                  <button className="btn-secondary" onClick={handleViewBillingHistory}>Historique de facturation</button>
                </div>
              </div>

              <div className="info-box">
                <p><strong>Besoin d'augmenter vos limites ?</strong></p>
                <p>Contactez notre équipe commerciale pour un plan Enterprise sur mesure.</p>
                <button className="btn-primary" onClick={handleContactSupport}>Contacter le support</button>
              </div>
            </div>
          )}

          {/* DATA TAB */}
          {activeTab === 'data' && (
            <div className="settings-section">
              <h3>Gestion des données</h3>
              
              <div style={{
                background: 'rgba(56, 189, 248, 0.05)',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '24px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <Database size={20} style={{ color: 'var(--accent)' }} />
                  <h4 style={{ margin: 0 }}>Sessions enregistrées</h4>
                </div>
                <p style={{ color: 'var(--muted)', marginBottom: '16px' }}>
                  Vous avez actuellement <strong style={{ color: 'var(--accent)' }}>{userSessionsCount}</strong> session(s) enregistrée(s) sur ce compte.
                </p>
                <div style={{ fontSize: '13px', color: 'var(--muted)' }}>
                  Info : Les sessions sont liées à votre compte utilisateur. Elles ne sont pas partagées avec d'autres utilisateurs.
                </div>
              </div>

              {/* Anciennes données détectées */}
              {legacyData?.hasAny && (
                <div style={{
                  background: 'rgba(251, 191, 36, 0.05)',
                  border: '1px solid rgba(251, 191, 36, 0.3)',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '24px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <Database size={20} style={{ color: '#fbbf24' }} />
                    <h4 style={{ margin: 0, color: '#fbbf24' }}>Anciennes données détectées</h4>
                  </div>
                  <p style={{ color: 'var(--muted)', marginBottom: '16px' }}>
                    Des données créées avant le système d'isolation des utilisateurs ont été détectées :
                  </p>
                  <ul style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '16px', marginLeft: '20px' }}>
                    {legacyData.hasTags && <li>Tags personnalisés</li>}
                    {legacyData.hasTemplates && <li>Templates personnalisés</li>}
                    {legacyData.hasSettings && <li>Paramètres</li>}
                    {legacyData.hasStats && <li>Statistiques</li>}
                  </ul>
                  <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '16px' }}>
                    Ces données peuvent vous appartenir. Vous pouvez les récupérer et les associer à votre compte, ou les supprimer.
                  </p>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                      onClick={handleMigrateLegacyData}
                      style={{
                        padding: '10px 20px',
                        background: '#fbbf24',
                        color: '#1f2937',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: '0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#f59e0b'}
                      onMouseLeave={(e) => e.target.style.background = '#fbbf24'}
                    >
                      Récupérer ces données
                    </button>
                    <button 
                      onClick={handleDeleteLegacyData}
                      style={{
                        padding: '10px 20px',
                        background: 'transparent',
                        color: '#ef4444',
                        border: '1px solid #ef4444',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: '0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.1)'}
                      onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              )}

              {/* Sessions orphelines */}
              {getOrphanSessionsCount() > 0 && (
                <div style={{
                  background: 'rgba(251, 191, 36, 0.05)',
                  border: '1px solid rgba(251, 191, 36, 0.3)',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '24px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <Database size={20} style={{ color: '#fbbf24' }} />
                    <h4 style={{ margin: 0, color: '#fbbf24' }}>Sessions orphelines détectées</h4>
                  </div>
                  <p style={{ color: 'var(--muted)', marginBottom: '16px' }}>
                    Vous avez <strong style={{ color: '#fbbf24' }}>{getOrphanSessionsCount()}</strong> session(s) sans propriétaire (créées avant le système d'isolation des utilisateurs).
                  </p>
                  <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '16px' }}>
                    Ces sessions peuvent appartenir à un autre compte ou être des données de test. Il est recommandé de les supprimer pour éviter toute confusion.
                  </p>
                  <button 
                    onClick={handleCleanOrphanSessions}
                    style={{
                      padding: '10px 20px',
                      background: '#fbbf24',
                      color: '#1f2937',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: '0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#f59e0b'}
                    onMouseLeave={(e) => e.target.style.background = '#fbbf24'}
                  >
                    Nettoyer les sessions orphelines
                  </button>
                </div>
              )}

              <div style={{
                background: 'rgba(239, 68, 68, 0.05)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '12px',
                padding: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <Trash2 size={20} style={{ color: '#ef4444' }} />
                  <h4 style={{ margin: 0, color: '#ef4444' }}>Zone de danger</h4>
                </div>
                <p style={{ color: 'var(--muted)', marginBottom: '16px' }}>
                  Supprimez toutes vos sessions de manière irréversible. Cette action ne peut pas être annulée.
                </p>
                <button 
                  onClick={handleClearAiReports}
                  style={{
                    padding: '10px 20px',
                    background: 'transparent',
                    color: '#ef4444',
                    border: '1px solid rgba(239, 68, 68, 0.6)',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: '0.2s',
                    marginRight: '12px'
                  }}
                  onMouseEnter={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.1)'}
                  onMouseLeave={(e) => e.target.style.background = 'transparent'}
                >
                  Purger les rapports IA
                </button>
                <button 
                  onClick={handleClearUserData}
                  style={{
                    padding: '10px 20px',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: '0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#dc2626'}
                  onMouseLeave={(e) => e.target.style.background = '#ef4444'}
                >
                  Supprimer toutes mes sessions
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PLAN CHANGE MODAL */}
      {showPlanModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          backdropFilter: 'blur(4px)'
        }} onClick={() => setShowPlanModal(false)}>
          <div style={{
            background: 'var(--panel)',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '600px',
            width: '90%',
            border: '1px solid var(--border)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
          }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: '24px', color: 'var(--text)' }}>Changer de plan</h2>
            <div style={{ display: 'grid', gap: '16px' }}>
              {plans.map(plan => (
                <div key={plan.id} style={{
                  padding: '20px',
                  border: settings.plan === plan.id ? '2px solid var(--accent)' : '1px solid var(--border)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  background: settings.plan === plan.id ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                  transition: '0.2s'
                }} onClick={() => handleChangePlan(plan.id)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ color: 'var(--text)', marginBottom: '4px' }}>{plan.name}</h3>
                      <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '8px' }}>{plan.desc}</p>
                      <p style={{ color: 'var(--accent)', fontSize: '18px', fontWeight: '600' }}>{plan.price}</p>
                    </div>
                    {settings.plan === plan.id && (
                      <div style={{ color: 'var(--accent)', fontWeight: '600' }}>Actuel</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button style={{
              marginTop: '24px',
              width: '100%',
              padding: '12px',
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--text)',
              cursor: 'pointer'
            }} onClick={() => setShowPlanModal(false)}>Annuler</button>
          </div>
        </div>
      )}
    </div>
  );
}
