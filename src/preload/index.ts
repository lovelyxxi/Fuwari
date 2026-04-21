import { contextBridge } from 'electron';
import type { Api, WindowKind } from '../shared/types';

const kind: WindowKind =
  new URLSearchParams(window.location.search).get('window') === 'floating' ? 'floating' : 'main';

const api: Api = {
  getWindowKind: () => kind,
};

contextBridge.exposeInMainWorld('api', api);
