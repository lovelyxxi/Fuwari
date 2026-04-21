import { contextBridge, ipcRenderer } from 'electron';
import type { Api, WindowKind, Preferences, TodaySummary, UsageEvent, TickPayload, CurrentAppInfo, FocusState } from '../shared/types';
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
    setPillRect: (rect: { x: number; y: number; w: number; h: number } | null) =>
      ipcRenderer.send(CH.FLOATING_SET_PILL_RECT, rect),
    onPillHover: (cb: (inside: boolean) => void) => {
      const l = (_e: Electron.IpcRendererEvent, inside: boolean) => cb(inside);
      ipcRenderer.on(CH.FLOATING_PILL_HOVER, l);
      return () => { ipcRenderer.removeListener(CH.FLOATING_PILL_HOVER, l); };
    },
    onContextMenu: (cb: () => void) => {
      const l = () => cb();
      ipcRenderer.on('floating:context-menu', l);
      return () => { ipcRenderer.removeListener('floating:context-menu', l); };
    },
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
  focus: {
    get:     (): Promise<FocusState> => ipcRenderer.invoke(CH.FOCUS_GET),
    start:   (mins?: number): Promise<void> => ipcRenderer.invoke(CH.FOCUS_START, mins),
    pause:   (): Promise<void> => ipcRenderer.invoke(CH.FOCUS_PAUSE),
    reset:   (): Promise<void> => ipcRenderer.invoke(CH.FOCUS_RESET),
    setTask: (t: string): Promise<void> => ipcRenderer.invoke(CH.FOCUS_SET_TASK, t),
    onUpdate: (cb: (s: FocusState) => void) => {
      const l = (_e: Electron.IpcRendererEvent, s: FocusState) => cb(s);
      ipcRenderer.on(CH.FOCUS_UPDATE, l);
      return () => { ipcRenderer.removeListener(CH.FOCUS_UPDATE, l); };
    },
  },
};

contextBridge.exposeInMainWorld('api', api);
