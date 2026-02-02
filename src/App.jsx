import { useState } from 'react';
import Home from './components/Home';
import NewSession from './components/NewSession';
import ActiveSession from './components/ActiveSession';
import SessionReport from './components/SessionReport';
import Dashboard from './components/Dashboard';
import DashboardProfessional from './components/DashboardProfessional';
import SessionsHistory from './components/SessionsHistory';
import Settings from './components/Settings';
import SessionEditor from './components/SessionEditor';
import ShortcutsModal from './components/ShortcutsModal';
import ErrorBoundary from './components/ErrorBoundary';
import { Toaster } from './components/Toast';
import useDarkMode from './hooks/useDarkMode';
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts';
import logo from './assets/logo.svg';
import './styles/design-system.css';
import './styles/app.css';
import './styles/home.css';
import './styles/shortcuts.css';
import './styles/dashboard.css';
import './styles/sessions-history.css';

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [sessionData, setSessionData] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [darkMode, toggleDarkMode] = useDarkMode();

  useKeyboardShortcuts({
    'ctrl+/': () => setShowShortcuts(true),
    'ctrl+n': () => setCurrentView('new'),
    'ctrl+h': () => setCurrentView('home'),
    'ctrl+d': () => setCurrentView('dashboard'),
    'ctrl+l': () => setCurrentView('history'),
    'escape': () => {
      setShowSettings(false);
      setShowShortcuts(false);
      setEditingSession(null);
    }
  });

  const handleGetStarted = () => {
    setCurrentView('new');
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

  const handleEndSession = (transcript, duration) => {
    const data = {
      ...sessionData,
      transcript,
      duration,
      endTime: Date.now()
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
          <a className={`nav-link ${currentView === 'home' ? 'active' : ''}`} onClick={handleGoHome}>
            Accueil
          </a>
          <a className={`nav-link ${currentView === 'dashboard' ? 'active' : ''}`} onClick={() => setCurrentView('dashboard')}>
            Tableau de bord
          </a>
          <a className={`nav-link ${currentView === 'new' || currentView === 'active' ? 'active' : ''}`} onClick={() => setCurrentView('new')}>
            Nouvelle Session
          </a>
          <a className={`nav-link ${currentView === 'history' ? 'active' : ''}`} onClick={() => setCurrentView('history')}>
            Historique
          </a>
        </div>
        
        <div className="nav-actions">
          <button 
            className="btn-nav-icon" 
            onClick={toggleDarkMode}
            title={darkMode ? 'Mode clair' : 'Mode sombre'}
          >
            {darkMode ? '◐' : '◑'}
          </button>
          <button 
            className="btn-nav-icon" 
            onClick={() => setShowShortcuts(true)}
            title="Raccourcis clavier (Ctrl+/)"
          >
            ⌘
          </button>
          <button className="btn-nav-secondary" onClick={() => setShowSettings(true)}>
            Paramètres
          </button>
          <button className="btn-nav-primary" onClick={handleGetStarted}>
            Commencer
          </button>
        </div>
      </nav>

      <main className={currentView === 'home' ? 'main-full' : ''}>
        {currentView === 'home' && <Home onGetStarted={handleGetStarted} />}
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'new' && <NewSession onStart={handleStartSession} />}
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
      </main>

      <footer>
        <p>© 2026 CORTEXIA · Toutes les données stockées localement · Sécurité de niveau entreprise</p>
      </footer>

      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
      {showShortcuts && <ShortcutsModal onClose={() => setShowShortcuts(false)} />}
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
