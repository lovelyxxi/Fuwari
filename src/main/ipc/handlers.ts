import { ipcMain, BrowserWindow } from 'electron';
import { CH } from '../../shared/channels';
import type { PreferencesStore } from '../services/preferences';
import type { Preferences, TodaySummary, TickPayload } from '../../shared/types';
import type { EventRepository } from '../services/repository';
import type { Tracker } from '../services/tracker';
import { aggregateDay, startOfToday } from '../services/aggregator';
import { computeMood } from '../services/mood';
import type { CurrentAppInfo } from '../../shared/types';

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

interface FocusQuery { isRunning: () => boolean; }

export function registerDataHandlers(
  repo: EventRepository,
  prefs: PreferencesStore,
  tracker: Tracker,
  focus: FocusQuery | null,
) {
  ipcMain.handle(CH.TODAY_GET, () => aggregateDay(repo, startOfToday()));

  ipcMain.handle(CH.HISTORY_GET_WEEK, () => {
    const days: TodaySummary[] = [];
    const today = startOfToday();
    for (let i = 6; i >= 0; i--) days.push(aggregateDay(repo, today - i * 86_400_000));
    return days;
  });

  ipcMain.handle(CH.EVENTS_CLEAR, () => { repo.deleteAll(); });

  ipcMain.handle(CH.EVENTS_EXPORT, () => {
    const from = Date.now() - 90 * 86_400_000;
    return repo.findInRange(from, Date.now());
  });

  // Push current-app change events from tracker to all windows
  tracker.on('change', (info: CurrentAppInfo) => {
    for (const w of BrowserWindow.getAllWindows()) w.webContents.send(CH.CURRENT_APP, info);
  });

  // Broadcast a tick every second with today summary + mood
  setInterval(() => {
    const info = tracker.currentInfo();
    const today = aggregateDay(repo, startOfToday());
    const mood = computeMood({
      totalMins: today.totalMins,
      hour: new Date().getHours(),
      anyAppOverLimit: anyAppOverLimit(today, prefs.get()),
      focusRunning: focus ? focus.isRunning() : false,
    });
    const payload: TickPayload = { current: info, today, mood };
    for (const w of BrowserWindow.getAllWindows()) {
      w.webContents.send(CH.TICK, payload);
    }
  }, 1000);
}

function anyAppOverLimit(summary: TodaySummary, prefs: Preferences): boolean {
  return summary.byApp.some((a) => {
    const limit = prefs.appLimits[a.appExe];
    return typeof limit === 'number' && a.mins >= limit;
  });
}
