/**
 * Feature Flags Configuration
 * 
 * Enable or disable new professional features
 * Set to true to enable, false to use original components
 */

export const FEATURE_FLAGS = {
  // UI Components
  USE_PROFESSIONAL_DESIGN: true,         // Use design-system.css
  USE_ERROR_BOUNDARY: true,              // Wrap app in ErrorBoundary
  USE_TOAST_NOTIFICATIONS: true,         // Show toast notifications
  
  // Main Components
  USE_ACTIVE_SESSION_V2: true,           // Enhanced recording interface
  USE_SESSIONS_HISTORY_V2: true,         // Enhanced history with search
  USE_DASHBOARD_PROFESSIONAL: true,      // Professional analytics dashboard
  
  // Features
  ENABLE_ADVANCED_SEARCH: true,          // Full-text search with filters
  ENABLE_TAG_MANAGER: true,              // Tag management in settings
  ENABLE_PDF_EXPORT: true,               // Professional PDF generation
  ENABLE_TEMPLATES: true,                // Template system
  ENABLE_ANALYTICS: true,                // Advanced analytics
  
  // Transcription
  USE_ENHANCED_TRANSCRIPTION: true,      // transcriptionService.v2.js with debugging
  SHOW_CONFIDENCE_SCORES: true,          // Display confidence %
  SHOW_AUDIO_DETECTION: true,            // Warn if no audio detected
  
  // Development
  DEBUG_MODE: false,                     // Extra console logging
  SHOW_PERFORMANCE_METRICS: false,       // Display performance info
};

/**
 * Get feature flag value
 * @param {string} flagName - Name of the feature flag
 * @returns {boolean} - Whether feature is enabled
 */
export function isFeatureEnabled(flagName) {
  return FEATURE_FLAGS[flagName] ?? false;
}

/**
 * Enable a feature flag
 * @param {string} flagName - Name of the feature flag
 */
export function enableFeature(flagName) {
  if (flagName in FEATURE_FLAGS) {
    FEATURE_FLAGS[flagName] = true;
    localStorage.setItem(`feature_${flagName}`, 'true');
  }
}

/**
 * Disable a feature flag
 * @param {string} flagName - Name of the feature flag
 */
export function disableFeature(flagName) {
  if (flagName in FEATURE_FLAGS) {
    FEATURE_FLAGS[flagName] = false;
    localStorage.setItem(`feature_${flagName}`, 'false');
  }
}

/**
 * Load feature flags from localStorage
 * Call this on app startup
 */
export function loadFeatureFlags() {
  Object.keys(FEATURE_FLAGS).forEach(flagName => {
    const stored = localStorage.getItem(`feature_${flagName}`);
    if (stored !== null) {
      FEATURE_FLAGS[flagName] = stored === 'true';
    }
  });
}

/**
 * Reset all feature flags to defaults
 */
export function resetFeatureFlags() {
  Object.keys(FEATURE_FLAGS).forEach(flagName => {
    localStorage.removeItem(`feature_${flagName}`);
  });
  
  // Reload defaults
  FEATURE_FLAGS.USE_PROFESSIONAL_DESIGN = true;
  FEATURE_FLAGS.USE_ERROR_BOUNDARY = true;
  FEATURE_FLAGS.USE_TOAST_NOTIFICATIONS = true;
  FEATURE_FLAGS.USE_ACTIVE_SESSION_V2 = true;
  FEATURE_FLAGS.USE_SESSIONS_HISTORY_V2 = true;
  FEATURE_FLAGS.USE_DASHBOARD_PROFESSIONAL = true;
  FEATURE_FLAGS.ENABLE_ADVANCED_SEARCH = true;
  FEATURE_FLAGS.ENABLE_TAG_MANAGER = true;
  FEATURE_FLAGS.ENABLE_PDF_EXPORT = true;
  FEATURE_FLAGS.ENABLE_TEMPLATES = true;
  FEATURE_FLAGS.ENABLE_ANALYTICS = true;
  FEATURE_FLAGS.USE_ENHANCED_TRANSCRIPTION = true;
  FEATURE_FLAGS.SHOW_CONFIDENCE_SCORES = true;
  FEATURE_FLAGS.SHOW_AUDIO_DETECTION = true;
  FEATURE_FLAGS.DEBUG_MODE = false;
  FEATURE_FLAGS.SHOW_PERFORMANCE_METRICS = false;
}

export default FEATURE_FLAGS;
