const { contextBridge, ipcRenderer } = require('electron');

// Bridge sécurisé entre le renderer et le main process
contextBridge.exposeInMainWorld('electronAPI', {
  // Overlay : signaler au main qu'une session démarre/stoppe
  startSession: (config) => ipcRenderer.invoke('tray-start-session', config),
  stopSession: () => ipcRenderer.invoke('tray-stop-session'),
  closeOverlay: () => ipcRenderer.invoke('tray-close-overlay'),
  openMainWindow: () => ipcRenderer.invoke('tray-open-main'),

  // Notifier le main process de l'état d'authentification
  authSetState: (authenticated) => ipcRenderer.invoke('auth-set-state', authenticated),

  // Capture d'écran pour le bouton "Analyser l'écran"
  captureScreen: () => ipcRenderer.invoke('capture-screen'),

  // Redimensionner l'overlay (chat ouvert/fermé)
  setOverlayHeight: (height) => ipcRenderer.invoke('overlay-set-height', height),

  // Recevoir des events du main process
  onSessionStatus: (callback) => ipcRenderer.on('session-status', (_event, data) => callback(data)),
  removeSessionStatus: () => ipcRenderer.removeAllListeners('session-status'),
});

