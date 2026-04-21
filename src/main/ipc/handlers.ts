import { ipcMain, BrowserWindow } from 'electron';
import { CH } from '../../shared/channels';
import type { PreferencesStore } from '../services/preferences';
import type { Preferences } from '../../shared/types';

export function registerPrefsHandlers(prefs: PreferencesStore) {
  ipcMain.handle(CH.PREFS_GET, () => prefs.get());
  ipcMain.handle(CH.PREFS_SET, async (_e, key: keyof Preferences, value: Preferences[keyof Preferences]) => {
    const updated = await prefs.set(key, value as never);
    for (const w of BrowserWindow.getAllWindows()) {
      w.webContents.send(CH.PREFS_CHANGED, updated);
    }
    return updated;
  });
}
