import { useState, useEffect } from 'react';
import Home from './components/Home';
import Features from './components/Features';
import Integrations from './components/Integrations';
import Security from './components/Security';
import Demo from './components/Demo';
import NewSession from './components/NewSession';
import ActiveSession from './components/ActiveSession';
import SessionReport from './components/SessionReport';
import Dashboard from './components/Dashboard';
import DashboardProfessional from './components/DashboardProfessional';
import SessionsHistory from './components/SessionsHistory';
import SessionEditor from './components/SessionEditor';
import Pricing from './components/Pricing';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import ErrorBoundary from './components/ErrorBoundary';
import { Toaster } from './components/Toast';
import toast from './components/Toast';
import useDarkMode from './hooks/useDarkMode';
import authService from './services/authService';
import stripeService from './services/stripeService';
import logo from '../Logo cortexia.jpeg';
import './styles/design-system.css';
import './styles/app.css';
import './styles/home.css';
import './styles/dashboard.css';
import './styles/sessions-history.css';
import './styles/public-pages.css';

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [sessionData, setSessionData] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [editingSession, setEditingSession] = useState(null);
  const [darkMode, toggleDarkMode] = useDarkMode();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Vérifier l'authentification au démarrage
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
    // Si déjà connecté, aller vers nouvelle session
    // Sinon, aller vers connexion
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
      transcript,
      duration,
      endTime: Date.now(),
      detectedActions: aiAnalysis.detectedActions || [],
      detectedDecisions: aiAnalysis.detectedDecisions || []
    };
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

  const handleEditSession = (session) => {
    setEditingSession(session);
  };

  const handleSaveEdit = (updatedSession) => {
    // La sauvegarde est gérée par SessionEditor via storageService
    setEditingSession(null);
    if (currentView === 'history') {
      // Force le rafraîchissement de l'historique
      setCurrentView('home');
      setTimeout(() => setCurrentView('history'), 0);
    }
  };

  const handleSelectPlan = (planId) => {
    if (planId === 'free') {
      // Plan gratuit - si connecté, aller vers nouvelle session, sinon connexion
      if (isAuthenticated) {
        setCurrentView('new');
      } else {
        setCurrentView('login');
      }
    } else if (planId === 'enterprise') {
      // Plan entreprise - contacter l'équipe
      toast.info('Notre équipe vous contactera sous 24h');
      // TODO: Ouvrir un formulaire de contact
    } else {
      // Plan Pro/Business - initialiser Stripe
      if (isAuthenticated && currentUser) {
        stripeService.initialize().then(() => {
          stripeService.createCheckoutSession(planId, currentUser.email).catch(err => {
            toast.error('Erreur lors de l\'initialisation du paiement');
            console.error(err);
          });
        });
      } else {
        // Rediriger vers connexion avant paiement
        setCurrentView('login');
      }
    }
  };

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setCurrentUser(userData);
    setCurrentView('new'); // Rediriger vers nouvelle session après connexion
  };

  const handleLogout = async () => {
    await authService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCurrentView('home');
    toast.success('Déconnexion réussie');
  };

  return (
    <ErrorBoundary>
      <div className="app">
        <Toaster />
        <nav className="main-nav">
          <div className="nav-brand" onClick={handleGoHome}>
            <img src={logo} alt="CORTEXIA" className="nav-logo" />
            <span className="nav-brand-name">CORTEXIA</span>
          </div>
        
        <div className="nav-links">
          {!isAuthenticated ? (
            // Navigation pour visiteur non connecté
            <>
              <a className={`nav-link ${currentView === 'home' ? 'active' : ''}`} onClick={handleGoHome}>
                Accueil
              </a>
              <a className={`nav-link ${currentView === 'features' ? 'active' : ''}`} onClick={() => setCurrentView('features')}>
                Fonctionnalités
              </a>
              <a className={`nav-link ${currentView === 'integrations' ? 'active' : ''}`} onClick={() => setCurrentView('integrations')}>
                Intégrations
              </a>
              <a className={`nav-link ${currentView === 'security' ? 'active' : ''}`} onClick={() => setCurrentView('security')}>
                Sécurité
              </a>
              <a className={`nav-link ${currentView === 'pricing' ? 'active' : ''}`} onClick={() => setCurrentView('pricing')}>
                Prix
              </a>
              <a className={`nav-link ${currentView === 'demo' ? 'active' : ''}`} onClick={() => setCurrentView('demo')}>
                Démo
              </a>
            </>
          ) : (
            // Navigation pour utilisateur connecté
            <>
              <a className={`nav-link ${currentView === 'dashboard' ? 'active' : ''}`} onClick={() => setCurrentView('dashboard')}>
                Tableau de bord
              </a>
              <a className={`nav-link ${currentView === 'new' || currentView === 'active' ? 'active' : ''}`} onClick={() => setCurrentView('new')}>
                Nouvelle session
              </a>
              <a className={`nav-link ${currentView === 'history' ? 'active' : ''}`} onClick={() => setCurrentView('history')}>
                Historique
              </a>
              <a className={`nav-link ${currentView === 'actions' ? 'active' : ''}`} onClick={() => setCurrentView('actions')}>
                Actions
              </a>
              <a className={`nav-link ${currentView === 'templates' ? 'active' : ''}`} onClick={() => setCurrentView('templates')}>
                Templates
              </a>
              {currentUser?.role === 'admin' && (
                <a className={`nav-link ${currentView === 'admin' ? 'active' : ''}`} onClick={() => setCurrentView('admin')}>
                  Admin
                </a>
              )}
            </>
          )}
        </div>
        
        <div className="nav-actions">
          <button 
            className="btn-nav-icon" 
            onClick={toggleDarkMode}
            title={darkMode ? 'Mode clair' : 'Mode sombre'}
          >
            {darkMode ? '◐' : '◑'}
          </button>
          {isAuthenticated ? (
            <>
              <span className="nav-user-email">{currentUser?.email}</span>
              <button className="btn-nav-secondary" onClick={handleLogout}>
                Déconnexion
              </button>
            </>
          ) : (
            <button className="btn-nav-primary" onClick={() => setCurrentView('login')}>
              Connexion
            </button>
          )}
        </div>
      </nav>

      <main className={currentView === 'home' || currentView === 'pricing' || currentView === 'login' || currentView === 'features' || currentView === 'integrations' || currentView === 'security' || currentView === 'demo' ? 'main-full' : ''}>
        {currentView === 'home' && <Home onGetStarted={handleGetStarted} />}
        {currentView === 'features' && <Features onGetStarted={handleGetStarted} />}
        {currentView === 'integrations' && <Integrations onGetStarted={handleGetStarted} />}
        {currentView === 'security' && <Security onGetStarted={handleGetStarted} />}
        {currentView === 'demo' && <Demo onGetStarted={handleGetStarted} />}
        {currentView === 'pricing' && <Pricing onSelectPlan={handleSelectPlan} />}
        {currentView === 'actions' && isAuthenticated && <div className="screen"><h1>Actions</h1><p>Gestion des tâches et actions de suivi</p></div>}
        {currentView === 'templates' && isAuthenticated && <div className="screen"><h1>Templates</h1><p>Modèles de réunions personnalisés</p></div>}
        {currentView === 'login' && (
          <Login 
            onLogin={handleLogin}
            onBack={() => setCurrentView('home')}
          />
        )}
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'new' && (
          isAuthenticated ? (
            <NewSession onStart={handleStartSession} />
          ) : (
            <Login 
              onLogin={handleLogin}
              onBack={() => setCurrentView('home')}
            />
          )
        )}
        {currentView === 'history' && (
          <SessionsHistory 
            onViewSession={handleViewSession}
            onEditSession={handleEditSession}
          />
        )}
        {currentView === 'active' && (
          <ActiveSession
            config={sessionData}
            onEnd={handleEndSession}
          />
        )}
        {currentView === 'report' && (
          <SessionReport
            data={reportData}
            onNewSession={handleNewSession}
            onEdit={() => handleEditSession(reportData)}
          />
        )}
        {currentView === 'admin' && isAuthenticated && currentUser?.role === 'admin' && <AdminDashboard />}
      </main>

      <footer>
        <p>© 2026 CORTEXIA · Toutes les données stockées localement · Sécurité de niveau entreprise</p>
      </footer>

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
