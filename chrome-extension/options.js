// Meetizy Agent IA - Options Page Script

document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  loadStats();

  // Événements
  document.getElementById('saveBtn').addEventListener('click', saveSettings);
  document.getElementById('testBtn').addEventListener('click', testAPIConnection);
});

// Charger les paramètres sauvegardés
async function loadSettings() {
  chrome.storage.local.get([
    'openai_api_key',
    'openai_model',
    'transcription_language',
    'auto_start_transcription',
    'auto_sync'
  ], (result) => {
    // API Key
    if (result.openai_api_key) {
      document.getElementById('apiKey').value = result.openai_api_key;
      document.getElementById('apiStatus').textContent = 'Configuré';
      document.getElementById('apiStatus').style.background = 'rgba(16, 185, 129, 0.2)';
      document.getElementById('apiStatus').style.color = '#10b981';
    }

    // Model
    if (result.openai_model) {
      document.getElementById('modelSelect').value = result.openai_model;
    }

    // Language
    if (result.transcription_language) {
      document.getElementById('languageSelect').value = result.transcription_language;
    }

    // Auto start
    document.getElementById('autoStartCheck').checked = result.auto_start_transcription || false;

    // Auto sync
    document.getElementById('autoSyncCheck').checked = 
      result.auto_sync !== undefined ? result.auto_sync : true;
  });
}

// Charger les statistiques
async function loadStats() {
  chrome.storage.local.get(['ai_usage_stats', 'sessions'], (result) => {
    const stats = result.ai_usage_stats || {
      total_requests: 0,
      total_tokens: 0
    };

    const sessions = result.sessions || [];

    document.getElementById('totalRequests').textContent = stats.total_requests;
    document.getElementById('totalTokens').textContent = stats.total_tokens.toLocaleString();
    document.getElementById('totalSessions').textContent = sessions.length;
  });
}

// Sauvegarder les paramètres
async function saveSettings() {
  const apiKey = document.getElementById('apiKey').value.trim();
  const model = document.getElementById('modelSelect').value;
  const language = document.getElementById('languageSelect').value;
  const autoStart = document.getElementById('autoStartCheck').checked;
  const autoSync = document.getElementById('autoSyncCheck').checked;

  // Validation
  if (!apiKey) {
    showError('Veuillez entrer une clé API OpenAI');
    return;
  }

  if (!apiKey.startsWith('sk-')) {
    showError('La clé API doit commencer par "sk-"');
    return;
  }

  // Sauvegarder
  chrome.storage.local.set({
    openai_api_key: apiKey,
    openai_model: model,
    transcription_language: language,
    auto_start_transcription: autoStart,
    auto_sync: autoSync
  }, () => {
    showSuccess();
    
    // Mettre à jour le badge de statut
    document.getElementById('apiStatus').textContent = 'Configuré';
    document.getElementById('apiStatus').style.background = 'rgba(16, 185, 129, 0.2)';
    document.getElementById('apiStatus').style.color = '#10b981';

    // Notifier le background script
    chrome.runtime.sendMessage({ action: 'settingsUpdated' });
  });
}

// Tester la connexion API
async function testAPIConnection() {
  const apiKey = document.getElementById('apiKey').value.trim();

  if (!apiKey) {
    showError('Veuillez d\'abord entrer une clé API');
    return;
  }

  // Désactiver le bouton pendant le test
  const testBtn = document.getElementById('testBtn');
  testBtn.disabled = true;
  testBtn.textContent = '⏳ Test en cours...';

  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (response.ok) {
      showSuccess('✓ Connexion réussie ! Votre clé API est valide.');
    } else {
      const error = await response.json();
      showError(`Erreur : ${error.error?.message || 'Clé API invalide'}`);
    }
  } catch (error) {
    showError(`Erreur de connexion : ${error.message}`);
  } finally {
    testBtn.disabled = false;
    testBtn.textContent = '🧪 Tester la connexion';
  }
}

// Afficher un message de succès
function showSuccess(message = '✓ Paramètres sauvegardés avec succès !') {
  const alert = document.getElementById('alertSuccess');
  alert.textContent = message;
  alert.classList.add('show');
  
  setTimeout(() => {
    alert.classList.remove('show');
  }, 3000);
}

// Afficher un message d'erreur
function showError(message) {
  const alert = document.getElementById('alertError');
  const errorMessage = document.getElementById('errorMessage');
  errorMessage.textContent = message;
  alert.classList.add('show');
  
  setTimeout(() => {
    alert.classList.remove('show');
  }, 5000);
}
