const { app, BrowserWindow, ipcMain, desktopCapturer, Tray, Menu, globalShortcut, nativeImage, screen } = require('electron');
const path = require('path');

// ─── INSTANCE UNIQUE ─────────────────────────────────────────────────────────
// Empêche l'ouverture de plusieurs instances (cause des 4 icônes dans le tray)
if (!app.requestSingleInstanceLock()) {
  process.exit(0);
}

let mainWindow = null;
let overlayWindow = null;
let tray = null;

// ─────────────────────────────────────────────
// Icône tray (PNG 16x16 embarquée en base64)
// ─────────────────────────────────────────────
function getTrayIcon() {
  // Petit carré bleu/violet 16x16 encodé en base64 — remplacez par votre vrai fichier .png
  // Cherche d'abord dans electron/ (packagé), puis dans src/assets/ (dev)
  const iconPath = app.isPackaged
    ? path.join(__dirname, 'icon.png')
    : path.join(__dirname, '..', 'src', 'assets', 'logo_meetizy.png');
  try {
    return nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });
  } catch (e) {
    return nativeImage.createEmpty();
  }
}

// ─────────────────────────────────────────────
// Fenêtre principale
// ─────────────────────────────────────────────
function createMainWindow() {
  if (mainWindow) { mainWindow.show(); mainWindow.focus(); return; }

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      zoomFactor: 1.0,
      // En packagé (file://), désactiver webSecurity pour éviter les erreurs CORS/AbortError avec Supabase
      webSecurity: !app.isPackaged,
    },
    show: false,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
  });

  // Forcer le zoom à 1.0 après le chargement (évite le zoom excessif sur écrans à haute densité)
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow?.webContents.setZoomFactor(1.0);
  });

  mainWindow.webContents.session.setPermissionRequestHandler((_wc, permission, callback) => {
    const allowed = ['media', 'microphone', 'audioCapture'];
    callback(allowed.includes(permission));
  });
  mainWindow.webContents.session.setPermissionCheckHandler((_wc, permission) => {
    return ['media', 'microphone', 'audioCapture'].includes(permission);
  });

  const isDev = !app.isPackaged;
  if (isDev) {
    const tryPorts = [5173, 5174, 5175, 5176, 5177, 5178];
    const tryNext = (i) => {
      if (i >= tryPorts.length) return;
      mainWindow.loadURL(`http://localhost:${tryPorts[i]}`)
        .catch(() => tryNext(i + 1));
    };
    tryNext(0);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.maximize();
    mainWindow.show();
  });
  mainWindow.on('close', (e) => {
    // Masquer dans le tray au lieu de quitter
    e.preventDefault();
    mainWindow.hide();
    if (process.platform === 'darwin') app.dock?.hide();
  });
  mainWindow.on('closed', () => { mainWindow = null; });
}

// ─────────────────────────────────────────────
// Fenêtre overlay flottante
// ─────────────────────────────────────────────
function createOverlayWindow() {
  if (overlayWindow) {
    if (overlayWindow.isVisible()) { overlayWindow.hide(); } else { overlayWindow.show(); overlayWindow.focus(); }
    return;
  }

  // Positionner en bas à droite de l'écran principal
  const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize;
  const W = 360, H = 340;

  overlayWindow = new BrowserWindow({
    width: W,
    height: H,
    x: sw - W - 20,
    y: sh - H - 20,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  overlayWindow.webContents.session.setPermissionRequestHandler((_wc, permission, callback) => {
    callback(['media', 'microphone', 'audioCapture'].includes(permission));
  });
  overlayWindow.webContents.session.setPermissionCheckHandler((_wc, permission) => {
    return ['media', 'microphone', 'audioCapture'].includes(permission);
  });

  overlayWindow.loadFile(path.join(__dirname, 'overlay.html'));
  overlayWindow.on('closed', () => { overlayWindow = null; });
}

// ─────────────────────────────────────────────
// Tray
// ─────────────────────────────────────────────
function createTray() {
  tray = new Tray(getTrayIcon());
  tray.setToolTip('MEETIZY — Cliquez pour ouvrir l\'overlay');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '▶  Démarrer une session (Ctrl+Shift+M)',
      click: () => {
        if (isAuthenticatedInMain) {
          createOverlayWindow();
        } else {
          createMainWindow(); mainWindow?.show(); mainWindow?.focus();
        }
      },
    },
    {
      label: '🫟  Ouvrir Meetizy',
      click: () => { createMainWindow(); mainWindow?.show(); mainWindow?.focus(); },
    },
    { type: 'separator' },
    {
      label: 'Quitter',
      click: () => { app.exit(0); },
    },
  ]);

  tray.setContextMenu(contextMenu);

  // Clic gauche = toggle overlay (seulement si authentifié, sinon ouvrir l'app)
  tray.on('click', () => {
    if (isAuthenticatedInMain) {
      createOverlayWindow();
    } else {
      createMainWindow(); mainWindow?.show(); mainWindow?.focus();
    }
  });
}

// ─────────────────────────────────────────────
// État d'authentification (partagé entre overlay et app principale)
// ─────────────────────────────────────────────
let isAuthenticatedInMain = false;

ipcMain.handle('auth-set-state', (_event, authenticated) => {
  isAuthenticatedInMain = authenticated;
});

// ─────────────────────────────────────────────
// IPC handlers
// ─────────────────────────────────────────────
ipcMain.handle('tray-open-main', () => {
  createMainWindow();
  mainWindow?.show();
  mainWindow?.focus();
});

ipcMain.handle('tray-close-overlay', () => {
  overlayWindow?.hide();
});

ipcMain.handle('tray-start-session', (_event, config) => {
  if (!isAuthenticatedInMain) {
    // Rediriger vers l'app principale pour se connecter
    createMainWindow();
    mainWindow?.show();
    mainWindow?.focus();
    return { error: 'not_authenticated' };
  }
  console.log('Session démarrée depuis overlay:', config);
});

ipcMain.handle('tray-stop-session', () => {
  createMainWindow();
  mainWindow?.show();
  mainWindow?.focus();
});

// Anciens handlers conservés
ipcMain.handle('get-audio-sources', async () => {
  try {
    return await desktopCapturer.getSources({ types: ['audio', 'screen'] });
  } catch { return []; }
});

ipcMain.handle('save-session', async (_event, sessionData) => {
  console.log('Session sauvegardée:', sessionData);
  return { success: true };
});

ipcMain.handle('get-sessions', async () => []);

// ─────────────────────────────────────────────
// App lifecycle
// ─────────────────────────────────────────────
app.commandLine.appendSwitch('enable-speech-input');
app.commandLine.appendSwitch('enable-media-stream');
// En développement uniquement : approuver automatiquement les demandes micro (évite les popups répétées)
if (!app.isPackaged) {
  app.commandLine.appendSwitch('use-fake-ui-for-media-stream');
}

app.whenReady().then(() => {
  createTray();
  createMainWindow();

  // Si une seconde instance tente de démarrer, focus sur la fenêtre existante
  app.on('second-instance', () => {
    if (mainWindow) { mainWindow.show(); mainWindow.focus(); }
  });

  // Raccourci global Ctrl+Shift+M pour toggle l'overlay (seulement si authentifié)
  globalShortcut.register('CommandOrControl+Shift+M', () => {
    if (isAuthenticatedInMain) {
      createOverlayWindow();
    } else {
      createMainWindow();
      mainWindow?.show();
      mainWindow?.focus();
    }
  });

  app.on('activate', () => {
    if (!mainWindow) createMainWindow();
    else { mainWindow.show(); mainWindow.focus(); }
  });
});

app.on('window-all-closed', () => {
  // Ne pas quitter — rester dans le tray
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

process.on('uncaughtException', (error) => {
  console.error('Erreur non gérée:', error);
});

