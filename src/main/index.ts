import { app, BrowserWindow, ipcMain, screen, Notification } from 'electron';
import path from 'node:path';
import { createFloatingWindow } from './windows/floatingWindow';
import { PreferencesStore } from './services/preferences';
import { registerPrefsHandlers, registerDataHandlers, registerFocusHandlers, prefEvents } from './ipc/handlers';
import { openDatabase } from './services/database';
import { EventRepository } from './services/repository';
import { Tracker } from './services/tracker';
import { IdleMonitor } from './services/idle';
import { Focus } from './services/focus';
import { setAutoStart } from './services/autoStart';
import { createTray } from './services/tray';
import type { Preferences } from '../shared/types';

const isDev = !app.isPackaged;

// Handle --hidden CLI arg (set when auto-started on boot)
const startHidden = process.argv.includes('--hidden');

let mainWin: BrowserWindow | null = null;
let floatWin: BrowserWindow | null = null;
let tray: Electron.Tray | null = null;
let prefs: PreferencesStore;
let focus: Focus;

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
  const themeBg = prefs.get().theme === 'dark' ? '#1E1E2A' : '#F5F1E8';
  const win = new BrowserWindow({
    width: 960,
    height: 620,
    minWidth: 840,
    minHeight: 560,
    frame: false,
    backgroundColor: themeBg,
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

let moveDebounce: NodeJS.Timeout | null = null;

function attachFloatingMoveListener(w: BrowserWindow) {
  w.on('move', () => {
    if (moveDebounce) clearTimeout(moveDebounce);
    moveDebounce = setTimeout(() => {
      if (w.isDestroyed()) return;
      const [x, y] = w.getPosition();
      void prefs.set('floatingPos', { x, y });
    }, 500);
  });
}

app.whenReady().then(async () => {
  prefs = new PreferencesStore(app.getPath('userData'));
  await prefs.load();

  const dbPath = path.join(app.getPath('userData'), 'events.sqlite');
  const db = openDatabase(dbPath);
  const repo = new EventRepository(db);
  const tracker = new Tracker(repo);
  const idleMon = new IdleMonitor();

  tracker.start();
  idleMon.start();
  idleMon.on('idle', () => { if (prefs.get().idleDetection) tracker.pause(); });
  idleMon.on('active', () => tracker.resume());

  focus = new Focus();

  registerPrefsHandlers(prefs);
  registerFocusHandlers(focus);
  registerDataHandlers(repo, prefs, tracker, focus);

  // Auto-start from prefs
  setAutoStart(prefs.get().startOnBoot);

  // Sedentary reminder — every 45 min
  setInterval(() => {
    if (!prefs.get().sedentaryReminder) return;
    if (idleMon.isIdle()) return;
    if (focus.isRunning()) return;
    new Notification({
      title: '云云来提醒啦～',
      body: '站起来动一动吧，眼睛也歇一歇～',
      silent: false,
    }).show();
  }, 45 * 60 * 1000);

  // React to pref changes
  prefEvents.on('change', (p: Preferences, key: keyof Preferences) => {
    if (key === 'startOnBoot') setAutoStart(p.startOnBoot);
    if (key === 'floatingEnabled') {
      if (p.floatingEnabled && (!floatWin || floatWin.isDestroyed())) {
        floatWin = createFloatingWindow(prefs.get().floatingPos);
        attachFloatingMoveListener(floatWin);
      } else if (!p.floatingEnabled && floatWin && !floatWin.isDestroyed()) {
        floatWin.close();
        floatWin = null;
      }
    }
  });

  app.on('before-quit', () => {
    tracker.stop();
    idleMon.stop();
    db.close();
    if (tray) tray.destroy();
  });

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
  if (startHidden) mainWin.hide();

  if (prefs.get().floatingEnabled) {
    floatWin = createFloatingWindow(prefs.get().floatingPos);
    attachFloatingMoveListener(floatWin);
  }

  tray = createTray({
    getMainWin: () => mainWin,
    onStartFocus: () => focus.start(25),
    onPauseTracker: () => tracker.pause(),
    onOpenSettings: () => {
      const w = mainWin;
      if (w && !w.isDestroyed()) {
        if (w.isMinimized()) w.restore();
        w.show();
        w.focus();
      }
    },
    onQuit: () => app.quit(),
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWin = createMainWindow();
      if (prefs.get().floatingEnabled) {
        floatWin = createFloatingWindow(prefs.get().floatingPos);
        attachFloatingMoveListener(floatWin);
      }
    }
  });
});

// Keep app alive in tray when all windows are closed
app.on('window-all-closed', () => {
  // Intentionally do not quit — user quits via tray menu.
});
