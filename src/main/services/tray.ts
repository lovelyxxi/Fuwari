import { Tray, Menu, nativeImage, app, BrowserWindow } from 'electron';
import path from 'node:path';

interface TrayCallbacks {
  getMainWin: () => BrowserWindow | null;
  onStartFocus: () => void;
  onPauseTracker: () => void;
  onOpenSettings: () => void;
  onQuit: () => void;
}

export function createTray(cb: TrayCallbacks): Tray {
  const iconPath = app.isPackaged
    ? path.join(process.resourcesPath, 'tray-icon.png')
    : path.join(__dirname, '../../resources/tray-icon.png');

  let img = nativeImage.createFromPath(iconPath);
  if (img.isEmpty()) {
    // Fallback: empty image so we don't crash during dev before the asset exists.
    img = nativeImage.createEmpty();
  } else {
    img = img.resize({ width: 16, height: 16 });
  }
  const tray = new Tray(img);

  const showMain = () => {
    const w = cb.getMainWin();
    if (w && !w.isDestroyed()) {
      if (w.isMinimized()) w.restore();
      w.show();
      w.focus();
    }
  };

  const menu = Menu.buildFromTemplate([
    { label: '打开主窗口', click: showMain },
    { label: '开始专注', click: cb.onStartFocus },
    { label: '暂停记录', click: cb.onPauseTracker },
    { type: 'separator' },
    { label: '设置', click: cb.onOpenSettings },
    { label: '退出', click: cb.onQuit },
  ]);
  tray.setToolTip('屏幕使用时间 · 云云');
  tray.setContextMenu(menu);
  tray.on('double-click', showMain);
  return tray;
}
