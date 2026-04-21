import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import FloatingApp from './FloatingApp';

declare global {
  interface Window {
    api: import('../shared/types').Api;
  }
}

const kind = window.api.getWindowKind();
const Root = kind === 'floating' ? FloatingApp : App;

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
