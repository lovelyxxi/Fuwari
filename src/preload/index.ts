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
  floating: {
    startDrag: (offsetX: number, offsetY: number) => ipcRenderer.send('floating:start-drag', offsetX, offsetY),
    stopDrag:  () => ipcRenderer.send('floating:stop-drag'),
    openMain:  () => ipcRenderer.send('floating:open-main'),
  },
};

contextBridge.exposeInMainWorld('api', api);
