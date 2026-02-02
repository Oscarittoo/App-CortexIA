const { app, BrowserWindow, ipcMain, desktopCapturer } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      // Permissions pour microphone et API
      webSecurity: false, // Désactivé pour permettre les appels API locaux
      allowRunningInsecureContent: true,
      // Forcer les permissions media
      experimentalFeatures: true
    },
    icon: path.join(__dirname, '../assets/icon.png')
  });
  
  // Log pour debug
  console.log('🪟 Fenêtre Electron créée avec permissions media activées');

  // Autoriser TOUTES les permissions de microphone automatiquement
  mainWindow.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
    console.log(`🔐 Demande de permission: ${permission}`);
    const allowedPermissions = ['media', 'microphone', 'audioCapture', 'audioPlayback', 'mediaKeySystem'];
    if (allowedPermissions.includes(permission)) {
      console.log(`✅ Permission ACCORDÉE: ${permission}`);
      callback(true);
    } else {
      console.log(`⚠️ Permission REFUSÉE: ${permission}`);
      callback(false);
    }
  });

  // Autoriser les permissions sans demande pour tous les media devices
  mainWindow.webContents.session.setPermissionCheckHandler((webContents, permission, requestingOrigin) => {
    console.log(`🔍 Permission check: ${permission} depuis ${requestingOrigin}`);
    if (permission === 'media' || permission === 'microphone' || permission === 'audioCapture' || permission === 'audioPlayback') {
      console.log(`✅ Check ACCORDÉ: ${permission}`);
      return true;
    }
    console.log(`⚠️ Check REFUSÉ: ${permission}`);
    return false;
  });
  
  // Forcer l'activation des devices media
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('✅ Page chargée - Permissions media activées');
  });

  // Charger l'application
  const isDev = !app.isPackaged;
  
  if (isDev) {
    // Essayer différents ports
    const ports = [5173, 5174, 5175, 5176, 5177];
    let connected = false;
    
    const tryNextPort = (index) => {
      if (index >= ports.length) {
        console.error('❌ Aucun serveur Vite trouvé');
        return;
      }
      
      const port = ports[index];
      mainWindow.loadURL(`http://localhost:${port}`)
        .then(() => {
          console.log(`✅ Connecté sur le port ${port}`);
          connected = true;
          // DevTools seulement si besoin (Ctrl+Shift+I pour ouvrir)
          // mainWindow.webContents.openDevTools();
        })
        .catch(() => {
          console.log(`❌ Port ${port} non disponible`);
          tryNextPort(index + 1);
        });
    };
    
    tryNextPort(0);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Gestion de la capture audio
ipcMain.handle('get-audio-sources', async () => {
  try {
    const sources = await desktopCapturer.getSources({
      types: ['audio', 'screen']
    });
    return sources;
  } catch (error) {
    console.error('Erreur lors de la récupération des sources audio:', error);
    return [];
  }
});

// Gestion du stockage des sessions
ipcMain.handle('save-session', async (event, sessionData) => {
  // À implémenter avec SQLite
  console.log('Session sauvegardée:', sessionData);
  return { success: true };
});

ipcMain.handle('get-sessions', async () => {
  // À implémenter avec SQLite
  return [];
});

// Initialisation de l'application
// Activer les permissions pour le microphone et Web Speech API
app.commandLine.appendSwitch('enable-speech-input');
app.commandLine.appendSwitch('enable-media-stream');
app.commandLine.appendSwitch('use-fake-ui-for-media-stream');
app.commandLine.appendSwitch('enable-web-bluetooth');

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Log des erreurs non gérées
process.on('uncaughtException', (error) => {
  console.error('Erreur non gérée:', error);
});
