import { contextBridge, ipcRenderer } from 'electron';
import type { Api, WindowKind } from '../shared/types';

const kind: WindowKind =
  new URLSearchParams(window.location.search).get('window') === 'floating' ? 'floating' : 'main';

const api: Api = {
  getWindowKind: () => kind,
  win: {
    minimize: () => { void ipcRenderer.invoke('win:minimize'); },
    maximize: () => { void ipcRenderer.invoke('win:maximize'); },
    close:    () => { void ipcRenderer.invoke('win:close'); },
  },
};

contextBridge.exposeInMainWorld('api', api);
