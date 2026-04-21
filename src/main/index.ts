import { app, BrowserWindow, ipcMain, screen } from 'electron';
import path from 'node:path';
import { createFloatingWindow } from './windows/floatingWindow';
import { PreferencesStore } from './services/preferences';
import { registerPrefsHandlers } from './ipc/handlers';

const isDev = !app.isPackaged;

let mainWin: BrowserWindow | null = null;
let floatWin: BrowserWindow | null = null;
let prefs: PreferencesStore;

let dragMoveTimer: NodeJS.Timeout | null = null;
let dragOffset = { x: 0, y: 0 };
let dragFailsafeTimer: NodeJS.Timeout | null = null;

function stopFloatingDrag() {
  if (dragMoveTimer) { clearInterval(dragMoveTimer); dragMoveTimer = null; }
  if (dragFailsafeTimer) { clearTimeout(dragFailsafeTimer); dragFailsafeTimer = null; }
  if (!floatWin) return;

  const { x, y, width, height } = floatWin.getBounds();
  const { workArea } = screen.getPrimaryDisplay();
  let snappedX = x, snappedY = y;
  if (x < workArea.x + 20) snappedX = workArea.x;
  else if (x + width > workArea.x + workArea.width - 20) snappedX = workArea.x + workArea.width - width;
  if (y < workArea.y + 20) snappedY = workArea.y;
  else if (y + height > workArea.y + workArea.height - 20) snappedY = workArea.y + workArea.height - height;
  if (snappedX !== x || snappedY !== y) floatWin.setPosition(snappedX, snappedY);
}

function createMainWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 960,
    height: 620,
    minWidth: 840,
    minHeight: 560,
    frame: false,
    backgroundColor: '#F5F1E8',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      sandbox: false,
    },
  });

  if (isDev && process.env.ELECTRON_RENDERER_URL) {
    win.loadURL(`${process.env.ELECTRON_RENDERER_URL}/index.html`);
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    win.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  return win;
}

app.whenReady().then(async () => {
  prefs = new PreferencesStore(app.getPath('userData'));
  await prefs.load();
  registerPrefsHandlers(prefs);

  ipcMain.handle('win:minimize', (e) => BrowserWindow.fromWebContents(e.sender)?.minimize());
  ipcMain.handle('win:maximize', (e) => {
    const w = BrowserWindow.fromWebContents(e.sender);
    if (w?.isMaximized()) w.unmaximize();
    else w?.maximize();
  });
  ipcMain.handle('win:close', (e) => BrowserWindow.fromWebContents(e.sender)?.close());

  ipcMain.on('floating:start-drag', (_e, offsetX: number, offsetY: number) => {
    if (!floatWin) return;
    dragOffset = { x: offsetX, y: offsetY };
    if (dragMoveTimer) clearInterval(dragMoveTimer);
    dragMoveTimer = setInterval(() => {
      if (!floatWin) return;
      const p = screen.getCursorScreenPoint();
      floatWin.setPosition(p.x - dragOffset.x, p.y - dragOffset.y);
    }, 16);
    if (dragFailsafeTimer) clearTimeout(dragFailsafeTimer);
    dragFailsafeTimer = setTimeout(() => { if (dragMoveTimer) stopFloatingDrag(); }, 30_000);
  });

  ipcMain.on('floating:stop-drag', () => stopFloatingDrag());

  ipcMain.on('floating:open-main', () => {
    if (!mainWin || mainWin.isDestroyed()) {
      mainWin = createMainWindow();
      return;
    }
    if (mainWin.isMinimized()) mainWin.restore();
    mainWin.show();
    mainWin.focus();
  });

  mainWin = createMainWindow();
  floatWin = createFloatingWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWin = createMainWindow();
      floatWin = createFloatingWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
