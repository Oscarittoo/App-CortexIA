// Meetizy Agent IA - Popup Script
import authService from './auth-service.js';
import meetizyAI from './ai-service.js';

let isRecording = false;
let currentPlatform = 'none';

// Vérifier l'authentification au chargement
document.addEventListener('DOMContentLoaded', async () => {
  await authService.loadToken();
  
  if (!authService.isAuthenticated()) {
    // Non connecté, rediriger vers la page de connexion
    window.location.href = 'login.html';
    return;
  }
  
  // Charger les infos utilisateur
  await loadUserInfo();
  
  // Initialiser l'interface
  updateUI();
});

// Détecter la plateforme de visioconférence actuelle
function detectPlatform(url) {
  if (url.includes('meet.google.com')) return 'Google Meet';
  if (url.includes('teams.microsoft.com')) return 'Microsoft Teams';
  if (url.includes('zoom.us')) return 'Zoom';
  return 'Aucune';
}

// Mettre à jour l'interface utilisateur
function updateUI() {
  const connectionStatus = document.getElementById('connectionStatus');
  const platformName = document.getElementById('platformName');
  const transcriptionStatus = document.getElementById('transcriptionStatus');
  const startBtn = document.getElementById('startBtn');
  const startBtnText = document.getElementById('startBtnText');

  // Vérifier la connexion
  chrome.storage.local.get(['isConnected', 'isRecording'], (result) => {
    const isConnected = result.isConnected || false;
    isRecording = result.isRecording || false;

    // Mettre à jour le statut de connexion
    if (isConnected) {
      connectionStatus.textContent = 'Connecté';
      connectionStatus.className = 'status-value status-connected';
    } else {
      connectionStatus.textContent = 'Déconnecté';
      connectionStatus.className = 'status-value status-disconnected';
    }

    // Mettre à jour le statut de transcription
    if (isRecording) {
      transcriptionStatus.innerHTML = '<span class="recording-indicator"></span>En cours';
      startBtnText.textContent = '⏸ Arrêter la transcription';
      startBtn.className = 'btn btn-secondary';
    } else {
      transcriptionStatus.textContent = 'Inactive';
      startBtnText.textContent = '▶ Démarrer la transcription';
      startBtn.className = 'btn btn-primary';
    }
  });

  // Obtenir l'onglet actif pour détecter la plateforme
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      currentPlatform = detectPlatform(tabs[0].url);
      platformName.textContent = currentPlatform;
      
      // Changer la couleur selon la plateforme
      if (currentPlatform !== 'Aucune') {
        platformName.className = 'status-value status-connected';
      } else {
        platformName.className = 'status-value';
      }
    }
  });
}

// Charger les informations utilisateur
async function loadUserInfo() {
  try {
    const profileResult = await authService.getProfile();
    
    if (profileResult.success) {
      const user = profileResult.user;
      
      // Afficher les informations utilisateur
      const userInfoElement = document.getElementById('userInfo');
      if (userInfoElement) {
        userInfoElement.innerHTML = `
          <div style="padding: 12px; background: rgba(56, 189, 248, 0.1); border-radius: 8px; margin-bottom: 12px;">
            <div style="font-weight: 600; color: #38bdf8; margin-bottom: 4px;">${user.name}</div>
            <div style="font-size: 12px; color: #94a3b8;">Plan: ${user.plan.toUpperCase()}</div>
          </div>
        `;
      }
      
      // Charger les quotas
      const quotasResult = await authService.getQuotas();
      if (quotasResult.success) {
        displayQuotas(quotasResult.quotas);
      }
    }
  } catch (error) {
    console.error('Erreur chargement profil:', error);
  }
}

// Afficher les quotas
function displayQuotas(quotas) {
  const quotasElement = document.getElementById('quotasInfo');
  if (!quotasElement) return;
  
  const aiMeetingsPercent = quotas.aiMeetings.limit === -1 ? 0 : 
    (quotas.aiMeetings.used / quotas.aiMeetings.limit) * 100;
  
  const transcriptPercent = quotas.transcriptionMinutes.limit === -1 ? 0 :
    (quotas.transcriptionMinutes.used / quotas.transcriptionMinutes.limit) * 100;
  
  quotasElement.innerHTML = `
    <div style="padding: 12px; background: rgba(255, 255, 255, 0.05); border-radius: 8px; font-size: 12px;">
      <div style="margin-bottom: 8px;">
        <div style="color: #94a3b8; margin-bottom: 4px;">Réunions IA</div>
        <div style="color: #fff; font-weight: 500;">
          ${quotas.aiMeetings.used} / ${quotas.aiMeetings.limit === -1 ? '∞' : quotas.aiMeetings.limit}
        </div>
        ${quotas.aiMeetings.limit !== -1 ? `
          <div style="height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; margin-top: 4px; overflow: hidden;">
            <div style="height: 100%; background: ${aiMeetingsPercent > 80 ? '#f87171' : '#38bdf8'}; width: ${aiMeetingsPercent}%"></div>
          </div>
        ` : ''}
      </div>
      <div>
        <div style="color: #94a3b8; margin-bottom: 4px;">Transcription</div>
        <div style="color: #fff; font-weight: 500;">
          ${quotas.transcriptionMinutes.used} / ${quotas.transcriptionMinutes.limit === -1 ? '∞' : quotas.transcriptionMinutes.limit} min
        </div>
      </div>
    </div>
  `;
}

// Déconnexion
async function logout() {
  await authService.logout();
  window.location.href = 'login.html';
}

// Exposer la fonction logout globalement
if (typeof window !== 'undefined') {
  window.logout = logout;
}

// Démarrer/Arrêter la transcription
document.getElementById('startBtn').addEventListener('click', async () => {
  if (currentPlatform === 'Aucune') {
    alert('Veuillez ouvrir une réunion sur Google Meet, Microsoft Teams ou Zoom.');
    return;
  }

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (isRecording) {
    // Arrêter la transcription
    chrome.tabs.sendMessage(tab.id, { action: 'stopTranscription' });
    chrome.storage.local.set({ isRecording: false });
  } else {
    // Démarrer la transcription
    chrome.tabs.sendMessage(tab.id, { action: 'startTranscription' });
    chrome.storage.local.set({ isRecording: true });
  }
  
  // Mettre à jour l'interface
  setTimeout(updateUI, 300);
});

// Ouvrir le dashboard Meetizy
document.getElementById('openDashboardBtn').addEventListener('click', () => {
  chrome.tabs.create({ url: 'http://localhost:5173' });
});

// Ouvrir les paramètres
document.getElementById('settingsBtn').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

// Initialiser l'interface au chargement
document.addEventListener('DOMContentLoaded', () => {
  updateUI();
  
  // Rafraîchir l'interface toutes les 2 secondes
  setInterval(updateUI, 2000);
});

// Écouter les changements de stockage
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local') {
    updateUI();
  }
});
