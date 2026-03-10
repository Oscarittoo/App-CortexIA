import { useState, useEffect } from 'react';
import { 
  History, 
  LayoutDashboard, 
  PlusCircle, 
  CheckSquare, 
  FileText, 
  Settings, 
  LogOut, 
  Bell,
  Shield,
  Users,
  Calendar as CalendarIcon,
  CreditCard,
  ChevronsLeft,
  ChevronsRight,
  Sparkles,
  Download
} from 'lucide-react';
import Home from './components/Home';
import Features from './components/Features';
import Integrations from './components/Integrations';
import Security from './components/Security';
import Demo from './components/Demo';
import ApiDocs from './components/ApiDocs';
import NewSession from './components/NewSession';
import ActiveSession from './components/ActiveSession';
import SessionReport from './components/SessionReport';
import Dashboard from './components/Dashboard';
import SessionsHistory from './components/SessionsHistory';
import SessionEditor from './components/SessionEditor';
import Pricing from './components/Pricing';
import Login from './components/Login';
import PluginInstall from './components/PluginInstall';
import AdminDashboard from './components/AdminDashboard';
import ActionsDashboard from './components/actions/ActionsDashboard';
import TemplatesLibrary from './components/templates/TemplatesLibrary';
import SettingsPage from './components/Settings';
import Teams from './components/Teams';
import Calendar from './components/Calendar';
import AgentInstall from './components/AgentInstall';
import ChatBot from './components/ChatBot';
import ResetPassword from './components/ResetPassword';
import ErrorBoundary from './components/ErrorBoundary';
import { Toaster } from './components/Toast';
import toast from './components/Toast';
import logo from './assets/logo_brain_circuit.svg';
import authService from './services/authService';
import storageService from './utils/storage';
import { loadFeatureFlags } from './config/featureFlags';
import { supabase } from './services/supabaseClient';

// Import New Theme - Replaces design-system.css and app.css
import './styles/theme-premium.css';
import './styles/home.css';             
import './styles/dashboard.css';
import './styles/sessions-history.css';
import './styles/public-pages.css';
import './styles/editor.css';
// import './styles/active-session-fix.css'; // Removed in favor of inline styles for reliability

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [sessionData, setSessionData] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [editingSession, setEditingSession] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState('free');
  const [isChatBotOpen, setIsChatBotOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    // Charger les feature flags depuis localStorage (overrides)
    loadFeatureFlags();

    const loadUser = async () => {
      setIsAuthLoading(true);
      try {
        const user = await authService.getCurrentUser();
        if (user) {
          setIsAuthenticated(true);
          setCurrentUser(user);
          storageService.setCurrentUser(user.id);
        } else {
          setIsAuthenticated(false);
          setCurrentUser(null);
          storageService.setCurrentUser(null);
          if (currentView !== 'home' && currentView !== 'features' && currentView !== 'integrations' && 
              currentView !== 'security' && currentView !== 'demo' && currentView !== 'pricing' && 
              currentView !== 'login' && currentView !== 'agent-install' && currentView !== 'api-docs') {
            setCurrentView('home');
            toast.error('Votre session a expiré. Veuillez vous reconnecter.');
          }
        }
      } finally {
        setIsAuthLoading(false);
      }
    };
    loadUser();

    // Écouter les événements Supabase (récupération de mot de passe, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setCurrentView('reset-password');
      }
    });

    // Exposer les services uniquement en développement
    if (import.meta.env?.DEV && typeof window !== 'undefined') {
      window.storageService = storageService;
      window.authService = authService;
      console.log('Services de débogage disponibles: window.storageService, window.authService');
    }

    return () => subscription?.unsubscribe();
  }, []);

  // Mettre à jour l'activité lors des interactions utilisateur
  useEffect(() => {
    if (isAuthenticated) {
      authService.updateLastActivity();
    }
  }, [currentView, isAuthenticated]);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      setCurrentView('new');
    } else {
      setCurrentView('login');
    }
  };

  const handleStartSession = (config) => {
    const session = { 
      ...config, 
      startTime: Date.now(),
      id: `session-${Date.now()}`,
      transcript: []
    };
    setSessionData(session);
    setCurrentView('active');
  };

  const handleEndSession = (transcript, duration, aiAnalysis = {}) => {
    const data = {
      ...sessionData,
      id: sessionData.id || `session-${Date.now()}`,
      transcript,
      duration,
      endTime: Date.now(),
      detectedActions: aiAnalysis.detectedActions || [],
      detectedDecisions: aiAnalysis.detectedDecisions || []
    };
    
    // Sauvegarder immédiatement la session dans le storage
    console.log('Sauvegarde de la session:', data);
    try {
      storageService.saveSession(data);
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la sauvegarde de la session');
    }
    
    setReportData(data);
    setCurrentView('report');
  };

  const handleNewSession = () => {
    setSessionData(null);
    setReportData(null);
    setCurrentView('new');
  };

  const handleGoHome = () => {
    setCurrentView('home');
  };

  const handleViewSession = (session) => {
    setReportData(session);
    setCurrentView('report');
  };

  const handleLogout = async () => {
    await authService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    storageService.setCurrentUser(null);
    setCurrentView('home');
    toast.success('Déconnexion réussie');
  };

  const handleLogin = (user) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
    // IMPORTANT: Informer le storageService de l'utilisateur connecté
    storageService.setCurrentUser(user.id);
    // Migration automatique des sessions orphelines (créées avant isolation userId)
    const migratedCount = storageService.assignOrphanSessions(user.id);
    if (migratedCount > 0) {
      console.log(`${migratedCount} session(s) orpheline(s) migrée(s) vers l'utilisateur ${user.id}`);
    }
    // Redirect to dashboard normally, but if they were somewhere else
    setCurrentView('dashboard');
  };

  const handleEditSession = (session) => {
    setEditingSession(session);
  };

  const handleSaveEdit = (updatedSession) => {
    setEditingSession(null);
    setReportData({ ...updatedSession });
    toast.success('Session mise à jour');
  };
  
  const handleSelectPlan = (plan) => {
    console.log("Selected plan", plan); 
    setSelectedPlan(plan);
    setCurrentView('login');
  }

  // AUTH LOADING SPINNER
  if (isAuthLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0a0a19' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '3px solid rgba(56,189,248,0.2)', borderTopColor: '#38bdf8', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>Chargement...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // PUBLIC LAYOUT
  if (!isAuthenticated) {
    const navItems = [
      { view: 'home', label: 'Accueil' },
      { view: 'features', label: 'Fonctionnalités' },
      { view: 'integrations', label: 'Intégrations' },
      { view: 'pricing', label: 'Prix' },
      { view: 'demo', label: 'Démo' },
    ];
    return (
      <ErrorBoundary>
        <div className="app-public">
          <Toaster />

          {/* NAV DESKTOP */}
          <nav style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 28px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(10,10,25,0.85)',
            backdropFilter: 'blur(12px)',
            position: 'sticky', top: 0, zIndex: 100,
            width: '100%',
          }}>
            <div onClick={handleGoHome} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <img src={logo} alt="Meetizy Logo" width="40" height="40" />
              <span style={{ fontFamily: 'Orbitron, sans-serif', fontWeight: '700', fontSize: '20px', letterSpacing: '1px', color: '#ffffff' }}>MEETIZY</span>
            </div>

            {/* Links desktop */}
            <div className="public-nav-links" style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              {navItems.map(item => (
                <a key={item.view} className={`nav-item ${currentView === item.view ? 'active' : ''}`} onClick={() => setCurrentView(item.view)}>
                  {item.label}
                </a>
              ))}
              <button
                onClick={() => setCurrentView('agent-install')}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.3)', borderRadius: '8px', color: '#38bdf8', fontSize: '13px', fontWeight: '600', cursor: 'pointer', marginLeft: '8px' }}
              >
                <Download size={14} />
                Installer l'assistant
              </button>
              <button className="btn btn-primary" onClick={() => setCurrentView('login')} style={{ marginLeft: '4px' }}>
                Connexion
              </button>
            </div>

            {/* Hamburger mobile */}
            <button
              className="public-nav-toggle"
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              aria-label="Menu"
            >
              {isMobileNavOpen ? '✕' : '☰'}
            </button>
          </nav>

          {/* Mobile nav dropdown */}
          <div className={`public-nav-mobile ${isMobileNavOpen ? 'open' : ''}`}>
            {navItems.map(item => (
              <a key={item.view} className={`nav-item ${currentView === item.view ? 'active' : ''}`}
                onClick={() => { setCurrentView(item.view); setIsMobileNavOpen(false); }}>
                {item.label}
              </a>
            ))}
            <button
              onClick={() => { setCurrentView('agent-install'); setIsMobileNavOpen(false); }}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.3)', borderRadius: '8px', color: '#38bdf8', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
            >
              <Download size={14} /> Installer l'assistant
            </button>
            <button className="btn btn-primary" onClick={() => { setCurrentView('login'); setIsMobileNavOpen(false); }} style={{ width: '100%' }}>
              Connexion
            </button>
          </div>

          <main style={{ flex: 1 }}>
            {currentView === 'home' && <Home onGetStarted={handleGetStarted} onViewDemo={() => setCurrentView('demo')} />}
            {currentView === 'features' && <Features onGetStarted={handleGetStarted} />}
            {currentView === 'integrations' && <Integrations onGetStarted={handleGetStarted} onViewDocs={() => setCurrentView('api-docs')} />}
            {currentView === 'security' && <Security onGetStarted={handleGetStarted} />}
            {currentView === 'demo' && <Demo onGetStarted={handleGetStarted} />}
            {currentView === 'pricing' && <Pricing onSelectPlan={handleSelectPlan} />}
            {currentView === 'agent-install' && <AgentInstall />}
            {currentView === 'api-docs' && <ApiDocs onBack={() => setCurrentView('integrations')} />}
            {currentView === 'login' && <Login onLogin={handleLogin} onBack={() => setCurrentView('home')} selectedPlan={selectedPlan} />}
            {currentView === 'reset-password' && <ResetPassword onDone={() => setCurrentView('login')} />}
          </main>

          <footer style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)', borderTop: '1px solid var(--border)' }}>
            <p>© 2026 MEETIZY · Premium AI Assistant</p>
          </footer>
        </div>
      </ErrorBoundary>
    );
  }

  // AUTHENTICATED PREMIUM LAYOUT
  // Using the new .sidebar and .main structure
  return (
    <ErrorBoundary>
      <div className="app-premium">
        <Toaster />
        
        {/* SIDEBAR */}
        <aside className={`sidebar${isMobileSidebarOpen ? ' open' : ''}`} style={{ width: isSidebarCollapsed ? '80px' : '280px', minWidth: isSidebarCollapsed ? '80px' : '280px', transition: 'width 0.3s ease, min-width 0.3s ease, left 0.3s ease', position: 'relative' }}>
          <div className="brand" style={{ flexDirection: isSidebarCollapsed ? 'column' : 'row', gap: isSidebarCollapsed ? '8px' : '10px', padding: isSidebarCollapsed ? '20px 10px' : '20px' }}>
            <img src={logo} alt="Meetizy Logo" width={isSidebarCollapsed ? "32" : "64"} height={isSidebarCollapsed ? "32" : "64"} style={{ transition: 'all 0.3s ease' }} />
            {!isSidebarCollapsed && (
              <span style={{ fontFamily: 'Orbitron, sans-serif', letterSpacing: '1px', fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)' }}>MEETIZY</span>
            )}
          </div>

          <nav>
            <a className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`} onClick={() => setCurrentView('dashboard')} title="Tableau de bord">
              <LayoutDashboard size={18} /> {!isSidebarCollapsed && <span>Tableau de bord</span>}
            </a>
            <a className={`nav-item ${currentView === 'new' || currentView === 'active' ? 'active' : ''}`} onClick={() => setCurrentView('new')} title="Nouvelle session">
              <PlusCircle size={18} /> {!isSidebarCollapsed && <span>Nouvelle session</span>}
            </a>
            <a className={`nav-item ${currentView === 'history' ? 'active' : ''}`} onClick={() => setCurrentView('history')} title="Historique">
              <History size={18} /> {!isSidebarCollapsed && <span>Historique</span>}
            </a>
            <a className={`nav-item ${currentView === 'actions' ? 'active' : ''}`} onClick={() => setCurrentView('actions')} title="Actions">
              <CheckSquare size={18} /> {!isSidebarCollapsed && <span>Actions</span>}
            </a>
            <a className={`nav-item ${currentView === 'templates' ? 'active' : ''}`} onClick={() => setCurrentView('templates')} title="Templates">
              <FileText size={18} /> {!isSidebarCollapsed && <span>Templates</span>}
            </a>
            
            {/* Nouvelles sections */}
            <a className={`nav-item ${currentView === 'teams' ? 'active' : ''}`} onClick={() => setCurrentView('teams')} title="Équipes">
              <Users size={18} /> {!isSidebarCollapsed && <span>Équipes</span>}
            </a>
            <a className={`nav-item ${currentView === 'calendar' ? 'active' : ''}`} onClick={() => setCurrentView('calendar')} title="Calendrier">
              <CalendarIcon size={18} /> {!isSidebarCollapsed && <span>Calendrier</span>}
            </a>
            <a className={`nav-item ${currentView === 'subscription' ? 'active' : ''}`} onClick={() => setCurrentView('subscription')} title="Mon abonnement">
              <CreditCard size={18} /> {!isSidebarCollapsed && <span>Mon abonnement</span>}
            </a>
            
            {/* Bouton Réduire */}
            <a className="nav-item" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} title={isSidebarCollapsed ? 'Agrandir le menu' : 'Réduire le menu'} style={{ marginTop: '8px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
              {isSidebarCollapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
              {!isSidebarCollapsed && <span>Réduire</span>}
            </a>
            
            {/* 
            {currentUser?.role === 'admin' && (
              <a className={`nav-item ${currentView === 'admin' ? 'active' : ''}`} onClick={() => setCurrentView('admin')}>
                <Shield size={18} /> Admin
              </a>
            )} 
            */}
          </nav>

          <div className="sidebar-footer" style={{ flexDirection: isSidebarCollapsed ? 'column' : 'row', gap: isSidebarCollapsed ? '8px' : '12px', padding: isSidebarCollapsed ? '12px' : '16px' }}>
            {!isSidebarCollapsed ? (
              <>
                <div className="user-profile">
                  <div className="user-avatar">{currentUser?.email?.substring(0, 2).toUpperCase()}</div>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text)', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{currentUser?.email}</div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'capitalize' }}>
                      {currentUser?.plan === 'free' ? 'Free' : 
                       currentUser?.plan === 'pro' ? 'Pro' : 
                       currentUser?.plan === 'business' ? 'Business' : 
                       currentUser?.plan === 'expert' ? 'Expert' : 'Free'} Plan
                    </div>
                  </div>
                </div>
                <button className="btn-icon-premium" onClick={handleLogout} title="Déconnexion">
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <button className="btn-icon-premium" onClick={handleLogout} title="Déconnexion" style={{ width: '100%', justifyContent: 'center' }}>
                <LogOut size={16} />
              </button>
            )}
          </div>
        </aside>

        {/* MAIN AREA */}
        <main className="main">
          {/* TOPBAR */}
          <div className="topbar">
            {/* Hamburger mobile — visible uniquement sous 900px */}
            <button
              className="btn-icon-premium sidebar-mobile-toggle"
              onClick={() => setIsMobileSidebarOpen(v => !v)}
              title="Menu"
              style={{ display: 'none' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <div className="topbar-actions">
              <button
                className="btn-icon-premium"
                title="Notifications"
                onClick={() => toast.info('Aucune notification pour le moment')}
              >
                <Bell size={18} />
              </button>
              <button 
                className="btn-icon-premium" 
                title="Paramètres"
                onClick={() => setCurrentView('settings')}
              >
                <Settings size={18} />
              </button>
            </div>
          </div>

          <div className="content-area">
             {currentView === 'dashboard' && <Dashboard onNewSession={() => setCurrentView('new')} />}
             
             {currentView === 'new' && <NewSession onStart={handleStartSession} />}
             
             {currentView === 'active' && (
                <ActiveSession config={sessionData} onEnd={handleEndSession} userPlan={currentUser?.plan || 'free'} />
             )}

             {currentView === 'report' && (
                <SessionReport
                  data={reportData}
                  onNewSession={handleNewSession}
                  onEdit={() => handleEditSession(reportData)}
                  isSidebarCollapsed={isSidebarCollapsed}
                />
             )}

             {currentView === 'history' && (
               <SessionsHistory 
                 onViewSession={handleViewSession}
                 onEditSession={handleEditSession}
                 onNewSession={handleNewSession}
               />
             )}

             {currentView === 'actions' && <ActionsDashboard />}
             
             {currentView === 'templates' && <TemplatesLibrary />}
             
             {currentView === 'teams' && <Teams currentUser={currentUser} />}
             
             {currentView === 'calendar' && <Calendar />}
             
             {currentView === 'agent-install' && <AgentInstall />}
             
             {currentView === 'subscription' && <SettingsPage initialTab="subscription" />}
             
             {currentView === 'settings' && <SettingsPage />}
             
             {/* {currentView === 'admin' && <AdminDashboard />} */}
          </div>
        </main>

        {/* Backdrop mobile sidebar */}
        {isMobileSidebarOpen && (
          <div
            onClick={() => setIsMobileSidebarOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 49 }}
          />
        )}

        {editingSession && (
          <SessionEditor
            session={editingSession}
            onSave={handleSaveEdit}
            onClose={() => setEditingSession(null)}
          />
        )}

        {/* ChatBot IA */}
        <ChatBot isOpen={isChatBotOpen} onClose={() => setIsChatBotOpen(false)} />

        {/* Bouton flottant ChatBot */}
        {!isChatBotOpen && (
          <button
            onClick={() => setIsChatBotOpen(true)}
            style={{
              position: 'fixed',
              bottom: '24px',
              right: '24px',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
              transition: 'all 0.3s ease',
              zIndex: 999
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.1)';
              e.target.style.boxShadow = '0 12px 32px rgba(102, 126, 234, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.4)';
            }}
            title="Assistant intelligent"
          >
            <Sparkles size={28} />
          </button>
        )}
      </div>
    </ErrorBoundary>
  );
}
