/**
 * Example: How to use Feature Flags in App.jsx
 * 
 * This shows how to conditionally render components based on feature flags
 */

import { useState, useEffect } from 'react';
import { FEATURE_FLAGS, loadFeatureFlags } from './config/featureFlags';

// Import both old and new components
import ActiveSession from './components/ActiveSession';
import ActiveSessionV2 from './components/ActiveSessionV2';
import SessionsHistory from './components/SessionsHistory';
import SessionsHistoryV2 from './components/SessionsHistoryV2';
import Dashboard from './components/Dashboard';
import DashboardProfessional from './components/DashboardProfessional';
import ErrorBoundary from './components/ErrorBoundary';
import { Toaster } from './components/Toast';

// Import styles conditionally
import './styles/app.css';
// Conditionally import design system
if (FEATURE_FLAGS.USE_PROFESSIONAL_DESIGN) {
  import('./styles/design-system.css');
}

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  
  // Load feature flags on startup
  useEffect(() => {
    loadFeatureFlags();
  }, []);

  // Render with or without ErrorBoundary
  const content = (
    <div className="app">
      {/* Conditionally show Toaster */}
      {FEATURE_FLAGS.USE_TOAST_NOTIFICATIONS && <Toaster />}
      
      <nav className="main-nav">
        {/* ... navigation ... */}
      </nav>

      <main>
        {/* Conditionally use Dashboard version */}
        {currentView === 'dashboard' && (
          FEATURE_FLAGS.USE_DASHBOARD_PROFESSIONAL ? (
            <DashboardProfessional />
          ) : (
            <Dashboard />
          )
        )}

        {/* Conditionally use SessionsHistory version */}
        {currentView === 'history' && (
          FEATURE_FLAGS.USE_SESSIONS_HISTORY_V2 ? (
            <SessionsHistoryV2
              onViewSession={handleViewSession}
              onEditSession={handleEditSession}
            />
          ) : (
            <SessionsHistory
              onViewSession={handleViewSession}
              onEditSession={handleEditSession}
            />
          )
        )}

        {/* Conditionally use ActiveSession version */}
        {currentView === 'active' && (
          FEATURE_FLAGS.USE_ACTIVE_SESSION_V2 ? (
            <ActiveSessionV2
              config={sessionData}
              onEnd={handleEndSession}
            />
          ) : (
            <ActiveSession
              config={sessionData}
              onEnd={handleEndSession}
            />
          )
        )}
      </main>
    </div>
  );

  // Wrap in ErrorBoundary if enabled
  return FEATURE_FLAGS.USE_ERROR_BOUNDARY ? (
    <ErrorBoundary>{content}</ErrorBoundary>
  ) : (
    content
  );
}

/**
 * Example: Adding Feature Flag Toggle to Settings
 */

import { FEATURE_FLAGS, enableFeature, disableFeature } from '../config/featureFlags';

function SettingsFeatureFlags() {
  const handleToggle = (flagName) => {
    if (FEATURE_FLAGS[flagName]) {
      disableFeature(flagName);
    } else {
      enableFeature(flagName);
    }
    // Force re-render
    window.location.reload();
  };

  return (
    <div className="settings-section">
      <h3>Feature Flags</h3>
      <p className="text-secondary">Enable or disable new features</p>
      
      <div className="feature-flags-list">
        <FeatureFlagToggle
          name="USE_PROFESSIONAL_DESIGN"
          label="Professional Design System"
          description="Modern design inspired by Linear, Notion, Slack"
          enabled={FEATURE_FLAGS.USE_PROFESSIONAL_DESIGN}
          onToggle={() => handleToggle('USE_PROFESSIONAL_DESIGN')}
        />
        
        <FeatureFlagToggle
          name="USE_TOAST_NOTIFICATIONS"
          label="Toast Notifications"
          description="Professional notification system"
          enabled={FEATURE_FLAGS.USE_TOAST_NOTIFICATIONS}
          onToggle={() => handleToggle('USE_TOAST_NOTIFICATIONS')}
        />
        
        <FeatureFlagToggle
          name="ENABLE_PDF_EXPORT"
          label="PDF Export"
          description="Export sessions as professional PDFs"
          enabled={FEATURE_FLAGS.ENABLE_PDF_EXPORT}
          onToggle={() => handleToggle('ENABLE_PDF_EXPORT')}
        />
        
        <FeatureFlagToggle
          name="ENABLE_ADVANCED_SEARCH"
          label="Advanced Search"
          description="Full-text search with multiple filters"
          enabled={FEATURE_FLAGS.ENABLE_ADVANCED_SEARCH}
          onToggle={() => handleToggle('ENABLE_ADVANCED_SEARCH')}
        />
        
        {/* Add more toggles as needed */}
      </div>
    </div>
  );
}

function FeatureFlagToggle({ name, label, description, enabled, onToggle }) {
  return (
    <div className="feature-flag-item">
      <div className="feature-flag-info">
        <div className="feature-flag-label">{label}</div>
        <div className="feature-flag-description">{description}</div>
      </div>
      <label className="toggle-switch">
        <input
          type="checkbox"
          checked={enabled}
          onChange={onToggle}
        />
        <span className="toggle-slider"></span>
      </label>
    </div>
  );
}

/**
 * Example: Conditional PDF Export
 */

import { FEATURE_FLAGS } from '../config/featureFlags';
import pdfExportService from '../services/pdfExportService';
import toast from './Toast';

function SessionReport({ data }) {
  const handleExportPDF = () => {
    if (!FEATURE_FLAGS.ENABLE_PDF_EXPORT) {
      if (FEATURE_FLAGS.USE_TOAST_NOTIFICATIONS) {
        toast.warning('PDF export is disabled. Enable in Settings.');
      } else {
        alert('PDF export is disabled');
      }
      return;
    }

    try {
      const fileName = pdfExportService.exportSession(data);
      if (FEATURE_FLAGS.USE_TOAST_NOTIFICATIONS) {
        toast.success(`Exported as ${fileName}`);
      }
    } catch (error) {
      if (FEATURE_FLAGS.USE_TOAST_NOTIFICATIONS) {
        toast.error('Failed to export PDF');
      }
    }
  };

  return (
    <div className="session-report">
      {/* ... report content ... */}
      
      {FEATURE_FLAGS.ENABLE_PDF_EXPORT && (
        <button className="btn btn-secondary" onClick={handleExportPDF}>
          Export PDF
        </button>
      )}
    </div>
  );
}

/**
 * Example: Conditional Advanced Search
 */

import { FEATURE_FLAGS } from '../config/featureFlags';
import AdvancedSearch from './AdvancedSearch';

function SessionsHistory() {
  return (
    <div className="sessions-history">
      {FEATURE_FLAGS.ENABLE_ADVANCED_SEARCH ? (
        <AdvancedSearch
          onSearch={handleSearch}
          availableTags={tags}
        />
      ) : (
        <input
          type="text"
          placeholder="Search..."
          className="simple-search"
          onChange={(e) => handleSimpleSearch(e.target.value)}
        />
      )}
      
      {/* ... sessions list ... */}
    </div>
  );
}

/**
 * Example: Debug Mode Logging
 */

import { FEATURE_FLAGS } from '../config/featureFlags';

function logDebug(message, ...args) {
  if (FEATURE_FLAGS.DEBUG_MODE) {
    console.log(`[DEBUG] ${message}`, ...args);
  }
}

function startTranscription() {
  logDebug('Starting transcription', { config });
  
  // ... transcription logic ...
  
  logDebug('Transcription started successfully');
}

/**
 * Example: Performance Metrics
 */

import { FEATURE_FLAGS } from '../config/featureFlags';

function withPerformanceMetrics(Component) {
  return function PerformanceWrapper(props) {
    if (!FEATURE_FLAGS.SHOW_PERFORMANCE_METRICS) {
      return <Component {...props} />;
    }

    const startTime = performance.now();
    
    useEffect(() => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      console.log(`[PERF] ${Component.name} rendered in ${renderTime.toFixed(2)}ms`);
    });

    return <Component {...props} />;
  };
}

// Usage:
const DashboardWithMetrics = withPerformanceMetrics(DashboardProfessional);

/**
 * Best Practices for Feature Flags
 * 
 * 1. Always provide fallback to old component
 * 2. Use feature flags for gradual rollout
 * 3. Allow users to toggle in Settings
 * 4. Test both enabled and disabled states
 * 5. Document what each flag does
 * 6. Remove flags after feature is stable
 * 7. Use meaningful flag names
 * 8. Group related flags together
 * 9. Provide user-facing descriptions
 * 10. Log flag changes for debugging
 */
