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
import ErrorBoundary from './components/ErrorBoundary';
import { Toaster } from './components/Toast';
import toast from './components/Toast';
import logo from './assets/logo_brain_circuit.svg';
import authService from './services/authService';
import storageService from './utils/storage';

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

  useEffect(() => {
    const loadUser = async () => {
      const user = await authService.getCurrentUser();
      if (user) {
        setIsAuthenticated(true);
        setCurrentUser(user);
        // IMPORTANT: Informer le storageService de l'utilisateur connecté
        storageService.setCurrentUser(user.id);
      } else {
        // Session expirée ou non connecté
        setIsAuthenticated(false);
        setCurrentUser(null);
        storageService.setCurrentUser(null);
        if (currentView !== 'home' && currentView !== 'features' && currentView !== 'integrations' && 
            currentView !== 'security' && currentView !== 'demo' && currentView !== 'pricing' && 
            currentView !== 'login' && currentView !== 'plugin-install' && currentView !== 'api-docs') {
          // L'utilisateur était sur une page authentifiée mais la session a expiré
          setCurrentView('home');
          toast.error('Votre session a expiré. Veuillez vous reconnecter.');
        }
      }
    };
    loadUser();

    // Exposer les services dans la console pour le débogage
    if (typeof window !== 'undefined') {
      window.storageService = storageService;
      window.authService = authService;
      console.log('Services de débogage disponibles: window.storageService, window.authService');
    }
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
    storageService.saveSession(data);
    
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

  // PUBLIC LAYOUT
  if (!isAuthenticated) {
    return (
      <ErrorBoundary>
        <div className="app-public">
          <Toaster />
          <nav className="topbar" style={{ margin: '18px', width: 'auto' }}>
            <div className="brand" onClick={handleGoHome} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
               <div className="logo-icon">
                 <img src={logo} alt="Meetizy Logo" width="72" height="72" />
               </div>
               <span style={{ fontFamily: 'Orbitron, sans-serif', fontWeight: '700', fontSize: '24px', letterSpacing: '1px', color: '#ffffff' }}>MEETIZY</span>
            </div>
            
            <div style={{ display: 'flex', gap: '20px', marginLeft: 'auto', alignItems: 'center' }}>
               <a className={`nav-item ${currentView === 'home' ? 'active' : ''}`} onClick={() => setCurrentView('home')}>Accueil</a>
               <a className={`nav-item ${currentView === 'features' ? 'active' : ''}`} onClick={() => setCurrentView('features')}>Fonctionnalités</a>
               <a className={`nav-item ${currentView === 'integrations' ? 'active' : ''}`} onClick={() => setCurrentView('integrations')}>Intégrations</a>
               <a className={`nav-item ${currentView === 'pricing' ? 'active' : ''}`} onClick={() => setCurrentView('pricing')}>Prix</a>
               <a className={`nav-item ${currentView === 'demo' ? 'active' : ''}`} onClick={() => setCurrentView('demo')}>Démo</a>
               
               <button 
                 className="btn-plugin" 
                 onClick={() => setCurrentView('plugin-install')}
                 style={{
                   display: 'flex',
                   alignItems: 'center',
                   gap: '8px',
                   padding: '10px 20px',
                   background: 'rgba(56, 189, 248, 0.1)',
                   border: '1px solid rgba(56, 189, 248, 0.3)',
                   borderRadius: '8px',
                   color: '#38bdf8',
                   fontSize: '14px',
                   fontWeight: '600',
                   cursor: 'pointer',
                   transition: 'all 0.2s'
                 }}
                 onMouseEnter={(e) => {
                   e.target.style.background = 'rgba(56, 189, 248, 0.2)';
                   e.target.style.borderColor = '#38bdf8';
                 }}
                 onMouseLeave={(e) => {
                   e.target.style.background = 'rgba(56, 189, 248, 0.1)';
                   e.target.style.borderColor = 'rgba(56, 189, 248, 0.3)';
                 }}
               >
                 <Download size={16} />
                 Installer l'assistant interactif
               </button>
               
               <button className="btn btn-primary" onClick={() => setCurrentView('login')}>
                 Connexion
               </button>
            </div>
          </nav>

          <main style={{ minHeight: 'calc(100vh - 200px)' }}> 
            {currentView === 'home' && <Home onGetStarted={handleGetStarted} onViewDemo={() => setCurrentView('demo')} />}
            {currentView === 'features' && <Features onGetStarted={handleGetStarted} />}
            {currentView === 'integrations' && <Integrations onGetStarted={handleGetStarted} onViewDocs={() => setCurrentView('api-docs')} />}
            {currentView === 'security' && <Security onGetStarted={handleGetStarted} />}
            {currentView === 'demo' && <Demo onGetStarted={handleGetStarted} />}
            {currentView === 'pricing' && <Pricing onSelectPlan={handleSelectPlan} />}
            {currentView === 'plugin-install' && <PluginInstall onBack={() => setCurrentView('home')} />}
            {currentView === 'api-docs' && <ApiDocs onBack={() => setCurrentView('integrations')} />}
            {currentView === 'login' && <Login onLogin={handleLogin} onBack={() => setCurrentView('home')} selectedPlan={selectedPlan} />}
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
        <aside className="sidebar" style={{ width: isSidebarCollapsed ? '80px' : '280px', minWidth: isSidebarCollapsed ? '80px' : '280px', transition: 'width 0.3s ease, min-width 0.3s ease', position: 'relative' }}>
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
            <a className={`nav-item ${currentView === 'agent-install' ? 'active' : ''}`} onClick={() => setCurrentView('agent-install')} title="Installer l'assistant">
              <Sparkles size={18} /> {!isSidebarCollapsed && <span>Installer l'assistant</span>}
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
                <ActiveSession config={sessionData} onEnd={handleEndSession} />
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
