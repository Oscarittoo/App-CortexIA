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
  Shield
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
import AdminDashboard from './components/AdminDashboard';
import ActionsDashboard from './components/actions/ActionsDashboard';
import TemplatesLibrary from './components/templates/TemplatesLibrary';
import SettingsPage from './components/Settings';
import ErrorBoundary from './components/ErrorBoundary';
import { Toaster } from './components/Toast';
import toast from './components/Toast';
import logo from './assets/logo_meetizy.svg';
import authService from './services/authService';
import storageService from './utils/storage';

// Import New Theme - Replaces design-system.css and app.css
import './styles/theme-premium.css';
import './styles/home.css';             
import './styles/dashboard.css';
import './styles/sessions-history.css';
import './styles/public-pages.css';

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [sessionData, setSessionData] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [editingSession, setEditingSession] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const user = await authService.getCurrentUser();
      if (user) {
        setIsAuthenticated(true);
        setCurrentUser(user);
      }
    };
    loadUser();
  }, []);

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
    console.log('💾 Sauvegarde de la session:', data);
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
    setCurrentView('home');
    toast.success('Déconnexion réussie');
  };

  const handleLogin = (user) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
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
               
               <button className="btn btn-primary" onClick={() => setCurrentView('login')}>
                 Connexion
               </button>
            </div>
          </nav>

          <main style={{ minHeight: 'calc(100vh - 200px)' }}> 
            {currentView === 'home' && <Home onGetStarted={handleGetStarted} />}
            {currentView === 'features' && <Features onGetStarted={handleGetStarted} />}
            {currentView === 'integrations' && <Integrations onGetStarted={handleGetStarted} onViewDocs={() => setCurrentView('api-docs')} />}
            {currentView === 'security' && <Security onGetStarted={handleGetStarted} />}
            {currentView === 'demo' && <Demo onGetStarted={handleGetStarted} />}
            {currentView === 'pricing' && <Pricing onSelectPlan={handleSelectPlan} />}
            {currentView === 'api-docs' && <ApiDocs onBack={() => setCurrentView('integrations')} />}
            {currentView === 'login' && <Login onLogin={handleLogin} onBack={() => setCurrentView('home')} />}
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
        <aside className="sidebar">
          <div className="brand">
            <img src={logo} alt="Meetizy Logo" width="64" height="64" />
            <span style={{ fontFamily: 'Orbitron, sans-serif', letterSpacing: '1px', fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)' }}>MEETIZY</span>
          </div>

          <nav>
            <a className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`} onClick={() => setCurrentView('dashboard')}>
              <LayoutDashboard size={18} /> Tableau de bord
            </a>
            <a className={`nav-item ${currentView === 'new' || currentView === 'active' ? 'active' : ''}`} onClick={() => setCurrentView('new')}>
              <PlusCircle size={18} /> Nouvelle session
            </a>
            <a className={`nav-item ${currentView === 'history' ? 'active' : ''}`} onClick={() => setCurrentView('history')}>
              <History size={18} /> Historique
            </a>
            <a className={`nav-item ${currentView === 'actions' ? 'active' : ''}`} onClick={() => setCurrentView('actions')}>
              <CheckSquare size={18} /> Actions
            </a>
            <a className={`nav-item ${currentView === 'templates' ? 'active' : ''}`} onClick={() => setCurrentView('templates')}>
              <FileText size={18} /> Templates
            </a>
            
            {currentUser?.role === 'admin' && (
              <a className={`nav-item ${currentView === 'admin' ? 'active' : ''}`} onClick={() => setCurrentView('admin')}>
                <Shield size={18} /> Admin
              </a>
            )}
          </nav>

          <div className="sidebar-footer">
            <div className="user-profile">
               <div className="user-avatar">{currentUser?.email?.substring(0, 2).toUpperCase()}</div>
               <div style={{ overflow: 'hidden' }}>
                 <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text)', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{currentUser?.email}</div>
                 <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Pro Plan</div>
               </div>
            </div>
            <button className="btn-icon-premium" onClick={handleLogout} title="Déconnexion">
              <LogOut size={16} />
            </button>
          </div>
        </aside>

        {/* MAIN AREA */}
        <main className="main">
          {/* TOPBAR */}
          <div className="topbar">
            <div className="topbar-actions">
              <button className="btn-icon-premium" title="Notifications">
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
             {currentView === 'dashboard' && <Dashboard />}
             
             {currentView === 'new' && <NewSession onStart={handleStartSession} />}
             
             {currentView === 'active' && (
                <ActiveSession config={sessionData} onEnd={handleEndSession} />
             )}

             {currentView === 'report' && (
                <SessionReport
                  data={reportData}
                  onNewSession={handleNewSession}
                  onEdit={() => handleEditSession(reportData)}
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
             
             {currentView === 'settings' && <SettingsPage />}
             
             {currentView === 'admin' && <AdminDashboard />}
          </div>
        </main>

        {editingSession && (
          <SessionEditor
            session={editingSession}
            onSave={handleSaveEdit}
            onClose={() => setEditingSession(null)}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}
