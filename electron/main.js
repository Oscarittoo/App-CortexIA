const { app, BrowserWindow, ipcMain, desktopCapturer, Tray, Menu, globalShortcut, nativeImage, screen } = require('electron');
const path = require('path');

let mainWindow = null;
let overlayWindow = null;
let tray = null;

// ─────────────────────────────────────────────
// Icône tray (PNG 16x16 embarquée en base64)
// ─────────────────────────────────────────────
function getTrayIcon() {
  // Petit carré bleu/violet 16x16 encodé en base64 — remplacez par votre vrai fichier .png
  const iconPath = path.join(__dirname, '..', 'src', 'assets', 'icon.png');
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
    },
    show: false,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
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
    const tryPorts = [5173, 5174, 5175];
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
  tray.setToolTip('CORTEXA — Cliquez pour ouvrir l\'overlay');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '▶  Démarrer une session (Ctrl+Shift+M)',
      click: () => createOverlayWindow(),
    },
    {
      label: '🪟  Ouvrir Cortexa',
      click: () => { createMainWindow(); mainWindow?.show(); mainWindow?.focus(); },
    },
    { type: 'separator' },
    {
      label: 'Quitter',
      click: () => { app.exit(0); },
    },
  ]);

  tray.setContextMenu(contextMenu);

  // Clic gauche = toggle overlay
  tray.on('click', () => createOverlayWindow());
}

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

  // Raccourci global Ctrl+Shift+M pour toggle l'overlay
  globalShortcut.register('CommandOrControl+Shift+M', () => {
    createOverlayWindow();
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

