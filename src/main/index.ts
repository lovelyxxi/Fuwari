import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';

const isDev = !app.isPackaged;

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

app.whenReady().then(() => {
  ipcMain.handle('win:minimize', (e) => BrowserWindow.fromWebContents(e.sender)?.minimize());
  ipcMain.handle('win:maximize', (e) => {
    const w = BrowserWindow.fromWebContents(e.sender);
    if (w?.isMaximized()) w.unmaximize();
    else w?.maximize();
  });
  ipcMain.handle('win:close', (e) => BrowserWindow.fromWebContents(e.sender)?.close());
  createMainWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
