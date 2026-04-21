import { contextBridge, ipcRenderer } from 'electron';
import type { Api, WindowKind, Preferences, TodaySummary, UsageEvent, TickPayload, CurrentAppInfo } from '../shared/types';
import { CH } from '../shared/channels';

const kind: WindowKind =
  new URLSearchParams(window.location.search).get('window') === 'floating' ? 'floating' : 'main';

const api: Api = {
  getWindowKind: () => kind,
  win: {
    minimize: () => { void ipcRenderer.invoke('win:minimize'); },
    maximize: () => { void ipcRenderer.invoke('win:maximize'); },
    close:    () => { void ipcRenderer.invoke('win:close'); },
  },
  floating: {
    startDrag: (offsetX: number, offsetY: number) => ipcRenderer.send('floating:start-drag', offsetX, offsetY),
    stopDrag:  () => ipcRenderer.send('floating:stop-drag'),
    openMain:  () => ipcRenderer.send('floating:open-main'),
  },
  prefs: {
    get: () => ipcRenderer.invoke(CH.PREFS_GET) as Promise<Preferences>,
    set: <K extends keyof Preferences>(key: K, value: Preferences[K]) =>
      ipcRenderer.invoke(CH.PREFS_SET, key, value) as Promise<Preferences>,
    onChange: (cb: (p: Preferences) => void) => {
      const listener = (_e: Electron.IpcRendererEvent, p: Preferences) => cb(p);
      ipcRenderer.on(CH.PREFS_CHANGED, listener);
      return () => { ipcRenderer.removeListener(CH.PREFS_CHANGED, listener); };
    },
  },
  data: {
    getToday:  (): Promise<TodaySummary>    => ipcRenderer.invoke(CH.TODAY_GET),
    getWeek:   (): Promise<TodaySummary[]>  => ipcRenderer.invoke(CH.HISTORY_GET_WEEK),
    clearAll:  (): Promise<void>            => ipcRenderer.invoke(CH.EVENTS_CLEAR),
    exportAll: (): Promise<UsageEvent[]>    => ipcRenderer.invoke(CH.EVENTS_EXPORT),
    onTick: (cb: (p: TickPayload) => void) => {
      const l = (_e: Electron.IpcRendererEvent, p: TickPayload) => cb(p);
      ipcRenderer.on(CH.TICK, l);
      return () => { ipcRenderer.removeListener(CH.TICK, l); };
    },
    onCurrentApp: (cb: (info: CurrentAppInfo | null) => void) => {
      const l = (_e: Electron.IpcRendererEvent, info: CurrentAppInfo | null) => cb(info);
      ipcRenderer.on(CH.CURRENT_APP, l);
      return () => { ipcRenderer.removeListener(CH.CURRENT_APP, l); };
    },
  },
};

contextBridge.exposeInMainWorld('api', api);
