import { BrowserWindow, screen, app } from 'electron';
import path from 'node:path';

const isDev = !app.isPackaged;

export function createFloatingWindow(): BrowserWindow {
  const { workArea } = screen.getPrimaryDisplay();

  const win = new BrowserWindow({
    width: 300,
    height: 380,
    x: workArea.x + workArea.width - 320,
    y: workArea.y + workArea.height - 400,
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    focusable: true,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      sandbox: false,
    },
  });

  win.setAlwaysOnTop(true, 'screen-saver');

  if (isDev && process.env.ELECTRON_RENDERER_URL) {
    win.loadURL(`${process.env.ELECTRON_RENDERER_URL}/floating.html?window=floating`);
  } else {
    win.loadFile(path.join(__dirname, '../renderer/floating.html'), { search: 'window=floating' });
  }

  return win;
}
