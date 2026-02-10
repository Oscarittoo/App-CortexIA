// Meetizy Agent IA - Background Service Worker

// Installation de l'extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('Meetizy Agent IA installé avec succès !');
  
  // Initialiser le stockage local
  chrome.storage.local.set({
    isConnected: false,
    isRecording: false,
    apiKey: '',
    sessions: []
  });
});

// Écouter les messages des content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message reçu dans background:', request);

  switch (request.action) {
    case 'startSession':
      handleStartSession(request.data, sender.tab.id);
      sendResponse({ success: true });
      break;
      
    case 'stopSession':
      handleStopSession(request.data);
      sendResponse({ success: true });
      break;
      
    case 'saveTranscript':
      saveTranscriptToLocal(request.data);
      sendResponse({ success: true });
      break;
      
    case 'syncWithMeetizy':
      syncDataWithMeetizy(request.data);
      sendResponse({ success: true });
      break;

    case 'getAISuggestion':
      getAISuggestion(request.data).then(response => {
        sendResponse({ success: true, data: response });
      });
      return true; // Garder le canal ouvert pour la réponse async
      
    default:
      sendResponse({ success: false, error: 'Action inconnue' });
  }
});

// Gérer le démarrage d'une session
async function handleStartSession(data, tabId) {
  console.log('Démarrage de la session:', data);
  
  const session = {
    id: generateSessionId(),
    platform: data.platform,
    title: data.title || 'Réunion sans titre',
    startTime: new Date().toISOString(),
    transcript: [],
    participants: []
  };
  
  // Sauvegarder la session
  chrome.storage.local.get(['sessions'], (result) => {
    const sessions = result.sessions || [];
    sessions.push(session);
    chrome.storage.local.set({ 
      sessions,
      currentSession: session,
      isRecording: true 
    });
  });
  
  // Notifier l'utilisateur
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: 'Meetizy Agent IA',
    message: 'Transcription démarrée avec succès !'
  });
}

// Gérer l'arrêt d'une session
async function handleStopSession(data) {
  console.log('Arrêt de la session:', data);
  
  chrome.storage.local.get(['currentSession'], (result) => {
    if (result.currentSession) {
      const session = result.currentSession;
      session.endTime = new Date().toISOString();
      session.duration = calculateDuration(session.startTime, session.endTime);
      
      // Mettre à jour la session
      chrome.storage.local.get(['sessions'], (result) => {
        const sessions = result.sessions || [];
        const index = sessions.findIndex(s => s.id === session.id);
        if (index !== -1) {
          sessions[index] = session;
          chrome.storage.local.set({ sessions, isRecording: false });
        }
      });
      
      // Synchroniser avec Meetizy si connecté
      syncDataWithMeetizy(session);
    }
  });
}

// Sauvegarder la transcription localement
function saveTranscriptToLocal(data) {
  chrome.storage.local.get(['currentSession'], (result) => {
    if (result.currentSession) {
      const session = result.currentSession;
      session.transcript = session.transcript || [];
      session.transcript.push({
        timestamp: new Date().toISOString(),
        speaker: data.speaker || 'Inconnu',
        text: data.text
      });
      
      chrome.storage.local.set({ currentSession: session });
    }
  });
}

// Synchroniser avec l'application Meetizy
async function syncDataWithMeetizy(sessionData) {
  try {
    const response = await fetch('http://localhost:5173/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sessionData)
    });
    
    if (response.ok) {
      console.log('Synchronisation réussie avec Meetizy');
      chrome.storage.local.set({ isConnected: true });
    } else {
      console.error('Erreur de synchronisation:', response.statusText);
      chrome.storage.local.set({ isConnected: false });
    }
  } catch (error) {
    console.error('Erreur de connexion à Meetizy:', error);
    chrome.storage.local.set({ isConnected: false });
  }
}

// Obtenir une suggestion de l'IA (ChatGPT-4)
async function getAISuggestion(data) {
  try {
    // Cette fonction sera connectée à l'API ChatGPT-4 dans la prochaine phase
    // Pour l'instant, retourner une réponse simulée
    
    const mockResponse = {
      suggestion: "Basé sur la conversation, je suggère de...",
      confidence: 0.85,
      type: data.type || 'general'
    };
    
    return mockResponse;
  } catch (error) {
    console.error('Erreur lors de la récupération de la suggestion IA:', error);
    return { error: error.message };
  }
}

// Utilitaires
function generateSessionId() {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function calculateDuration(startTime, endTime) {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const durationMs = end - start;
  const minutes = Math.floor(durationMs / 60000);
  return `${minutes} min`;
}

// Vérifier périodiquement la connexion avec Meetizy
setInterval(() => {
  fetch('http://localhost:5173/api/health')
    .then(response => {
      chrome.storage.local.set({ isConnected: response.ok });
    })
    .catch(() => {
      chrome.storage.local.set({ isConnected: false });
    });
}, 30000); // Toutes les 30 secondes
