# CloudCloud (屏幕使用时间 · 云云) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Windows desktop screen-time tracker as an Electron + React + TypeScript application, faithful to the hand-drawn "CloudCloud" design handoff in this repo.

**Architecture:** A single Electron app with **two BrowserWindows** (main + floating widget) sharing a bundled React renderer. The main process owns a `better-sqlite3` database, a per-second foreground-app tracker (via `get-windows`), an idle detector (Electron `powerMonitor`), a JSON preferences store, and a typed IPC bridge. The renderer reads aggregated state through a preload-exposed `window.api` and renders the six-tab main window and three-variant floating widget using hand-drawn CSS tokens ported verbatim from `styles.css`.

**Tech Stack:**
- **Runtime:** Electron 31 (Node 20+ built-in)
- **Build:** `electron-vite` (Vite + TypeScript, separate bundles for main/preload/renderer)
- **UI:** React 18, TypeScript strict mode
- **State:** Zustand (renderer-side store), IPC for main↔renderer sync
- **DB:** `better-sqlite3`
- **Native:** `get-windows` (foreground app), Electron `powerMonitor` (idle), Electron `Tray`, `app.setLoginItemSettings`
- **Testing:** `vitest` + `@testing-library/react` + `happy-dom`
- **Package:** `pnpm` (works fine with npm/yarn too)

> **Scope note for the executor.** This plan covers ~45 tasks organized into 10 phases. Each phase ends with a runnable checkpoint. Recommended execution split: **Session 1** = Phases 1–4 (scaffold + main window UI with mock data), **Session 2** = Phases 5–6 (floating widget + preferences), **Session 3** = Phases 7–10 (SQLite + Windows tracker + IPC + polish). Do NOT attempt all phases in one session without review.

---

## File Structure

```
package.json
tsconfig.json
tsconfig.node.json
electron.vite.config.ts
.gitignore
.eslintrc.cjs
.prettierrc

src/
  main/                            # Electron main process
    index.ts                       # App entry + lifecycle
    windows/
      mainWindow.ts                # Main BrowserWindow
      floatingWindow.ts            # Frameless always-on-top widget
    services/
      database.ts                  # better-sqlite3 singleton + migrations
      repository.ts                # Event CRUD
      aggregator.ts                # Compute today/hourly/byApp/byCategory
      tracker.ts                   # Per-second foreground-app poller
      idle.ts                      # powerMonitor-based idle detection
      categorizer.ts               # exe name → category
      preferences.ts               # Load/save JSON prefs
      autoStart.ts                 # HKCU run-key via setLoginItemSettings
      tray.ts                      # System tray icon + menu
      focus.ts                     # Pomodoro state machine
      mood.ts                      # Mood rule engine
    ipc/
      channels.ts                  # Channel name constants (shared)
      handlers.ts                  # registerIpc(main)
    types.ts                       # Main-only types

  preload/
    index.ts                       # contextBridge.exposeInMainWorld('api', …)

  shared/
    types.ts                       # Types shared by main + renderer
    tokens.ts                      # Mood enum, category enum, hour count, etc.

  renderer/
    main.tsx                       # Renderer entry (mounts App or FloatingApp per ?window=)
    index.html                     # Main window HTML
    floating.html                  # Floating widget HTML
    App.tsx                        # Main window root
    FloatingApp.tsx                # Floating widget root
    styles/
      tokens.css                   # CSS vars (light + .theme-dark)
      base.css                     # Body / font / reset
      doodle.css                   # Ported from styles.css
    api/
      bridge.ts                    # Typed wrapper for window.api
    state/
      store.ts                     # Zustand store + IPC sync
    hooks/
      useToday.ts
      useMood.ts
      usePrefs.ts
    components/
      mascots/
        CloudMascot.tsx
        JellyMascot.tsx
      primitives/
        AppIcon.tsx
        Star.tsx
        SunDoodle.tsx
        TomatoDoodle.tsx
        HandLine.tsx
        Chip.tsx
        DoodleButton.tsx
      window/
        WinChrome.tsx
        WinBtn.tsx
    main-window/
      MainWindow.tsx
      Sidebar.tsx
      tabs/
        TabToday.tsx
        TabApps.tsx
        TabTimeline.tsx
        TabStats.tsx
        TabFocus.tsx
        TabSettings.tsx
      widgets/
        PieDoodle.tsx
        TimelineMini.tsx
        StatCard.tsx
        HighlightCard.tsx
        SettingCard.tsx
    floating/
      FloatingWidget.tsx
      variants/
        PillAvatar.tsx              # Variant A
        PillBar.tsx                 # Variant B
        StandingMascot.tsx          # Variant C
      popovers/
        ExpandedCard.tsx
        HoverTooltip.tsx
        ContextMenu.tsx
    utils/
      fmt.ts                        # fmtMins
    __tests__/                      # Vitest co-located or here
```

---

# Phase 1 — Project Scaffold

### Task 1: Initialize repository and package.json

**Files:**
- Create: `.gitignore`
- Create: `package.json`
- Create: `pnpm-workspace.yaml` (optional, skip if using npm)

- [ ] **Step 1: Initialize git**

Run:
```bash
cd "C:/Users/babyxxi/Documents/design_handoff_screen_time_cloud"
git init
git add README.md *.jsx *.css "屏幕使用时间 云云.html"
git commit -m "chore: initial design handoff files"
```

- [ ] **Step 2: Create `.gitignore`**

```
node_modules/
dist/
out/
.vite/
*.log
.env
.env.local
*.sqlite
*.sqlite-journal
.DS_Store
Thumbs.db
```

- [ ] **Step 3: Create `package.json`**

```json
{
  "name": "screen-time-cloud",
  "version": "0.1.0",
  "private": true,
  "description": "屏幕使用时间 · 云云 — Windows screen time tracker",
  "main": "out/main/index.js",
  "scripts": {
    "dev": "electron-vite dev",
    "build": "electron-vite build",
    "start": "electron-vite preview",
    "typecheck": "tsc --noEmit -p tsconfig.json && tsc --noEmit -p tsconfig.node.json",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint --ext .ts,.tsx src",
    "format": "prettier --write \"src/**/*.{ts,tsx,css}\"",
    "pack": "electron-vite build && electron-builder --dir",
    "dist": "electron-vite build && electron-builder"
  },
  "dependencies": {
    "better-sqlite3": "^11.3.0",
    "get-windows": "^9.2.0",
    "zustand": "^4.5.5"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.5.0",
    "@testing-library/react": "^16.0.1",
    "@types/better-sqlite3": "^7.6.11",
    "@types/node": "^20.16.10",
    "@types/react": "^18.3.11",
    "@types/react-dom": "^18.3.0",
    "@typescript-eslint/eslint-plugin": "^8.8.0",
    "@typescript-eslint/parser": "^8.8.0",
    "@vitejs/plugin-react": "^4.3.2",
    "electron": "^31.6.0",
    "electron-builder": "^25.1.6",
    "electron-vite": "^2.3.0",
    "eslint": "^8.57.1",
    "eslint-plugin-react-hooks": "^4.6.2",
    "happy-dom": "^15.7.4",
    "prettier": "^3.3.3",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "typescript": "^5.6.2",
    "vitest": "^2.1.2"
  },
  "build": {
    "appId": "app.cloudcloud.screentime",
    "productName": "CloudCloud",
    "directories": { "output": "dist" },
    "files": ["out/**/*"],
    "win": { "target": ["nsis"] }
  }
}
```

- [ ] **Step 4: Install dependencies**

Run: `pnpm install` (or `npm install`)
Expected: no errors; `better-sqlite3` may download a prebuilt binary for Windows Node ABI.

- [ ] **Step 5: Commit**

```bash
git add .gitignore package.json pnpm-lock.yaml
git commit -m "chore: scaffold package.json with electron-vite stack"
```

---

### Task 2: TypeScript + Vite + ESLint config

**Files:**
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `electron.vite.config.ts`
- Create: `.eslintrc.cjs`
- Create: `.prettierrc`

- [ ] **Step 1: Write `tsconfig.json` (renderer + shared)**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "types": ["vite/client", "node"],
    "baseUrl": ".",
    "paths": {
      "@shared/*": ["src/shared/*"],
      "@renderer/*": ["src/renderer/*"]
    }
  },
  "include": ["src/renderer/**/*", "src/preload/**/*", "src/shared/**/*"]
}
```

- [ ] **Step 2: Write `tsconfig.node.json` (main process)**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "types": ["node"],
    "baseUrl": ".",
    "paths": {
      "@shared/*": ["src/shared/*"]
    }
  },
  "include": ["src/main/**/*", "src/shared/**/*", "electron.vite.config.ts"]
}
```

- [ ] **Step 3: Write `electron.vite.config.ts`**

```ts
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

const alias = {
  '@shared': path.resolve(__dirname, 'src/shared'),
  '@renderer': path.resolve(__dirname, 'src/renderer'),
};

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: { alias },
    build: { outDir: 'out/main' },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    resolve: { alias },
    build: { outDir: 'out/preload' },
  },
  renderer: {
    root: 'src/renderer',
    plugins: [react()],
    resolve: { alias },
    build: {
      outDir: 'out/renderer',
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'src/renderer/index.html'),
          floating: path.resolve(__dirname, 'src/renderer/floating.html'),
        },
      },
    },
  },
});
```

- [ ] **Step 4: Write `.eslintrc.cjs`**

```js
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 2022, sourceType: 'module', ecmaFeatures: { jsx: true } },
  plugins: ['@typescript-eslint', 'react-hooks'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  rules: {
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  },
  ignorePatterns: ['out', 'dist', 'node_modules'],
};
```

- [ ] **Step 5: Write `.prettierrc`**

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2
}
```

- [ ] **Step 6: Verify typecheck passes**

Run: `pnpm typecheck`
Expected: "error TS18003: No inputs were found …" — expected until we add source files in later tasks. Confirm the configs parse without syntax errors. (The inputs-missing error means both configs loaded correctly.)

- [ ] **Step 7: Commit**

```bash
git add tsconfig.json tsconfig.node.json electron.vite.config.ts .eslintrc.cjs .prettierrc
git commit -m "chore: configure typescript, electron-vite, eslint, prettier"
```

---

### Task 3: Minimum-viable main + preload + renderer hello world

**Files:**
- Create: `src/shared/types.ts`
- Create: `src/main/index.ts`
- Create: `src/preload/index.ts`
- Create: `src/renderer/index.html`
- Create: `src/renderer/floating.html`
- Create: `src/renderer/main.tsx`
- Create: `src/renderer/App.tsx`
- Create: `src/renderer/FloatingApp.tsx`

- [ ] **Step 1: Write `src/shared/types.ts` (placeholder)**

```ts
export type WindowKind = 'main' | 'floating';

export interface Api {
  getWindowKind: () => WindowKind;
}
```

- [ ] **Step 2: Write `src/main/index.ts`**

```ts
import { app, BrowserWindow } from 'electron';
import path from 'node:path';

const isDev = !app.isPackaged;

function createMainWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 960,
    height: 620,
    minWidth: 840,
    minHeight: 560,
    frame: false,
    backgroundColor: '#F5F1E8',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      sandbox: false,
    },
  });

  if (isDev && process.env.ELECTRON_RENDERER_URL) {
    win.loadURL(`${process.env.ELECTRON_RENDERER_URL}/index.html`);
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    win.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  return win;
}

app.whenReady().then(() => {
  createMainWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
```

- [ ] **Step 3: Write `src/preload/index.ts`**

```ts
import { contextBridge } from 'electron';
import type { Api, WindowKind } from '../shared/types';

const kind: WindowKind =
  new URLSearchParams(window.location.search).get('window') === 'floating' ? 'floating' : 'main';

const api: Api = {
  getWindowKind: () => kind,
};

contextBridge.exposeInMainWorld('api', api);
```

- [ ] **Step 4: Write `src/renderer/index.html`**

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>屏幕使用时间 · 云云</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 5: Write `src/renderer/floating.html`**

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <title>云云</title>
  </head>
  <body style="background: transparent; margin: 0;">
    <div id="root"></div>
    <script type="module" src="/main.tsx?window=floating"></script>
  </body>
</html>
```

- [ ] **Step 6: Write `src/renderer/main.tsx`**

```tsx
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
```

- [ ] **Step 7: Write `src/renderer/App.tsx`**

```tsx
export default function App() {
  return <div style={{ padding: 40, fontFamily: 'system-ui' }}>Hello CloudCloud 👋</div>;
}
```

- [ ] **Step 8: Write `src/renderer/FloatingApp.tsx`**

```tsx
export default function FloatingApp() {
  return (
    <div style={{ padding: 12, fontFamily: 'system-ui', background: '#FDFCF8', borderRadius: 16 }}>
      Floating ☁
    </div>
  );
}
```

- [ ] **Step 9: Run dev server and verify**

Run: `pnpm dev`
Expected: Electron window opens showing "Hello CloudCloud 👋"; DevTools opens detached. Close the app.

- [ ] **Step 10: Commit**

```bash
git add src tsconfig.json
git commit -m "feat: minimal electron main + preload + react renderer"
```

---

# Phase 2 — Design System Primitives

### Task 4: Port `styles.css` to scoped token + doodle CSS

**Files:**
- Create: `src/renderer/styles/tokens.css`
- Create: `src/renderer/styles/base.css`
- Create: `src/renderer/styles/doodle.css`

- [ ] **Step 1: Write `src/renderer/styles/tokens.css`**

Port the `:root` + `.theme-dark` blocks verbatim from `styles.css` (lines 4–42), plus the Google Fonts `@import` line. Keep all CSS variable names identical (`--paper`, `--ink`, `--mint`, etc.) so later inline styles referencing them work unchanged.

```css
@import url('https://fonts.googleapis.com/css2?family=Gaegu:wght@400;700&family=Nunito:wght@400;600;700;800&family=Caveat:wght@500;700&display=swap');

:root {
  --paper: #F5F1E8;
  --paper-deep: #ECE6D6;
  --ink: #2A2A3C;
  --ink-soft: #5A5A72;
  --ink-mute: #9A9AB0;

  --blue: #A4C8F0;
  --blue-deep: #7FA8D6;
  --lilac: #C8B6FF;
  --lilac-deep: #A88FE3;
  --mint: #B8E0D2;
  --mint-deep: #8FC4B0;
  --peach: #FFCFB8;
  --peach-deep: #E8A085;
  --lemon: #FFE5A8;

  --cloud-white: #FDFCF8;
  --line: #2A2A3C;
  --shadow-ink: rgba(42, 42, 60, 0.12);

  --font-sans: 'Nunito', 'PingFang SC', 'Microsoft YaHei', system-ui, sans-serif;
  --font-hand: 'Caveat', 'Gaegu', 'Nunito', cursive;
  --font-hand-cn: 'Gaegu', 'Nunito', 'PingFang SC', cursive;
}

.theme-dark {
  --paper: #1E1E2A;
  --paper-deep: #151520;
  --ink: #F0ECE0;
  --ink-soft: #BDBACF;
  --ink-mute: #6A6A82;
  --cloud-white: #2A2A3A;
  --line: #F0ECE0;
  --shadow-ink: rgba(0, 0, 0, 0.4);
}
```

- [ ] **Step 2: Write `src/renderer/styles/base.css`**

```css
* { box-sizing: border-box; }
html, body, #root { height: 100%; }
body {
  margin: 0;
  font-family: var(--font-sans);
  color: var(--ink);
  background: var(--paper);
}
button { font-family: inherit; }
```

- [ ] **Step 3: Write `src/renderer/styles/doodle.css`**

Port lines 48–187 of `styles.css` verbatim: `.doodle-border`, `.doodle-border.b-tight`, `.doodle-border.b-round`, `.hand-underline`, `.btn-doodle` (+ variants), `.paper-bg`, `.paper-bg-lines`, `.hr-wavy` (keep the inline SVG data-URI), `.tab-doodle`, `.chip`, `.scroll-hide`, `.animate-floaty`, `.animate-wobble`, `.animate-blink`, `.dash-border`, `.dots-bg`, `.bar-doodle`, and all `@keyframes` blocks (`floaty`, `wobble`, `blink`).

- [ ] **Step 4: Import styles in `main.tsx`**

Edit `src/renderer/main.tsx` — add three imports at top:

```tsx
import './styles/tokens.css';
import './styles/base.css';
import './styles/doodle.css';
```

- [ ] **Step 5: Update `App.tsx` to verify styles load**

```tsx
export default function App() {
  return (
    <div className="paper-bg" style={{ padding: 40 }}>
      <div className="doodle-border" style={{ padding: 20, background: 'var(--cloud-white)' }}>
        <div style={{ fontFamily: 'var(--font-hand)', fontSize: 32 }}>Hello CloudCloud ☁</div>
        <button className="btn-doodle primary" style={{ marginTop: 12 }}>点我试试</button>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Run and visually verify**

Run: `pnpm dev`
Expected: see cream paper background, doodle-bordered card, "Hello CloudCloud" in Caveat handwriting, lilac doodle button with drop-shadow offset. Fonts may take a moment to load from Google.

- [ ] **Step 7: Commit**

```bash
git add src/renderer/styles src/renderer/main.tsx src/renderer/App.tsx
git commit -m "feat(styles): port doodle design tokens and base styles"
```

---

### Task 5: Shared tokens + `fmtMins` utility (with tests)

**Files:**
- Create: `src/shared/tokens.ts`
- Create: `src/renderer/utils/fmt.ts`
- Create: `src/renderer/utils/fmt.test.ts`

- [ ] **Step 1: Write `src/shared/tokens.ts`**

```ts
export type Mood = 'happy' | 'calm' | 'sleepy' | 'worried' | 'alert';

export type Category = '工作' | '沟通' | '浏览' | '娱乐' | '其他';

export const CATEGORY_COLORS: Record<Category, string> = {
  工作: 'var(--mint)',
  沟通: 'var(--blue)',
  浏览: 'var(--lilac)',
  娱乐: 'var(--peach)',
  其他: 'var(--lemon)',
};

export type FloatingVariant = 'A' | 'B' | 'C';
export type MascotKind = 'cloud' | 'jelly';
export type Theme = 'light' | 'dark';

export const HOURS_PER_DAY = 24;
```

- [ ] **Step 2: Write failing test `src/renderer/utils/fmt.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { fmtMins } from './fmt';

describe('fmtMins', () => {
  it('formats minutes under an hour as "Nm"', () => {
    expect(fmtMins(42)).toBe('42分');
  });
  it('formats whole hours as "Nh"', () => {
    expect(fmtMins(120)).toBe('2时');
  });
  it('formats hours with remainder as "XhYm"', () => {
    expect(fmtMins(183)).toBe('3时3分');
  });
  it('returns "0分" for zero', () => {
    expect(fmtMins(0)).toBe('0分');
  });
});
```

- [ ] **Step 3: Configure vitest**

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: { environment: 'happy-dom', globals: false },
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, 'src/shared'),
      '@renderer': path.resolve(__dirname, 'src/renderer'),
    },
  },
});
```

- [ ] **Step 4: Run the test — expect FAIL**

Run: `pnpm test`
Expected: `Cannot find module './fmt'` or similar — confirms the test is in place.

- [ ] **Step 5: Implement `src/renderer/utils/fmt.ts`**

```ts
export function fmtMins(totalMins: number): string {
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  if (h === 0) return `${m}分`;
  if (m === 0) return `${h}时`;
  return `${h}时${m}分`;
}
```

- [ ] **Step 6: Run tests — expect PASS**

Run: `pnpm test`
Expected: all 4 `fmtMins` assertions pass.

- [ ] **Step 7: Commit**

```bash
git add src/shared/tokens.ts src/renderer/utils vitest.config.ts
git commit -m "feat(shared): add tokens and fmtMins utility"
```

---

### Task 6: CloudMascot component

**Files:**
- Create: `src/renderer/components/mascots/CloudMascot.tsx`
- Create: `src/renderer/components/mascots/CloudMascot.test.tsx`

- [ ] **Step 1: Write render test**

```tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { CloudMascot } from './CloudMascot';

describe('CloudMascot', () => {
  it('renders an SVG scaled by size prop', () => {
    const { container } = render(<CloudMascot size={120} mood="happy" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg!.getAttribute('width')).toBe('120');
  });

  it('applies wobble animation class when wobble=true (default)', () => {
    const { container } = render(<CloudMascot size={40} mood="calm" />);
    expect(container.querySelector('svg')!.className.baseVal).toContain('animate-wobble');
  });

  it('omits wobble class when wobble=false', () => {
    const { container } = render(<CloudMascot size={40} mood="calm" wobble={false} />);
    expect(container.querySelector('svg')!.className.baseVal).not.toContain('animate-wobble');
  });
});
```

- [ ] **Step 2: Add `happy-dom` global setup for tests**

Edit `vitest.config.ts` — replace `globals: false` with `globals: true` and add `setupFiles`:

```ts
test: {
  environment: 'happy-dom',
  globals: true,
  setupFiles: ['./src/renderer/test-setup.ts'],
},
```

Create `src/renderer/test-setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 3: Run test — expect FAIL (module not found)**

Run: `pnpm test CloudMascot`

- [ ] **Step 4: Implement `src/renderer/components/mascots/CloudMascot.tsx`**

Port `cloud-mascot.jsx` (lines 4–98) to TSX. Changes:
- Add typed props interface `{ size?: number; mood?: Mood; wobble?: boolean }` importing `Mood` from `@shared/tokens`.
- Replace `function CloudMascot(…)` with `export function CloudMascot(…)`.
- Keep the entire `expr` map, the `W=120 H=90` SVG, all paths, ellipses, eye/mouth variants unchanged.
- Remove the `Object.assign(window, …)` line at the bottom.

Skeleton:

```tsx
import type { Mood } from '@shared/tokens';

interface CloudMascotProps {
  size?: number;
  mood?: Mood;
  wobble?: boolean;
}

export function CloudMascot({ size = 80, mood = 'happy', wobble = true }: CloudMascotProps) {
  const expr = {
    happy:   { eye: 'dot',  mouth: 'smile' },
    calm:    { eye: 'line', mouth: 'flat' },
    sleepy:  { eye: 'zz',   mouth: 'o' },
    worried: { eye: 'wide', mouth: 'wobble' },
    alert:   { eye: 'wide', mouth: 'smile' },
  }[mood];

  const W = 120, H = 90;
  return (
    <svg
      width={size}
      height={(size * H) / W}
      viewBox={`0 0 ${W} ${H}`}
      className={wobble ? 'animate-wobble' : ''}
      style={{ overflow: 'visible' }}
    >
      {/* …copy the rest verbatim from cloud-mascot.jsx lines 23–95 … */}
    </svg>
  );
}
```

Copy every SVG node from `cloud-mascot.jsx` exactly (shadow ellipse, cloud path, rouge, eye variants by `expr.eye`, mouth variants by `expr.mouth`).

- [ ] **Step 5: Run tests — expect PASS**

Run: `pnpm test CloudMascot`
Expected: 3/3 pass.

- [ ] **Step 6: Commit**

```bash
git add src/renderer/components/mascots/CloudMascot.tsx src/renderer/components/mascots/CloudMascot.test.tsx src/renderer/test-setup.ts vitest.config.ts
git commit -m "feat(mascot): port CloudMascot with 5 mood variants"
```

---

### Task 7: JellyMascot component

**Files:**
- Create: `src/renderer/components/mascots/JellyMascot.tsx`

- [ ] **Step 1: Implement `JellyMascot.tsx`**

Port `cloud-mascot.jsx` lines 101–135 to TSX with typed props `{ size?: number; mood?: Mood }`. Keep the `W=100 H=110` viewBox, the lilac jelly body path, highlight, rouge, eyes, smile. Remove the `Object.assign` line.

```tsx
import type { Mood } from '@shared/tokens';

interface JellyMascotProps {
  size?: number;
  mood?: Mood;
}

export function JellyMascot({ size = 80, mood: _mood = 'happy' }: JellyMascotProps) {
  const W = 100, H = 110;
  return (
    <svg
      width={size}
      height={(size * H) / W}
      viewBox={`0 0 ${W} ${H}`}
      className="animate-wobble"
      style={{ overflow: 'visible' }}
    >
      {/* paste lines 105–132 of cloud-mascot.jsx verbatim */}
    </svg>
  );
}
```

- [ ] **Step 2: Smoke test**

Temporarily import `JellyMascot` into `App.tsx` and render at size 100. Run `pnpm dev` and visually confirm the lilac jelly shape renders with wobble animation. Then revert `App.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/renderer/components/mascots/JellyMascot.tsx
git commit -m "feat(mascot): port JellyMascot component"
```

---

### Task 8: Shared primitives — AppIcon, Star, SunDoodle, TomatoDoodle, HandLine, Chip, DoodleButton

**Files:**
- Create: `src/renderer/components/primitives/AppIcon.tsx`
- Create: `src/renderer/components/primitives/Star.tsx`
- Create: `src/renderer/components/primitives/SunDoodle.tsx`
- Create: `src/renderer/components/primitives/TomatoDoodle.tsx`
- Create: `src/renderer/components/primitives/HandLine.tsx`
- Create: `src/renderer/components/primitives/Chip.tsx`
- Create: `src/renderer/components/primitives/DoodleButton.tsx`

- [ ] **Step 1: `AppIcon.tsx`**

Port `data.jsx` lines 12–40. Add typed `AppIconKind` union:

```tsx
export type AppIconKind =
  | 'code' | 'design' | 'chat' | 'doc' | 'video' | 'music'
  | 'browse' | 'mail' | 'game' | 'shop' | 'term' | 'draw';

interface AppIconProps {
  kind: AppIconKind;
  size?: number;
}

export function AppIcon({ kind, size = 32 }: AppIconProps) {
  const icons: Record<AppIconKind, { bg: string; glyph: string; fg: string }> = {
    code:   { bg: '#2A2A3C', glyph: '</>', fg: '#B8E0D2' },
    design: { bg: '#C8B6FF', glyph: '✎',  fg: '#2A2A3C' },
    chat:   { bg: '#A4C8F0', glyph: '💬', fg: '#2A2A3C' },
    doc:    { bg: '#FFE5A8', glyph: '📄', fg: '#2A2A3C' },
    video:  { bg: '#FFCFB8', glyph: '▶',  fg: '#2A2A3C' },
    music:  { bg: '#B8E0D2', glyph: '♪',  fg: '#2A2A3C' },
    browse: { bg: '#A4C8F0', glyph: '🌐', fg: '#2A2A3C' },
    mail:   { bg: '#C8B6FF', glyph: '✉',  fg: '#2A2A3C' },
    game:   { bg: '#FFCFB8', glyph: '♥',  fg: '#2A2A3C' },
    shop:   { bg: '#FFE5A8', glyph: '🛍', fg: '#2A2A3C' },
    term:   { bg: '#2A2A3C', glyph: '_',  fg: '#B8E0D2' },
    draw:   { bg: '#B8E0D2', glyph: '✏',  fg: '#2A2A3C' },
  };
  const i = icons[kind];
  return (
    <div
      style={{
        width: size,
        height: size,
        background: i.bg,
        color: i.fg,
        border: '2px solid var(--line)',
        borderRadius: `${size * 0.28}px ${size * 0.32}px ${size * 0.28}px ${size * 0.32}px / ${size * 0.32}px ${size * 0.28}px ${size * 0.32}px ${size * 0.28}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.5,
        fontWeight: 700,
        flexShrink: 0,
        lineHeight: 1,
      }}
    >
      {i.glyph}
    </div>
  );
}
```

- [ ] **Step 2: `Star.tsx`**

Port `data.jsx` lines 99–108.

```tsx
interface StarProps { size?: number; fill?: string; }
export function Star({ size = 14, fill = 'var(--lemon)' }: StarProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" style={{ display: 'inline-block' }}>
      <path
        d="M 10 2 L 12 7 L 17 8 L 13 12 L 14 17 L 10 14.5 L 6 17 L 7 12 L 3 8 L 8 7 Z"
        fill={fill}
        stroke="var(--line)"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}
```

- [ ] **Step 3: `SunDoodle.tsx`**

Port `data.jsx` lines 111–125.

```tsx
export function SunDoodle({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40">
      <circle cx="20" cy="20" r="7" fill="var(--lemon)" stroke="var(--line)" strokeWidth="2" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
        const r = (a * Math.PI) / 180;
        const x1 = 20 + Math.cos(r) * 10;
        const y1 = 20 + Math.sin(r) * 10;
        const x2 = 20 + Math.cos(r) * 15;
        const y2 = 20 + Math.sin(r) * 15;
        return (
          <line key={a} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="var(--line)" strokeWidth="2" strokeLinecap="round" />
        );
      })}
    </svg>
  );
}
```

- [ ] **Step 4: `TomatoDoodle.tsx`**

Port `data.jsx` lines 128–139 verbatim as a named export (same visual: peach body, white highlight, mint leaf).

- [ ] **Step 5: `HandLine.tsx`**

Port `data.jsx` lines 87–96 verbatim with typed props `{ w?: number; color?: string; thickness?: number }`. Note: the `Math.random()` call in the path makes renders non-deterministic — keep this for the hand-drawn feel but memoize the seed in a `useMemo` so re-renders are stable:

```tsx
import { useMemo } from 'react';

interface HandLineProps { w?: number; color?: string; thickness?: number; }
export function HandLine({ w = 100, color = 'var(--ink)', thickness = 2 }: HandLineProps) {
  const midY = useMemo(() => (Math.random() > 0.5 ? 1 : 5), []);
  return (
    <svg width={w} height={6} viewBox={`0 0 ${w} 6`} style={{ display: 'block' }}>
      <path
        d={`M 2 3 Q ${w * 0.25} ${midY} ${w * 0.5} 3 T ${w - 2} 3`}
        fill="none"
        stroke={color}
        strokeWidth={thickness}
        strokeLinecap="round"
      />
    </svg>
  );
}
```

- [ ] **Step 6: `Chip.tsx`**

```tsx
import type { CSSProperties, ReactNode } from 'react';

interface ChipProps { children: ReactNode; bg?: string; style?: CSSProperties; }
export function Chip({ children, bg, style }: ChipProps) {
  return (
    <span className="chip" style={{ background: bg ?? 'var(--cloud-white)', ...style }}>
      {children}
    </span>
  );
}
```

- [ ] **Step 7: `DoodleButton.tsx`**

```tsx
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'default' | 'primary' | 'mint' | 'blue' | 'peach';

interface DoodleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

export function DoodleButton({ variant = 'default', className, children, ...rest }: DoodleButtonProps) {
  const cls = ['btn-doodle', variant !== 'default' ? variant : '', className ?? ''].filter(Boolean).join(' ');
  return <button className={cls} {...rest}>{children}</button>;
}
```

- [ ] **Step 8: Verify typecheck**

Run: `pnpm typecheck`
Expected: 0 errors.

- [ ] **Step 9: Commit**

```bash
git add src/renderer/components/primitives
git commit -m "feat(primitives): AppIcon, Star, SunDoodle, TomatoDoodle, HandLine, Chip, DoodleButton"
```

---

# Phase 3 — Main Window Shell

### Task 9: Window chrome — `WinChrome` + `WinBtn`

**Files:**
- Create: `src/renderer/components/window/WinBtn.tsx`
- Create: `src/renderer/components/window/WinChrome.tsx`

- [ ] **Step 1: Write `WinBtn.tsx`**

Port `main-window.jsx` lines 40–59. Add typed props:

```tsx
import { useState, type MouseEventHandler } from 'react';

interface WinBtnProps {
  kind: 'min' | 'max' | 'close';
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

const ICONS = {
  min:   <line x1="2" y1="6" x2="10" y2="6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />,
  max:   <rect x="2" y="2" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="1.3" />,
  close: (
    <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <line x1="2" y1="2" x2="10" y2="10" />
      <line x1="10" y1="2" x2="2" y2="10" />
    </g>
  ),
};

export function WinBtn({ kind, onClick }: WinBtnProps) {
  const [hover, setHover] = useState(false);
  const bg = hover ? (kind === 'close' ? 'var(--peach)' : 'var(--paper-deep)') : 'transparent';
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: 46, height: 36, border: 'none', background: bg,
        borderLeft: '1.5px solid var(--line)', color: 'var(--ink)', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <svg width="12" height="12" viewBox="0 0 12 12">{ICONS[kind]}</svg>
    </button>
  );
}
```

- [ ] **Step 2: Expose main-process window controls via IPC**

Edit `src/main/index.ts` — add IPC handlers after `createMainWindow`:

```ts
import { ipcMain } from 'electron';
// …inside whenReady():
ipcMain.handle('win:minimize', (e) => BrowserWindow.fromWebContents(e.sender)?.minimize());
ipcMain.handle('win:maximize', (e) => {
  const w = BrowserWindow.fromWebContents(e.sender);
  if (w?.isMaximized()) w.unmaximize(); else w?.maximize();
});
ipcMain.handle('win:close', (e) => BrowserWindow.fromWebContents(e.sender)?.close());
```

- [ ] **Step 3: Expose them via preload**

Edit `src/preload/index.ts` and `src/shared/types.ts`:

```ts
// shared/types.ts
export interface Api {
  getWindowKind: () => WindowKind;
  win: {
    minimize: () => void;
    maximize: () => void;
    close: () => void;
  };
}

// preload/index.ts — inside the api object:
import { ipcRenderer } from 'electron';
// …
win: {
  minimize: () => { void ipcRenderer.invoke('win:minimize'); },
  maximize: () => { void ipcRenderer.invoke('win:maximize'); },
  close:    () => { void ipcRenderer.invoke('win:close'); },
},
```

- [ ] **Step 4: Write `WinChrome.tsx`**

Port `main-window.jsx` lines 3–38 to TSX with draggable titlebar region:

```tsx
import type { ReactNode } from 'react';
import { CloudMascot } from '../mascots/CloudMascot';
import { WinBtn } from './WinBtn';

interface WinChromeProps {
  title?: string;
  children: ReactNode;
  dark?: boolean;
}

export function WinChrome({ title = '屏幕使用时间 · 云云', children, dark }: WinChromeProps) {
  return (
    <div className={dark ? 'theme-dark' : ''} style={{
      width: '100%', height: '100vh',
      display: 'flex', flexDirection: 'column',
      background: 'var(--paper)',
      border: '2px solid var(--line)',
      borderRadius: '14px 16px 14px 16px',
      boxShadow: '6px 6px 0 var(--line), 0 20px 60px rgba(42,42,60,0.15)',
      overflow: 'hidden',
      fontFamily: 'var(--font-sans)',
      color: 'var(--ink)',
    }}>
      <div
        style={{
          height: 36, flexShrink: 0,
          display: 'flex', alignItems: 'center',
          borderBottom: '2px solid var(--line)',
          background: 'var(--cloud-white)',
          paddingLeft: 12,
          // @ts-expect-error non-standard CSS property handled by Electron
          WebkitAppRegion: 'drag',
        }}
      >
        <CloudMascot size={26} mood="happy" wobble={false} />
        <div style={{ marginLeft: 10, fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{title}</div>
        <div style={{ marginLeft: 10, fontSize: 11, color: 'var(--ink-mute)', fontFamily: 'var(--font-hand)' }}>
          — 陪你看时间慢慢走
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', /* @ts-expect-error */ WebkitAppRegion: 'no-drag' }}>
          <WinBtn kind="min"   onClick={() => window.api.win.minimize()} />
          <WinBtn kind="max"   onClick={() => window.api.win.maximize()} />
          <WinBtn kind="close" onClick={() => window.api.win.close()} />
        </div>
      </div>
      {children}
    </div>
  );
}
```

- [ ] **Step 5: Run dev and verify**

Run: `pnpm dev`
Expected: frameless window with custom titlebar renders; dragging from titlebar moves the window; clicking min/max/close works; close button turns peach on hover.

- [ ] **Step 6: Commit**

```bash
git add src/renderer/components/window src/main/index.ts src/preload/index.ts src/shared/types.ts
git commit -m "feat(chrome): custom Windows-style titlebar with drag + min/max/close IPC"
```

---

### Task 10: Sidebar navigation + MainWindow shell

**Files:**
- Create: `src/renderer/main-window/Sidebar.tsx`
- Create: `src/renderer/main-window/MainWindow.tsx`

- [ ] **Step 1: Write `Sidebar.tsx`**

Port `main-window.jsx` lines 61–110 navigation. Types:

```tsx
import { CloudMascot } from '../components/mascots/CloudMascot';
import { JellyMascot } from '../components/mascots/JellyMascot';
import type { MascotKind } from '@shared/tokens';

export type TabKey = 'today' | 'apps' | 'timeline' | 'stats' | 'focus' | 'settings';

const NAV_ITEMS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'today',    label: '今日',   icon: '☁' },
  { key: 'apps',     label: '排行榜', icon: '★' },
  { key: 'timeline', label: '时间线', icon: '∿' },
  { key: 'stats',    label: '周月',   icon: '▦' },
  { key: 'focus',    label: '专注',   icon: '🍅' },
  { key: 'settings', label: '设置',   icon: '⚙' },
];

interface SidebarProps {
  active: TabKey;
  onChange: (k: TabKey) => void;
  mascotKind?: MascotKind;
}

export function Sidebar({ active, onChange, mascotKind = 'cloud' }: SidebarProps) {
  const Mascot = mascotKind === 'jelly' ? JellyMascot : CloudMascot;
  return (
    <div style={{
      width: 88, flexShrink: 0, background: 'var(--paper-deep)',
      borderRight: '2px solid var(--line)', padding: '14px 8px',
      display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      {NAV_ITEMS.map((n) => {
        const isActive = active === n.key;
        return (
          <button
            key={n.key}
            onClick={() => onChange(n.key)}
            style={{
              border: isActive ? '2px solid var(--line)' : '2px solid transparent',
              background: isActive ? 'var(--cloud-white)' : 'transparent',
              borderRadius: '12px 14px 12px 14px',
              padding: '10px 0', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              boxShadow: isActive ? '2px 2px 0 var(--line)' : 'none',
              color: 'var(--ink)',
            }}
          >
            <span style={{ fontSize: 20, lineHeight: 1 }}>{n.icon}</span>
            <span style={{ fontSize: 11, fontWeight: 700 }}>{n.label}</span>
          </button>
        );
      })}
      <div style={{ flex: 1 }} />
      <div style={{ textAlign: 'center', paddingTop: 10, borderTop: '1.5px dashed var(--ink-mute)' }}>
        <Mascot size={42} mood="calm" />
        <div style={{ fontFamily: 'var(--font-hand)', fontSize: 14, color: 'var(--ink-soft)', marginTop: 2 }}>v1.0</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write `MainWindow.tsx` (placeholder content for now)**

```tsx
import { useState } from 'react';
import { WinChrome } from '../components/window/WinChrome';
import { Sidebar, type TabKey } from './Sidebar';

export function MainWindow() {
  const [tab, setTab] = useState<TabKey>('today');
  return (
    <WinChrome>
      <div style={{ flex: 1, display: 'flex', minHeight: 0, background: 'var(--paper)' }}>
        <Sidebar active={tab} onChange={setTab} />
        <div className="scroll-hide" style={{ flex: 1, overflow: 'auto', minWidth: 0 }}>
          <div style={{ padding: 40, fontFamily: 'var(--font-hand)', fontSize: 28 }}>
            Tab: {tab}
          </div>
        </div>
      </div>
    </WinChrome>
  );
}
```

- [ ] **Step 3: Wire into App.tsx**

```tsx
import { MainWindow } from './main-window/MainWindow';
export default function App() { return <MainWindow />; }
```

- [ ] **Step 4: Run and verify**

Run: `pnpm dev`
Expected: titlebar + left sidebar with 6 buttons + right content area. Clicking each nav button changes the "Tab: xxx" label. Active button has doodle border + drop shadow.

- [ ] **Step 5: Commit**

```bash
git add src/renderer/main-window src/renderer/App.tsx
git commit -m "feat(main-window): sidebar nav + tab routing shell"
```

---

# Phase 4 — Main Window Tab Pages (with mock data)

### Task 11: Mock data module

**Files:**
- Create: `src/renderer/state/mockData.ts`

- [ ] **Step 1: Write the mock data**

Port `data.jsx` lines 42–76 as a typed module:

```ts
import type { Category } from '@shared/tokens';
import type { AppIconKind } from '../components/primitives/AppIcon';

export interface AppUsage {
  name: string;
  kind: AppIconKind;
  mins: number;
  cat: Category;
  color: string;
}

export const TODAY_APPS: AppUsage[] = [
  { name: 'VS Code', kind: 'code',   mins: 183, cat: '工作', color: 'var(--mint)' },
  { name: '飞书',    kind: 'chat',   mins: 96,  cat: '沟通', color: 'var(--blue)' },
  { name: 'Figma',   kind: 'design', mins: 74,  cat: '工作', color: 'var(--lilac)' },
  { name: 'Chrome',  kind: 'browse', mins: 58,  cat: '浏览', color: 'var(--blue)' },
  { name: 'Notion',  kind: 'doc',    mins: 41,  cat: '工作', color: 'var(--lemon)' },
  { name: 'Spotify', kind: 'music',  mins: 32,  cat: '娱乐', color: 'var(--mint)' },
  { name: 'YouTube', kind: 'video',  mins: 24,  cat: '娱乐', color: 'var(--peach)' },
  { name: '微信',    kind: 'mail',   mins: 18,  cat: '沟通', color: 'var(--lilac)' },
];

export interface CategorySlice { name: Category; mins: number; color: string; }

export const CATEGORIES: CategorySlice[] = [
  { name: '工作', mins: 298, color: 'var(--mint)' },
  { name: '沟通', mins: 114, color: 'var(--blue)' },
  { name: '浏览', mins: 58,  color: 'var(--lilac)' },
  { name: '娱乐', mins: 56,  color: 'var(--peach)' },
];

export const HOURLY: number[] = [
  0, 0, 0, 0, 0, 0, 0, 5,
  42, 55, 58, 48, 25, 50, 58, 56,
  55, 52, 30, 15, 20, 30, 10, 2,
];

export interface DayUsage { d: string; mins: number; }
export const WEEKLY: DayUsage[] = [
  { d: '一', mins: 380 },
  { d: '二', mins: 456 },
  { d: '三', mins: 412 },
  { d: '四', mins: 528 },
  { d: '五', mins: 495 },
  { d: '六', mins: 180 },
  { d: '日', mins: 245 },
];
```

- [ ] **Step 2: Commit**

```bash
git add src/renderer/state/mockData.ts
git commit -m "feat(mock): typed mock usage data for UI development"
```

---

### Task 12: TabToday page

**Files:**
- Create: `src/renderer/main-window/widgets/PieDoodle.tsx`
- Create: `src/renderer/main-window/widgets/TimelineMini.tsx`
- Create: `src/renderer/main-window/tabs/TabToday.tsx`

- [ ] **Step 1: `PieDoodle.tsx`**

Port `tab-today.jsx` lines 108–140:

```tsx
import { CATEGORIES } from '../../state/mockData';

interface PieDoodleProps { size?: number; }

export function PieDoodle({ size = 160 }: PieDoodleProps) {
  const total = CATEGORIES.reduce((s, c) => s + c.mins, 0);
  let acc = 0;
  const r = size / 2 - 14;
  const cx = size / 2, cy = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {CATEGORIES.map((c) => {
        const start = (acc / total) * Math.PI * 2 - Math.PI / 2;
        acc += c.mins;
        const end = (acc / total) * Math.PI * 2 - Math.PI / 2;
        const x1 = cx + Math.cos(start) * r, y1 = cy + Math.sin(start) * r;
        const x2 = cx + Math.cos(end) * r,   y2 = cy + Math.sin(end) * r;
        const large = end - start > Math.PI ? 1 : 0;
        return (
          <path
            key={c.name}
            d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`}
            fill={c.color} stroke="var(--line)" strokeWidth="2" strokeLinejoin="round"
          />
        );
      })}
      <circle cx={cx} cy={cy} r={18} fill="var(--cloud-white)" stroke="var(--line)" strokeWidth="2" />
      <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle"
        fontFamily="Caveat" fontSize="16" fill="var(--ink)">
        {Math.round(total / 60)}h
      </text>
    </svg>
  );
}
```

- [ ] **Step 2: `TimelineMini.tsx`**

Port `tab-today.jsx` lines 143–165 with `HOURLY` and a typed `nowHourIndex` prop (default 15 matching mock):

```tsx
import { HOURLY } from '../../state/mockData';

export function TimelineMini({ nowHour = 15 }: { nowHour?: number }) {
  const max = Math.max(...HOURLY);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 52 }}>
      {HOURLY.map((v, i) => {
        const hPx = max === 0 ? 0 : (v / max) * 48 + (v > 0 ? 4 : 0);
        const isNow = i === nowHour;
        return (
          <div key={i} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            height: '100%', justifyContent: 'flex-end', position: 'relative',
          }}>
            <div style={{
              width: '100%', height: hPx,
              background: isNow ? 'var(--lilac)' : v > 30 ? 'var(--mint)' : 'var(--blue)',
              border: v > 0 ? '1.5px solid var(--line)' : 'none',
              borderRadius: '4px 5px 1px 1px',
            }} />
            {isNow && (
              <div style={{ position: 'absolute', top: -14, fontSize: 10,
                color: 'var(--lilac-deep)', fontWeight: 700 }}>
                现在
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 3: `TabToday.tsx`**

Port `tab-today.jsx` lines 4–105 to TSX. Keep the two-column grid, big Caveat number for hours/mins, category strip, pie card with "✦ 专注日" rotated sticker, timeline mini, and Top-3 cards. Use `CloudMascot`, `AppIcon`, `Star`, `fmtMins`, `TODAY_APPS`, `CATEGORIES`, `PieDoodle`, `TimelineMini` imports.

Full component skeleton (fill interior from `tab-today.jsx` lines 9–104):

```tsx
import { CloudMascot } from '../../components/mascots/CloudMascot';
import { AppIcon } from '../../components/primitives/AppIcon';
import { Star } from '../../components/primitives/Star';
import { fmtMins } from '../../utils/fmt';
import { TODAY_APPS, CATEGORIES } from '../../state/mockData';
import { PieDoodle } from '../widgets/PieDoodle';
import { TimelineMini } from '../widgets/TimelineMini';

export function TabToday() {
  const totalMins = TODAY_APPS.reduce((s, a) => s + a.mins, 0);
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;

  return (
    <div style={{ padding: '28px 36px' }}>
      {/* greeting + mascot + date — verbatim port of lines 12–26 */}
      {/* big number + pie grid — lines 29–72 */}
      {/* mini timeline card — lines 75–84 */}
      {/* top-3 apps grid — lines 87–102 */}
    </div>
  );
}
```

Port every JSX node, preserving inline style objects and class names exactly. Watch for: `TOP {i+1}` badge, rotated `Star` on rank 1 (absolute positioned top:-8 right:-6 transform rotate(15deg)), chip `↓ 比昨天少 23 分`, rotated "✦ 专注日" sticker.

- [ ] **Step 4: Wire into MainWindow**

Edit `MainWindow.tsx` — replace the placeholder with a tab switch:

```tsx
import { TabToday } from './tabs/TabToday';
// …inside the right content area:
{tab === 'today'    && <TabToday />}
{tab !== 'today'    && <div style={{ padding: 40 }}>{tab} coming soon</div>}
```

- [ ] **Step 5: Run and pixel-check**

Run: `pnpm dev`
Expected: Today tab matches the design mockup — greeting row, 1.3fr/1fr grid, pie on right with "✦ 专注日" rotated 6°, mini timeline with "现在" label on hour 15, three Top app cards with rank-1 star.

- [ ] **Step 6: Commit**

```bash
git add src/renderer/main-window
git commit -m "feat(tab-today): today overview with pie + timeline mini + top apps"
```

---

### Task 13: TabApps — App leaderboard

**Files:**
- Create: `src/renderer/main-window/tabs/TabApps.tsx`

- [ ] **Step 1: Port from `tabs-more.jsx` lines 3–49**

Component uses `useState<string>` for filter, filters `TODAY_APPS` by `cat`, shows ranked list with 28px Caveat rank number (first 3 in lilac-deep), 44px `AppIcon`, name + category chip, progress bar normalized to max, `fmtMins` display, and "⏱ 限额" `DoodleButton`.

Key structural code:

```tsx
import { useState, useMemo } from 'react';
import { AppIcon } from '../../components/primitives/AppIcon';
import { Chip } from '../../components/primitives/Chip';
import { DoodleButton } from '../../components/primitives/DoodleButton';
import { fmtMins } from '../../utils/fmt';
import { TODAY_APPS } from '../../state/mockData';

export function TabApps() {
  const [filter, setFilter] = useState<string>('全部');
  const cats = useMemo(() => ['全部', ...Array.from(new Set(TODAY_APPS.map((a) => a.cat)))], []);
  const list = filter === '全部' ? TODAY_APPS : TODAY_APPS.filter((a) => a.cat === filter);
  const max = Math.max(...list.map((a) => a.mins));

  return (
    <div style={{ padding: '24px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-hand)', fontSize: 36, lineHeight: 1, color: 'var(--ink)' }}>
            应用排行榜
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 4 }}>
            看看谁在偷偷抢占你的今天～
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {cats.map((c) => (
            <button key={c} className={`tab-doodle ${filter === c ? 'active' : ''}`} onClick={() => setFilter(c)}>
              {c}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {list.map((app, i) => (
          <div key={app.name} className="doodle-border b-tight"
            style={{ padding: '14px 18px', background: 'var(--cloud-white)',
              display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ fontFamily: 'var(--font-hand)', fontSize: 28, width: 36,
              color: i < 3 ? 'var(--lilac-deep)' : 'var(--ink-mute)', textAlign: 'center' }}>
              {i + 1}
            </div>
            <AppIcon kind={app.kind} size={44} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>{app.name}</div>
                <Chip bg={app.color}>{app.cat}</Chip>
              </div>
              <div style={{ height: 10, background: 'var(--paper-deep)', borderRadius: 5,
                overflow: 'hidden', border: '1.5px solid var(--line)' }}>
                <div style={{ height: '100%', width: `${(app.mins / max) * 100}%`,
                  background: app.color, borderRight: '1.5px solid var(--line)' }} />
              </div>
            </div>
            <div style={{ textAlign: 'right', minWidth: 70 }}>
              <div style={{ fontFamily: 'var(--font-hand)', fontSize: 24, lineHeight: 1, color: 'var(--ink)' }}>
                {fmtMins(app.mins)}
              </div>
              <div style={{ fontSize: 10, color: 'var(--ink-mute)', marginTop: 2 }}>
                {Math.round((app.mins / 60) * 10) / 10}h
              </div>
            </div>
            <DoodleButton style={{ padding: '4px 10px', fontSize: 11, boxShadow: '2px 2px 0 var(--line)' }}>
              ⏱ 限额
            </DoodleButton>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Wire into MainWindow tab router + verify**

Add `{tab === 'apps' && <TabApps />}`. Run `pnpm dev`, click "排行榜" in sidebar, verify: filter tabs toggle, rank numbers 1-3 are lilac, progress bars match max.

- [ ] **Step 3: Commit**

```bash
git add src/renderer/main-window
git commit -m "feat(tab-apps): leaderboard with category filter"
```

---

### Task 14: TabTimeline + HighlightCard

**Files:**
- Create: `src/renderer/main-window/widgets/HighlightCard.tsx`
- Create: `src/renderer/main-window/tabs/TabTimeline.tsx`

- [ ] **Step 1: `HighlightCard.tsx`**

Port `tabs-more.jsx` lines 103–112:

```tsx
interface HighlightCardProps { icon: string; title: string; value: string; note: string; }
export function HighlightCard({ icon, title, value, note }: HighlightCardProps) {
  return (
    <div className="doodle-border b-tight" style={{ padding: '14px 16px', background: 'var(--cloud-white)' }}>
      <div style={{ fontSize: 22 }}>{icon}</div>
      <div style={{ fontSize: 11, color: 'var(--ink-soft)', fontWeight: 700, marginTop: 4 }}>{title}</div>
      <div style={{ fontFamily: 'var(--font-hand)', fontSize: 22, color: 'var(--ink)', marginTop: 2 }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--ink-mute)', marginTop: 2 }}>{note}</div>
    </div>
  );
}
```

- [ ] **Step 2: `TabTimeline.tsx`**

Port `tabs-more.jsx` lines 51–101. Big 200px bar chart with 25/50/75 dashed reference lines, hour-15 lilac "now" bar with floating `⬇ 现在 · Figma` lemon-chip label, axis labels at 0/3/6/9/12/15/18/21/24, and three `HighlightCard`s at the bottom.

- [ ] **Step 3: Wire + verify**

Run `pnpm dev`, click "时间线", confirm the 24-bar chart renders and the "⬇ 现在" label floats above hour-15 column.

- [ ] **Step 4: Commit**

```bash
git add src/renderer/main-window
git commit -m "feat(tab-timeline): hourly bar chart + highlight cards"
```

---

### Task 15: TabStats + StatCard

**Files:**
- Create: `src/renderer/main-window/widgets/StatCard.tsx`
- Create: `src/renderer/main-window/tabs/TabStats.tsx`

- [ ] **Step 1: `StatCard.tsx`**

Port `tabs-more.jsx` lines 177–185:

```tsx
interface StatCardProps { label: string; big: string; note: string; bg: string; }
export function StatCard({ label, big, note, bg }: StatCardProps) {
  return (
    <div className="doodle-border b-tight" style={{
      padding: '14px 18px', background: bg, flex: 1,
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
    }}>
      <div style={{ fontSize: 11, color: 'var(--ink-soft)', fontWeight: 700, letterSpacing: 1 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-hand)', fontSize: 30, color: 'var(--ink)', lineHeight: 1, marginTop: 2 }}>{big}</div>
      <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 2 }}>{note}</div>
    </div>
  );
}
```

- [ ] **Step 2: `TabStats.tsx`**

Port `tabs-more.jsx` lines 114–175. Key behaviors:
- Week/Month/Year tab buttons (month + year are no-ops for now — just visual `.tab-doodle`)
- 7 day bars with today (index 3) in lilac, rest mint
- `bar-doodle` class (has the hand-drawn `border-radius: 6px 8px 2px 2px / 8px 6px 2px 2px`)
- Avg chip in lemon
- Right column: 3 `StatCard`s (blue / lilac / peach)
- Bottom encouragement card: mint bg, `CloudMascot` size 60, Caveat text

Use `WEEKLY` from mock data.

- [ ] **Step 3: Wire + verify**

Run `pnpm dev`, click "周月", verify bars render, today bar is lilac, encouragement card has cloud mascot + Caveat text.

- [ ] **Step 4: Commit**

```bash
git add src/renderer/main-window
git commit -m "feat(tab-stats): weekly bar chart + stat cards + encouragement"
```

---

### Task 16: TabFocus — Pomodoro timer UI

**Files:**
- Create: `src/renderer/main-window/tabs/TabFocus.tsx`

- [ ] **Step 1: Port `tabs-more.jsx` lines 187–264**

State: `running: boolean`, `secs: number` (start at `25 * 60`). `useEffect` starts `setInterval` that decrements `secs` each second when running. Compute `pct = 1 - secs / (25 * 60)` for the dasharray ring (circumference ~628 for r=100). Display `mm:ss` in `Nunito 800 54px` inside the SVG.

Right column: 3 doodle cards — "今天的番茄 5/8" with 8 small tomato SVGs (first 5 opacity 1, rest 0.35), task input with dashed underline, yellow-bg "专注期间" with 3 checkboxes.

Typed state:

```tsx
import { useEffect, useState } from 'react';
import { DoodleButton } from '../../components/primitives/DoodleButton';

export function TabFocus() {
  const [running, setRunning] = useState(false);
  const [secs, setSecs] = useState(25 * 60);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [running]);

  const mm = String(Math.floor(secs / 60)).padStart(2, '0');
  const ss = String(secs % 60).padStart(2, '0');
  const pct = 1 - secs / (25 * 60);

  // …render (port lines 200–263 verbatim to JSX)…
}
```

- [ ] **Step 2: Wire + verify**

Run `pnpm dev`, click "专注". Verify: tomato SVG renders, `25:00` centered, clicking "▶ 开始专注" starts countdown, arc fills clockwise, clicking "↺ 重置" restores 25:00.

- [ ] **Step 3: Commit**

```bash
git add src/renderer/main-window
git commit -m "feat(tab-focus): pomodoro timer with progress ring"
```

---

### Task 17: TabSettings + SettingCard

**Files:**
- Create: `src/renderer/main-window/widgets/SettingCard.tsx`
- Create: `src/renderer/main-window/tabs/TabSettings.tsx`

- [ ] **Step 1: `SettingCard.tsx`**

Port `tabs-more.jsx` lines 293–314. Controlled variant (pass `value` + `onChange` instead of internal `useState` — we'll wire to prefs later).

```tsx
interface SettingCardProps {
  title: string;
  desc: string;
  value: boolean;
  onChange: (v: boolean) => void;
}

export function SettingCard({ title, desc, value, onChange }: SettingCardProps) {
  return (
    <div className="doodle-border b-tight" style={{
      padding: '14px 18px', background: 'var(--cloud-white)',
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 2 }}>{desc}</div>
      </div>
      <button
        onClick={() => onChange(!value)}
        style={{
          width: 44, height: 24, border: '2px solid var(--line)', borderRadius: 14,
          background: value ? 'var(--mint)' : 'var(--paper-deep)', padding: 0,
          cursor: 'pointer', position: 'relative', flexShrink: 0,
        }}
      >
        <div style={{
          width: 16, height: 16, borderRadius: '50%', background: 'var(--cloud-white)',
          border: '1.5px solid var(--line)', position: 'absolute', top: 2,
          left: value ? 22 : 2, transition: 'left .15s',
        }} />
      </button>
    </div>
  );
}
```

- [ ] **Step 2: `TabSettings.tsx`**

Port `tabs-more.jsx` lines 266–291. Use local `useState` for each toggle for now (real prefs wiring in Phase 10). Six cards in 2-column grid: 开机自启动 / 悬浮窗 / 空闲检测 / 隐私空白 / 久坐提醒 / 每日小结. Bottom privacy card with `CloudMascot mood="calm"` + `导出` + `清空` buttons.

- [ ] **Step 3: Verify + commit**

Run `pnpm dev`, check all six toggle animations (handle slides `left: 22 → 2`). Privacy card shows at bottom.

```bash
git add src/renderer/main-window
git commit -m "feat(tab-settings): preferences cards with toggle switches"
```

---

**Phase 4 checkpoint:** Main window is complete with all 6 tabs showing mock data. Run `pnpm typecheck && pnpm test && pnpm dev` and visually walk through all tabs. Suggested pause point for review.

---

# Phase 5 — Floating Widget Window

### Task 18: Second BrowserWindow for floating widget

**Files:**
- Create: `src/main/windows/floatingWindow.ts`
- Modify: `src/main/index.ts`

- [ ] **Step 1: Write `src/main/windows/floatingWindow.ts`**

```ts
import { BrowserWindow, screen, app } from 'electron';
import path from 'node:path';

const isDev = !app.isPackaged;

export function createFloatingWindow(): BrowserWindow {
  const { workArea } = screen.getPrimaryDisplay();

  const win = new BrowserWindow({
    width: 280,
    height: 320,
    x: workArea.x + workArea.width - 320,
    y: workArea.y + workArea.height - 360,
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
```

- [ ] **Step 2: Create floating window in main on ready**

Edit `src/main/index.ts` — store references and spawn both windows:

```ts
import { createFloatingWindow } from './windows/floatingWindow';

let mainWin: BrowserWindow | null = null;
let floatWin: BrowserWindow | null = null;

app.whenReady().then(() => {
  mainWin = createMainWindow();
  floatWin = createFloatingWindow();
  // …
});
```

- [ ] **Step 3: Ensure `floating.html` loads the renderer correctly**

Check `electron.vite.config.ts` already has floating as an input (it does — from Task 2 Step 3). Verify `src/renderer/main.tsx` correctly detects `?window=floating` via `window.api.getWindowKind()` — this calls preload, which reads `window.location.search`. The floating window URL includes `?window=floating`, so this should resolve to `'floating'`.

- [ ] **Step 4: Run and verify**

Run: `pnpm dev`
Expected: two windows open — the main window AND a small transparent window at bottom-right showing "Floating ☁" on a cream background. The floating window stays on top of other apps.

- [ ] **Step 5: Commit**

```bash
git add src/main
git commit -m "feat(main): spawn frameless always-on-top floating window"
```

---

### Task 19: ExpandedCard, HoverTooltip, ContextMenu popovers

**Files:**
- Create: `src/renderer/floating/popovers/ExpandedCard.tsx`
- Create: `src/renderer/floating/popovers/HoverTooltip.tsx`
- Create: `src/renderer/floating/popovers/ContextMenu.tsx`

- [ ] **Step 1: `ExpandedCard.tsx`**

Port `floating-widget.jsx` lines 73–141. Props interface:

```tsx
import { CloudMascot } from '../../components/mascots/CloudMascot';
import { AppIcon } from '../../components/primitives/AppIcon';
import { Chip } from '../../components/primitives/Chip';
import { DoodleButton } from '../../components/primitives/DoodleButton';
import { fmtMins } from '../../utils/fmt';
import type { Mood } from '@shared/tokens';
import { CATEGORIES } from '../../state/mockData';
import type { AppIconKind } from '../../components/primitives/AppIcon';

export interface CurrentApp { name: string; kind: AppIconKind; mins: number; }

interface ExpandedCardProps {
  curApp: CurrentApp;
  todayMins: number;
  mood: Mood;
  onClose: () => void;
}

export function ExpandedCard({ curApp, todayMins, mood, onClose }: ExpandedCardProps) {
  // …port lines 74–140 JSX verbatim…
}
```

Port every node: down-pointing triangle tail, close × in top-right, "正在使用" label, current app row (AppIcon + name + "已打开 Xm" + CloudMascot), `.hr-wavy`, today total (Caveat 32 big + 26 mid), chip "↓ 比昨天少", category strip with 4 segments, 3-button row (🍅专注 / ⤢打开 / ⏸), lemon tip "💧 记得歇歇眼睛哦".

- [ ] **Step 2: `HoverTooltip.tsx`**

Port `floating-widget.jsx` lines 143–167. Dark (`--ink`) background, 200px wide, shows app icon + name, 本次/今日 split row, Caveat mint "双击打开主窗口" hint.

```tsx
import { AppIcon } from '../../components/primitives/AppIcon';
import { fmtMins } from '../../utils/fmt';
import type { CurrentApp } from './ExpandedCard';

interface HoverTooltipProps { curApp: CurrentApp; todayMins: number; }
export function HoverTooltip({ curApp, todayMins }: HoverTooltipProps) {
  // …verbatim port of lines 144–167…
}
```

- [ ] **Step 3: `ContextMenu.tsx`**

Port `floating-widget.jsx` lines 169–213. Typed menu items:

```tsx
interface MenuItem { icon: string; label: string; shortcut?: string; warn?: boolean; onClick?: () => void; }
type MenuEntry = MenuItem | null; // null = divider

interface ContextMenuProps { onClose: () => void; onAction?: (label: string) => void; }

export function ContextMenu({ onClose, onAction }: ContextMenuProps) {
  const items: MenuEntry[] = [
    { icon: '⏸', label: '暂停记录', shortcut: 'Ctrl+P' },
    { icon: '🍅', label: '开始专注', shortcut: 'Ctrl+F' },
    { icon: '⤢', label: '打开主窗口', shortcut: 'Dbl-click' },
    null,
    { icon: '📌', label: '吸附到边缘' },
    { icon: '👁', label: '仅图标模式' },
    null,
    { icon: '⚙', label: '设置' },
    { icon: '✕', label: '退出', warn: true },
  ];
  // …render (port lines 181–212, wiring `onClick` of each item to call `onAction?.(it.label)` then `onClose()`)…
}
```

- [ ] **Step 4: Commit**

```bash
git add src/renderer/floating/popovers
git commit -m "feat(floating): popovers — expanded card, tooltip, context menu"
```

---

### Task 20: Floating widget variants A/B/C

**Files:**
- Create: `src/renderer/floating/variants/PillAvatar.tsx`
- Create: `src/renderer/floating/variants/PillBar.tsx`
- Create: `src/renderer/floating/variants/StandingMascot.tsx`
- Create: `src/renderer/floating/FloatingWidget.tsx`

- [ ] **Step 1: Shared widget state type**

```tsx
// at top of FloatingWidget.tsx
export type WidgetState = 'pill' | 'card' | 'tooltip' | 'menu';
```

- [ ] **Step 2: `PillAvatar.tsx` (Variant A)**

Port `floating-widget.jsx` lines 20–70. Props: `{ state, setState, curApp, todayMins, mood }`. Render 72×72 circle with 2.5px border + `3px 4px 0 var(--line)` drop shadow, `CloudMascot` 56px inside, lilac badge bottom-right showing `XhYm`, peach drag-dot top-left only when `state === 'pill'`. Render `<ExpandedCard>` / `<HoverTooltip>` / `<ContextMenu>` conditionally.

- [ ] **Step 3: `PillBar.tsx` (Variant B)**

Port `floating-widget.jsx` lines 216–249.

- [ ] **Step 4: `StandingMascot.tsx` (Variant C)**

Port `floating-widget.jsx` lines 252–281. Uses `JellyMascot`.

- [ ] **Step 5: `FloatingWidget.tsx` dispatcher**

```tsx
import { useState, useEffect } from 'react';
import { PillAvatar } from './variants/PillAvatar';
import { PillBar } from './variants/PillBar';
import { StandingMascot } from './variants/StandingMascot';
import type { FloatingVariant, Mood } from '@shared/tokens';
import type { CurrentApp } from './popovers/ExpandedCard';

export type WidgetState = 'pill' | 'card' | 'tooltip' | 'menu';

interface FloatingWidgetProps {
  variant?: FloatingVariant;
  state?: WidgetState;
  mood?: Mood;
  curApp: CurrentApp;
  todayMins: number;
  onStateChange?: (s: WidgetState) => void;
}

export function FloatingWidget({
  variant = 'A',
  state: forcedState,
  mood = 'happy',
  curApp,
  todayMins,
  onStateChange,
}: FloatingWidgetProps) {
  const [state, setState] = useState<WidgetState>(forcedState ?? 'pill');
  useEffect(() => { if (forcedState) setState(forcedState); }, [forcedState]);
  const set = (s: WidgetState) => { setState(s); onStateChange?.(s); };

  const common = { state, set, curApp, todayMins, mood };
  if (variant === 'B') return <PillBar {...common} />;
  if (variant === 'C') return <StandingMascot {...common} />;
  return <PillAvatar {...common} />;
}
```

- [ ] **Step 6: Commit**

```bash
git add src/renderer/floating
git commit -m "feat(floating): A/B/C widget variants with state machine"
```

---

### Task 21: `FloatingApp.tsx` — hook up widget + hover/right-click

**Files:**
- Modify: `src/renderer/FloatingApp.tsx`

- [ ] **Step 1: Write `FloatingApp.tsx`**

```tsx
import { useState, useEffect } from 'react';
import { FloatingWidget, type WidgetState } from './floating/FloatingWidget';

export default function FloatingApp() {
  const [state, setState] = useState<WidgetState>('pill');

  useEffect(() => {
    let hoverTimer: ReturnType<typeof setTimeout> | null = null;
    const onMouseEnter = () => {
      hoverTimer = setTimeout(() => setState((s) => (s === 'pill' ? 'tooltip' : s)), 500);
    };
    const onMouseLeave = () => {
      if (hoverTimer) clearTimeout(hoverTimer);
      setState((s) => (s === 'tooltip' ? 'pill' : s));
    };
    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      setState('menu');
    };
    document.addEventListener('mouseenter', onMouseEnter);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('contextmenu', onContextMenu);
    return () => {
      document.removeEventListener('mouseenter', onMouseEnter);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('contextmenu', onContextMenu);
      if (hoverTimer) clearTimeout(hoverTimer);
    };
  }, []);

  return (
    <div style={{
      width: '100vw', height: '100vh',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end',
      padding: 16, background: 'transparent',
    }}>
      <FloatingWidget
        variant="A"
        state={state}
        onStateChange={setState}
        mood="happy"
        curApp={{ name: 'Figma', kind: 'design', mins: 74 }}
        todayMins={524}
      />
    </div>
  );
}
```

- [ ] **Step 2: Inject styles into floating window**

Edit `src/renderer/main.tsx` — ensure styles import happens regardless of window kind (it already does at top-level, confirm no gating).

- [ ] **Step 3: Run and verify**

Run: `pnpm dev`
Expected:
- Two windows open.
- Floating window at bottom-right shows the cloud pill.
- Single-click toggles card state; card pops UPWARD (bottom:calc(100% + 12px)).
- Hover 500ms → dark tooltip appears above.
- Right-click → 8-item context menu appears above.
- Click anywhere else → card/tooltip/menu closes, pill returns.

- [ ] **Step 4: Commit**

```bash
git add src/renderer/FloatingApp.tsx
git commit -m "feat(floating): hover + right-click behaviors on FloatingApp"
```

---

### Task 22: Drag floating window + edge snap

**Files:**
- Modify: `src/main/windows/floatingWindow.ts`
- Modify: `src/main/index.ts`
- Modify: `src/preload/index.ts`
- Modify: `src/shared/types.ts`
- Modify: `src/renderer/floating/variants/PillAvatar.tsx` (and B/C similarly)

- [ ] **Step 1: Add IPC for floating-window drag + snap**

Edit `src/shared/types.ts` — extend `Api`:

```ts
export interface Api {
  getWindowKind: () => WindowKind;
  win: { minimize: () => void; maximize: () => void; close: () => void; };
  floating: {
    startDrag: (offsetX: number, offsetY: number) => void;
    openMain: () => void;
  };
}
```

- [ ] **Step 2: Handle drag in main process**

Add to `src/main/index.ts`:

```ts
import { screen } from 'electron';

let dragMoveTimer: NodeJS.Timeout | null = null;
let dragOffset = { x: 0, y: 0 };

function stopFloatingDrag() {
  if (dragMoveTimer) clearInterval(dragMoveTimer);
  dragMoveTimer = null;
  if (!floatWin) return;
  // snap to edge if within 20px
  const { x, y, width, height } = floatWin.getBounds();
  const { workArea } = screen.getPrimaryDisplay();
  let snappedX = x, snappedY = y;
  if (x < workArea.x + 20) snappedX = workArea.x;
  else if (x + width > workArea.x + workArea.width - 20) snappedX = workArea.x + workArea.width - width;
  if (y < workArea.y + 20) snappedY = workArea.y;
  else if (y + height > workArea.y + workArea.height - 20) snappedY = workArea.y + workArea.height - height;
  if (snappedX !== x || snappedY !== y) floatWin.setPosition(snappedX, snappedY);
}

ipcMain.on('floating:start-drag', (_e, offsetX: number, offsetY: number) => {
  if (!floatWin) return;
  dragOffset = { x: offsetX, y: offsetY };
  if (dragMoveTimer) clearInterval(dragMoveTimer);
  dragMoveTimer = setInterval(() => {
    if (!floatWin) return;
    const p = screen.getCursorScreenPoint();
    floatWin.setPosition(p.x - dragOffset.x, p.y - dragOffset.y);
  }, 16);
  // failsafe: release after 30s if the renderer never sends stop
  setTimeout(() => { if (dragMoveTimer) stopFloatingDrag(); }, 30_000);
});

ipcMain.on('floating:stop-drag', () => stopFloatingDrag());

ipcMain.on('floating:open-main', () => {
  if (!mainWin) mainWin = createMainWindow();
  if (mainWin.isMinimized()) mainWin.restore();
  mainWin.focus();
});
```

- [ ] **Step 3: Preload wiring**

```ts
// src/preload/index.ts additions:
floating: {
  startDrag: (offsetX: number, offsetY: number) =>
    ipcRenderer.send('floating:start-drag', offsetX, offsetY),
  openMain: () => ipcRenderer.send('floating:open-main'),
},
```

Handler for stop-drag is called from renderer on `mouseup`:

```ts
// already accessible via startDrag; add a stopDrag too:
floating: {
  startDrag: …,
  stopDrag: () => ipcRenderer.send('floating:stop-drag'),
  openMain: …,
},
```

Update types to include `stopDrag`.

- [ ] **Step 4: Wire drag in `PillAvatar.tsx`**

```tsx
const onMouseDown = (e: React.MouseEvent) => {
  // Only start drag on the pill body, not on close/buttons
  if (e.button !== 0) return;
  window.api.floating.startDrag(e.clientX, e.clientY);
  const stop = () => {
    window.api.floating.stopDrag();
    window.removeEventListener('mouseup', stop);
  };
  window.addEventListener('mouseup', stop);
};

// attach to the outer pill div:
<div onMouseDown={onMouseDown} …>
```

Also in `PillAvatar.tsx`, handle double-click → `window.api.floating.openMain()`:

```tsx
const onDoubleClick = () => window.api.floating.openMain();
// attach onDoubleClick to pill div
```

Apply the same `onMouseDown` + `onDoubleClick` to `PillBar.tsx` and `StandingMascot.tsx`.

- [ ] **Step 5: Verify manually**

Run `pnpm dev`. Drag the pill across the screen. Release within 20px of an edge — it should snap flush. Double-click → main window focuses/restores.

- [ ] **Step 6: Commit**

```bash
git add src/main src/preload src/shared src/renderer/floating
git commit -m "feat(floating): drag + edge snap + double-click-to-open-main"
```

---

### Task 23: Floating popover positioning + off-screen safety

**Files:**
- Modify: `src/renderer/floating/popovers/ExpandedCard.tsx`, `HoverTooltip.tsx`, `ContextMenu.tsx` (already position `bottom: 100%+12px`)
- Modify: `src/main/windows/floatingWindow.ts` (resize dynamically when `state` changes)

- [ ] **Step 1: Dynamic window resize for popover**

Floating window starts at 280×320 — big enough for the expanded card above a 72×72 pill. Verify by opening the card: if truncated, enlarge in `createFloatingWindow`:

If any truncation appears, bump dimensions in `createFloatingWindow`:
```ts
width: 300, height: 380,
```

Popovers already use `position: absolute; bottom: calc(100% + 12px)` which lifts them above the pill. Because the window is transparent with `hasShadow: false`, they render freely.

- [ ] **Step 2: Verify**

Run `pnpm dev`. Click the pill → card appears above without clipping. Right-click → menu appears above. Hover → tooltip appears above.

- [ ] **Step 3: Commit (if any changes)**

```bash
git add src/main
git commit -m "fix(floating): adequate window size for popovers"
```

---

**Phase 5 checkpoint:** Floating widget is fully interactive with drag, snap, all 4 states (pill/card/tooltip/menu), and wires to main window via double-click. Suggested pause for review.

---

# Phase 6 — Preferences Store

### Task 24: JSON preferences in `%APPDATA%/CloudCloud/`

**Files:**
- Create: `src/main/services/preferences.ts`
- Create: `src/main/services/preferences.test.ts` (main-process vitest)

- [ ] **Step 1: Define shared prefs type**

Edit `src/shared/types.ts`:

```ts
import type { Theme, MascotKind, FloatingVariant } from './tokens';

export interface Preferences {
  theme: Theme;
  mascotKind: MascotKind;
  floatingVariant: FloatingVariant;
  floatingPos: { x: number; y: number } | null;
  startOnBoot: boolean;
  idleDetection: boolean;
  sedentaryReminder: boolean;
  dailySummary: boolean;
  floatingEnabled: boolean;
  privacyBlank: boolean;
  appLimits: Record<string, number>;
}

export const DEFAULT_PREFS: Preferences = {
  theme: 'light',
  mascotKind: 'cloud',
  floatingVariant: 'A',
  floatingPos: null,
  startOnBoot: false,
  idleDetection: true,
  sedentaryReminder: true,
  dailySummary: false,
  floatingEnabled: true,
  privacyBlank: false,
  appLimits: {},
};
```

- [ ] **Step 2: Write failing test**

```ts
// @vitest-environment node
// src/main/services/preferences.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { PreferencesStore } from './preferences';
import { DEFAULT_PREFS } from '../../shared/types';

describe('PreferencesStore', () => {
  let tmpDir: string;
  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'cc-prefs-'));
  });
  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it('returns defaults when no file exists', async () => {
    const store = new PreferencesStore(tmpDir);
    const prefs = await store.load();
    expect(prefs).toEqual(DEFAULT_PREFS);
  });

  it('persists and loads set values', async () => {
    const store = new PreferencesStore(tmpDir);
    await store.load();
    await store.set('floatingVariant', 'B');
    const reloaded = await new PreferencesStore(tmpDir).load();
    expect(reloaded.floatingVariant).toBe('B');
  });

  it('merges new defaults into existing prefs file', async () => {
    await fs.writeFile(path.join(tmpDir, 'prefs.json'), JSON.stringify({ theme: 'dark' }));
    const prefs = await new PreferencesStore(tmpDir).load();
    expect(prefs.theme).toBe('dark');
    expect(prefs.mascotKind).toBe('cloud'); // default merged
  });
});
```

- [ ] **Step 3: Run test — expect FAIL**

Run: `pnpm test preferences`

- [ ] **Step 4: Implement `preferences.ts`**

```ts
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { DEFAULT_PREFS, type Preferences } from '../../shared/types';

export class PreferencesStore {
  private cache: Preferences | null = null;
  constructor(private readonly dir: string) {}

  private get file() {
    return path.join(this.dir, 'prefs.json');
  }

  async load(): Promise<Preferences> {
    try {
      await fs.mkdir(this.dir, { recursive: true });
      const raw = await fs.readFile(this.file, 'utf8');
      const parsed = JSON.parse(raw) as Partial<Preferences>;
      this.cache = { ...DEFAULT_PREFS, ...parsed };
    } catch {
      this.cache = { ...DEFAULT_PREFS };
    }
    return this.cache;
  }

  get(): Preferences {
    if (!this.cache) throw new Error('PreferencesStore.load() must be called first');
    return this.cache;
  }

  async set<K extends keyof Preferences>(key: K, value: Preferences[K]): Promise<void> {
    if (!this.cache) await this.load();
    this.cache = { ...(this.cache as Preferences), [key]: value };
    await fs.mkdir(this.dir, { recursive: true });
    await fs.writeFile(this.file, JSON.stringify(this.cache, null, 2), 'utf8');
  }
}
```

- [ ] **Step 5: Run tests — expect PASS**

Run: `pnpm test preferences`

- [ ] **Step 6: Wire into main**

Edit `src/main/index.ts`:

```ts
import { PreferencesStore } from './services/preferences';

let prefs: PreferencesStore;

app.whenReady().then(async () => {
  prefs = new PreferencesStore(path.join(app.getPath('userData')));
  await prefs.load();
  mainWin = createMainWindow();
  if (prefs.get().floatingEnabled) floatWin = createFloatingWindow();
});
```

- [ ] **Step 7: Commit**

```bash
git add src/main/services/preferences.ts src/main/services/preferences.test.ts src/shared/types.ts src/main/index.ts
git commit -m "feat(prefs): JSON preference store in userData dir"
```

---

### Task 25: IPC — prefs get/set from renderer

**Files:**
- Create: `src/main/ipc/channels.ts`
- Create: `src/main/ipc/handlers.ts`
- Modify: `src/preload/index.ts`
- Modify: `src/shared/types.ts`

- [ ] **Step 1: Channel constants**

```ts
// src/main/ipc/channels.ts
export const CH = {
  PREFS_GET: 'prefs:get',
  PREFS_SET: 'prefs:set',
  PREFS_CHANGED: 'prefs:changed',
} as const;
```

- [ ] **Step 2: Handlers**

```ts
// src/main/ipc/handlers.ts
import { ipcMain, BrowserWindow } from 'electron';
import { CH } from './channels';
import type { PreferencesStore } from '../services/preferences';
import type { Preferences } from '../../shared/types';

export function registerPrefsHandlers(prefs: PreferencesStore) {
  ipcMain.handle(CH.PREFS_GET, () => prefs.get());
  ipcMain.handle(CH.PREFS_SET, async (_e, key: keyof Preferences, value: Preferences[keyof Preferences]) => {
    await prefs.set(key, value as never);
    const updated = prefs.get();
    for (const w of BrowserWindow.getAllWindows()) {
      w.webContents.send(CH.PREFS_CHANGED, updated);
    }
    return updated;
  });
}
```

Call `registerPrefsHandlers(prefs)` inside `whenReady` after `prefs.load()` in `src/main/index.ts`.

- [ ] **Step 3: Extend `Api` and preload**

```ts
// src/shared/types.ts — extend Api
export interface Api {
  getWindowKind: () => WindowKind;
  win: { minimize: () => void; maximize: () => void; close: () => void; };
  floating: { startDrag: (x: number, y: number) => void; stopDrag: () => void; openMain: () => void; };
  prefs: {
    get: () => Promise<Preferences>;
    set: <K extends keyof Preferences>(key: K, value: Preferences[K]) => Promise<Preferences>;
    onChange: (cb: (p: Preferences) => void) => () => void;
  };
}
```

```ts
// src/preload/index.ts — add inside api:
import { ipcRenderer } from 'electron';
import { CH } from '../main/ipc/channels';
prefs: {
  get: () => ipcRenderer.invoke(CH.PREFS_GET),
  set: (key, value) => ipcRenderer.invoke(CH.PREFS_SET, key, value),
  onChange: (cb) => {
    const listener = (_e: Electron.IpcRendererEvent, p: Preferences) => cb(p);
    ipcRenderer.on(CH.PREFS_CHANGED, listener);
    return () => ipcRenderer.removeListener(CH.PREFS_CHANGED, listener);
  },
},
```

Note: the preload file is bundled separately — importing from `../main/ipc/channels` works because they're string constants, but to keep strict boundaries, move `channels.ts` to `src/shared/channels.ts` and import from there in both main and preload.

- [ ] **Step 4: Move channels to shared**

Move `src/main/ipc/channels.ts` → `src/shared/channels.ts`. Update imports in `handlers.ts` + `preload/index.ts`.

- [ ] **Step 5: Wire prefs to TabSettings**

Create `src/renderer/hooks/usePrefs.ts`:

```ts
import { useEffect, useState } from 'react';
import type { Preferences } from '@shared/types';

export function usePrefs() {
  const [prefs, setPrefs] = useState<Preferences | null>(null);
  useEffect(() => {
    window.api.prefs.get().then(setPrefs);
    return window.api.prefs.onChange(setPrefs);
  }, []);
  const update = <K extends keyof Preferences>(key: K, value: Preferences[K]) =>
    window.api.prefs.set(key, value).then(setPrefs);
  return { prefs, update };
}
```

Rewrite `TabSettings.tsx` to use `usePrefs()` — pass `prefs[key]` to each `SettingCard`'s `value` and `(v) => update(key, v)` to `onChange`. Map the 6 cards to: `startOnBoot`, `floatingEnabled`, `idleDetection`, `privacyBlank`, `sedentaryReminder`, `dailySummary`.

- [ ] **Step 6: Run and verify**

Run: `pnpm dev`. Toggle a setting. Kill the app, relaunch. Verify the setting persists.

- [ ] **Step 7: Commit**

```bash
git add src/main src/preload src/shared src/renderer
git commit -m "feat(prefs): typed IPC + usePrefs hook + persist TabSettings"
```

---

# Phase 7 — SQLite Data Layer

### Task 26: `better-sqlite3` singleton + migrations

**Files:**
- Create: `src/main/services/database.ts`
- Create: `src/main/services/database.test.ts`

- [ ] **Step 1: Write failing test**

```ts
// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { openDatabase } from './database';

describe('database', () => {
  let dir: string;
  beforeEach(async () => { dir = await fs.mkdtemp(path.join(os.tmpdir(), 'cc-db-')); });
  afterEach(async () => { await fs.rm(dir, { recursive: true, force: true }); });

  it('creates the events table on first open', () => {
    const db = openDatabase(path.join(dir, 'events.sqlite'));
    const rows = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    expect(rows.map((r: any) => r.name)).toContain('events');
    db.close();
  });

  it('is idempotent on repeated open', () => {
    const f = path.join(dir, 'events.sqlite');
    openDatabase(f).close();
    const db = openDatabase(f);
    expect(() => db.prepare('SELECT 1').get()).not.toThrow();
    db.close();
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

Run: `pnpm test database`

- [ ] **Step 3: Implement `database.ts`**

```ts
import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

const MIGRATIONS = [
  `CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    app_exe TEXT NOT NULL,
    app_name TEXT NOT NULL,
    started_at INTEGER NOT NULL,
    ended_at INTEGER NOT NULL,
    category TEXT NOT NULL
  );`,
  `CREATE INDEX IF NOT EXISTS idx_started ON events(started_at);`,
  `CREATE INDEX IF NOT EXISTS idx_ended   ON events(ended_at);`,
];

export function openDatabase(filePath: string): Database.Database {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const db = new Database(filePath);
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = NORMAL');
  for (const sql of MIGRATIONS) db.exec(sql);
  return db;
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
pnpm test database
```

- [ ] **Step 5: Commit**

```bash
git add src/main/services/database.ts src/main/services/database.test.ts
git commit -m "feat(db): better-sqlite3 with events schema + migrations"
```

---

### Task 27: Event repository

**Files:**
- Create: `src/main/services/repository.ts`
- Create: `src/main/services/repository.test.ts`

- [ ] **Step 1: Shared event type**

Edit `src/shared/types.ts`:

```ts
export interface UsageEvent {
  id?: number;
  appExe: string;
  appName: string;
  startedAt: number;   // unix ms
  endedAt: number;     // unix ms
  category: string;
}
```

- [ ] **Step 2: Write failing tests**

```ts
// @vitest-environment node
import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { openDatabase } from './database';
import { EventRepository } from './repository';

describe('EventRepository', () => {
  let db: Database.Database;
  let repo: EventRepository;
  beforeEach(() => {
    db = openDatabase(':memory:');
    repo = new EventRepository(db);
  });

  it('inserts an event and reads it back', () => {
    const id = repo.insert({ appExe: 'code.exe', appName: 'VS Code', startedAt: 1000, endedAt: 2000, category: '工作' });
    expect(repo.findById(id)).toMatchObject({ appName: 'VS Code', category: '工作' });
  });

  it('returns events in a time range', () => {
    repo.insert({ appExe: 'a.exe', appName: 'A', startedAt: 100, endedAt: 200, category: '工作' });
    repo.insert({ appExe: 'b.exe', appName: 'B', startedAt: 500, endedAt: 600, category: '娱乐' });
    repo.insert({ appExe: 'c.exe', appName: 'C', startedAt: 900, endedAt: 1000, category: '工作' });
    const rows = repo.findInRange(150, 650);
    expect(rows).toHaveLength(2);
    expect(rows.map((r) => r.appName).sort()).toEqual(['A', 'B']);
  });

  it('deletes all events', () => {
    repo.insert({ appExe: 'a.exe', appName: 'A', startedAt: 1, endedAt: 2, category: '工作' });
    repo.deleteAll();
    expect(repo.findInRange(0, 999_999)).toHaveLength(0);
  });
});
```

- [ ] **Step 3: Run — expect FAIL**

Run: `pnpm test repository`

- [ ] **Step 4: Implement `repository.ts`**

```ts
import type Database from 'better-sqlite3';
import type { UsageEvent } from '../../shared/types';

type Row = {
  id: number;
  app_exe: string;
  app_name: string;
  started_at: number;
  ended_at: number;
  category: string;
};

function rowToEvent(r: Row): UsageEvent {
  return {
    id: r.id,
    appExe: r.app_exe,
    appName: r.app_name,
    startedAt: r.started_at,
    endedAt: r.ended_at,
    category: r.category,
  };
}

export class EventRepository {
  constructor(private readonly db: Database.Database) {}

  insert(e: Omit<UsageEvent, 'id'>): number {
    const r = this.db
      .prepare(
        `INSERT INTO events (app_exe, app_name, started_at, ended_at, category)
         VALUES (?, ?, ?, ?, ?)`,
      )
      .run(e.appExe, e.appName, e.startedAt, e.endedAt, e.category);
    return Number(r.lastInsertRowid);
  }

  findById(id: number): UsageEvent | null {
    const row = this.db.prepare(`SELECT * FROM events WHERE id = ?`).get(id) as Row | undefined;
    return row ? rowToEvent(row) : null;
  }

  findInRange(fromMs: number, toMs: number): UsageEvent[] {
    const rows = this.db
      .prepare(`SELECT * FROM events WHERE started_at < ? AND ended_at > ? ORDER BY started_at`)
      .all(toMs, fromMs) as Row[];
    return rows.map(rowToEvent);
  }

  deleteAll(): void {
    this.db.exec(`DELETE FROM events`);
  }
}
```

- [ ] **Step 5: Run — expect PASS**

- [ ] **Step 6: Commit**

```bash
git add src/main/services/repository.ts src/main/services/repository.test.ts src/shared/types.ts
git commit -m "feat(db): typed EventRepository (insert, find-in-range, delete)"
```

---

### Task 28: Aggregator — today/hourly/byApp/byCategory

**Files:**
- Create: `src/main/services/aggregator.ts`
- Create: `src/main/services/aggregator.test.ts`

- [ ] **Step 1: Shared aggregate type**

```ts
// src/shared/types.ts
export interface TodaySummary {
  dateMs: number;              // midnight of the day
  totalMins: number;
  byApp: { appName: string; appExe: string; category: string; mins: number }[];
  byCategory: Record<string, number>;
  hourly: number[];            // 24 numbers, minutes per hour
}
```

- [ ] **Step 2: Write failing tests**

```ts
// @vitest-environment node
import { describe, it, expect, beforeEach } from 'vitest';
import { openDatabase } from './database';
import { EventRepository } from './repository';
import { aggregateDay } from './aggregator';

describe('aggregateDay', () => {
  let repo: EventRepository;
  const dayStart = new Date('2026-04-21T00:00:00').getTime();
  const h = (hour: number, min = 0) => dayStart + hour * 3_600_000 + min * 60_000;

  beforeEach(() => {
    repo = new EventRepository(openDatabase(':memory:'));
  });

  it('sums minutes per app', () => {
    repo.insert({ appExe: 'code.exe', appName: 'VS Code', startedAt: h(9), endedAt: h(10), category: '工作' });
    repo.insert({ appExe: 'code.exe', appName: 'VS Code', startedAt: h(11), endedAt: h(11, 30), category: '工作' });
    const s = aggregateDay(repo, dayStart);
    expect(s.totalMins).toBe(90);
    expect(s.byApp[0]).toMatchObject({ appName: 'VS Code', mins: 90 });
  });

  it('splits a cross-hour event across hourly buckets', () => {
    repo.insert({ appExe: 'c.exe', appName: 'C', startedAt: h(10, 45), endedAt: h(11, 15), category: '工作' });
    const s = aggregateDay(repo, dayStart);
    expect(s.hourly[10]).toBe(15);
    expect(s.hourly[11]).toBe(15);
  });

  it('clamps events crossing midnight to the requested day', () => {
    repo.insert({ appExe: 'c.exe', appName: 'C', startedAt: h(23, 45), endedAt: h(24, 0) + 15 * 60_000, category: '工作' });
    const s = aggregateDay(repo, dayStart);
    expect(s.hourly[23]).toBe(15);
    expect(s.totalMins).toBe(15);
  });

  it('aggregates by category', () => {
    repo.insert({ appExe: 'a.exe', appName: 'A', startedAt: h(9), endedAt: h(10), category: '工作' });
    repo.insert({ appExe: 'b.exe', appName: 'B', startedAt: h(14), endedAt: h(15), category: '娱乐' });
    const s = aggregateDay(repo, dayStart);
    expect(s.byCategory).toEqual({ 工作: 60, 娱乐: 60 });
  });
});
```

- [ ] **Step 3: Run — expect FAIL**

- [ ] **Step 4: Implement `aggregator.ts`**

```ts
import type { EventRepository } from './repository';
import type { TodaySummary } from '../../shared/types';
import { HOURS_PER_DAY } from '../../shared/tokens';

const HOUR_MS = 3_600_000;
const MIN_MS = 60_000;

export function aggregateDay(repo: EventRepository, dayStartMs: number): TodaySummary {
  const dayEndMs = dayStartMs + HOURS_PER_DAY * HOUR_MS;
  const events = repo.findInRange(dayStartMs, dayEndMs);

  const hourly = new Array<number>(HOURS_PER_DAY).fill(0);
  const byApp = new Map<string, { appName: string; appExe: string; category: string; ms: number }>();
  const byCategory: Record<string, number> = {};

  for (const e of events) {
    const startMs = Math.max(e.startedAt, dayStartMs);
    const endMs = Math.min(e.endedAt, dayEndMs);
    if (endMs <= startMs) continue;
    const durMs = endMs - startMs;

    // hourly split
    let cursor = startMs;
    while (cursor < endMs) {
      const hourIdx = Math.floor((cursor - dayStartMs) / HOUR_MS);
      const hourEnd = dayStartMs + (hourIdx + 1) * HOUR_MS;
      const chunkEnd = Math.min(hourEnd, endMs);
      hourly[hourIdx] += Math.round((chunkEnd - cursor) / MIN_MS);
      cursor = chunkEnd;
    }

    const key = e.appExe;
    const cur = byApp.get(key);
    if (cur) cur.ms += durMs;
    else byApp.set(key, { appName: e.appName, appExe: e.appExe, category: e.category, ms: durMs });

    byCategory[e.category] = (byCategory[e.category] ?? 0) + Math.round(durMs / MIN_MS);
  }

  const byAppArr = [...byApp.values()]
    .map((v) => ({ appName: v.appName, appExe: v.appExe, category: v.category, mins: Math.round(v.ms / MIN_MS) }))
    .sort((a, b) => b.mins - a.mins);

  const totalMins = byAppArr.reduce((s, a) => s + a.mins, 0);

  return { dateMs: dayStartMs, totalMins, byApp: byAppArr, byCategory, hourly };
}

export function startOfToday(now = Date.now()): number {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}
```

- [ ] **Step 5: Run — expect PASS (all 4 cases)**

- [ ] **Step 6: Commit**

```bash
git add src/main/services/aggregator.ts src/main/services/aggregator.test.ts src/shared/types.ts
git commit -m "feat(db): aggregate day into hourly, byApp, byCategory"
```

---

# Phase 8 — Windows Tracker + Mood

### Task 29: App categorizer

**Files:**
- Create: `src/main/services/categorizer.ts`
- Create: `src/main/services/categorizer.test.ts`

- [ ] **Step 1: Failing test**

```ts
import { describe, it, expect } from 'vitest';
import { categorize } from './categorizer';

describe('categorize', () => {
  it('classifies dev tools as 工作', () => {
    expect(categorize('C:\\Code\\Microsoft VS Code\\Code.exe', 'VS Code')).toBe('工作');
  });
  it('classifies browsers as 浏览', () => {
    expect(categorize('C:\\chrome.exe', 'Chrome')).toBe('浏览');
  });
  it('classifies chat apps as 沟通', () => {
    expect(categorize('C:\\feishu.exe', '飞书')).toBe('沟通');
  });
  it('classifies streaming as 娱乐', () => {
    expect(categorize('C:\\netflix.exe', 'Netflix')).toBe('娱乐');
  });
  it('defaults unknown apps to 其他', () => {
    expect(categorize('C:\\unknown.exe', 'Unknown')).toBe('其他');
  });
});
```

- [ ] **Step 2: Implement**

```ts
// src/main/services/categorizer.ts
import type { Category } from '../../shared/tokens';

const RULES: { pattern: RegExp; category: Category }[] = [
  { pattern: /(code|webstorm|idea|rider|pycharm|vim|emacs|sublime|notepad\+\+|terminal|powershell|cmd|wsl)/i, category: '工作' },
  { pattern: /(figma|sketch|photoshop|illustrator|affinity|procreate|blender)/i,                 category: '工作' },
  { pattern: /(notion|obsidian|logseq|onenote|word|excel|powerpoint)/i,                           category: '工作' },
  { pattern: /(chrome|firefox|edge|safari|arc|brave|opera)/i,                                     category: '浏览' },
  { pattern: /(wechat|weixin|dingtalk|feishu|lark|slack|teams|discord|telegram|qq|signal|mail|outlook|thunderbird)/i, category: '沟通' },
  { pattern: /(spotify|netflix|youtube|bilibili|steam|epicgames|vlc|iina|neteasemusic|qqmusic)/i, category: '娱乐' },
  { pattern: /(飞书|微信|钉钉|邮箱)/, category: '沟通' },
];

export function categorize(exePath: string, appName: string): Category {
  const haystack = `${exePath} ${appName}`;
  for (const r of RULES) {
    if (r.pattern.test(haystack)) return r.category;
  }
  return '其他';
}
```

- [ ] **Step 3: Run tests — PASS**

- [ ] **Step 4: Commit**

```bash
git add src/main/services/categorizer.ts src/main/services/categorizer.test.ts
git commit -m "feat(tracker): rule-based app categorizer"
```

---

### Task 30: Mood rule engine

**Files:**
- Create: `src/main/services/mood.ts`
- Create: `src/main/services/mood.test.ts`

- [ ] **Step 1: Write failing tests**

Tests encode the README rules (lines 160–167):

```ts
import { describe, it, expect } from 'vitest';
import { computeMood } from './mood';

describe('computeMood', () => {
  const baseHour = 14;

  it('returns happy when under 5 hours', () => {
    expect(computeMood({ totalMins: 60,  hour: baseHour, anyAppOverLimit: false, focusRunning: false })).toBe('happy');
    expect(computeMood({ totalMins: 299, hour: baseHour, anyAppOverLimit: false, focusRunning: false })).toBe('happy');
  });
  it('returns calm at 5–8 hours', () => {
    expect(computeMood({ totalMins: 300, hour: baseHour, anyAppOverLimit: false, focusRunning: false })).toBe('calm');
    expect(computeMood({ totalMins: 479, hour: baseHour, anyAppOverLimit: false, focusRunning: false })).toBe('calm');
  });
  it('returns worried at 8+ hours', () => {
    expect(computeMood({ totalMins: 480, hour: baseHour, anyAppOverLimit: false, focusRunning: false })).toBe('worried');
  });
  it('returns sleepy after 22:00', () => {
    expect(computeMood({ totalMins: 200, hour: 22, anyAppOverLimit: false, focusRunning: false })).toBe('sleepy');
    expect(computeMood({ totalMins: 200, hour: 23, anyAppOverLimit: false, focusRunning: false })).toBe('sleepy');
  });
  it('returns alert when an app exceeds its limit', () => {
    expect(computeMood({ totalMins: 60, hour: 14, anyAppOverLimit: true, focusRunning: false })).toBe('alert');
  });
  it('focus mode overrides everything with calm', () => {
    expect(computeMood({ totalMins: 9999, hour: 23, anyAppOverLimit: true, focusRunning: true })).toBe('calm');
  });
});
```

- [ ] **Step 2: Implement**

```ts
import type { Mood } from '../../shared/tokens';

export interface MoodInput {
  totalMins: number;
  hour: number;           // 0-23
  anyAppOverLimit: boolean;
  focusRunning: boolean;
}

export function computeMood(i: MoodInput): Mood {
  if (i.focusRunning) return 'calm';
  if (i.anyAppOverLimit) return 'alert';
  if (i.hour >= 22) return 'sleepy';
  if (i.totalMins >= 480) return 'worried';
  if (i.totalMins >= 300) return 'calm';
  return 'happy';
}
```

- [ ] **Step 3: Run — PASS**

- [ ] **Step 4: Commit**

```bash
git add src/main/services/mood.ts src/main/services/mood.test.ts
git commit -m "feat(mood): mood rule engine from README spec"
```

---

### Task 31: Foreground app tracker (per-second polling)

**Files:**
- Create: `src/main/services/tracker.ts`

- [ ] **Step 1: Wrap `get-windows` + write tracker**

```ts
import { activeWindow } from 'get-windows';
import { EventEmitter } from 'node:events';
import type { EventRepository } from './repository';
import { categorize } from './categorizer';

export interface CurrentAppInfo {
  appExe: string;
  appName: string;
  category: string;
  currentSessionMins: number;
  sessionStartedAt: number;
}

export class Tracker extends EventEmitter {
  private timer: NodeJS.Timeout | null = null;
  private current: { appExe: string; appName: string; category: string; startedAt: number } | null = null;
  private paused = false;

  constructor(private readonly repo: EventRepository) { super(); }

  start() {
    if (this.timer) return;
    this.timer = setInterval(() => this.tick().catch((err) => console.error('[tracker]', err)), 1000);
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.flush();
  }

  pause() { this.paused = true; this.flush(); }
  resume() { this.paused = false; }

  private async tick() {
    if (this.paused) return;
    const win = await activeWindow();
    if (!win) return;
    const appExe = ('path' in win && typeof win.path === 'string') ? win.path : win.owner.path;
    const appName = win.owner.name;
    const category = categorize(appExe, appName);
    const now = Date.now();

    if (!this.current) {
      this.current = { appExe, appName, category, startedAt: now };
      this.emit('change', this.currentInfo());
      return;
    }
    if (this.current.appExe !== appExe) {
      this.repo.insert({
        appExe: this.current.appExe,
        appName: this.current.appName,
        startedAt: this.current.startedAt,
        endedAt: now,
        category: this.current.category,
      });
      this.current = { appExe, appName, category, startedAt: now };
      this.emit('change', this.currentInfo());
    } else {
      this.emit('tick', this.currentInfo());
    }
  }

  private flush() {
    if (!this.current) return;
    this.repo.insert({
      appExe: this.current.appExe,
      appName: this.current.appName,
      startedAt: this.current.startedAt,
      endedAt: Date.now(),
      category: this.current.category,
    });
    this.current = null;
  }

  currentInfo(): CurrentAppInfo | null {
    if (!this.current) return null;
    const now = Date.now();
    return {
      appExe: this.current.appExe,
      appName: this.current.appName,
      category: this.current.category,
      currentSessionMins: Math.round((now - this.current.startedAt) / 60_000),
      sessionStartedAt: this.current.startedAt,
    };
  }
}
```

- [ ] **Step 2: Wire into main process**

Edit `src/main/index.ts`:

```ts
import { openDatabase } from './services/database';
import { EventRepository } from './services/repository';
import { Tracker } from './services/tracker';

let tracker: Tracker;

app.whenReady().then(async () => {
  // …existing…
  const db = openDatabase(path.join(app.getPath('userData'), 'events.sqlite'));
  const repo = new EventRepository(db);
  tracker = new Tracker(repo);
  tracker.start();
  app.on('before-quit', () => tracker.stop());
});
```

- [ ] **Step 3: Smoke test**

Run `pnpm dev`. Let it run for 30 seconds while switching between 2-3 apps. Kill the app. Open the SQLite file (`%APPDATA%/screen-time-cloud/events.sqlite`) with a tool like DB Browser for SQLite or via `sqlite3` CLI and verify events rows exist.

- [ ] **Step 4: Commit**

```bash
git add src/main
git commit -m "feat(tracker): per-second foreground app tracker writing to SQLite"
```

---

### Task 32: Idle detection via `powerMonitor`

**Files:**
- Create: `src/main/services/idle.ts`
- Modify: `src/main/index.ts`

- [ ] **Step 1: Write `idle.ts`**

```ts
import { powerMonitor } from 'electron';
import { EventEmitter } from 'node:events';

const IDLE_THRESHOLD_SECS = 5 * 60;

export class IdleMonitor extends EventEmitter {
  private timer: NodeJS.Timeout | null = null;
  private idle = false;
  start() {
    if (this.timer) return;
    this.timer = setInterval(() => {
      const idleSecs = powerMonitor.getSystemIdleTime();
      const nowIdle = idleSecs >= IDLE_THRESHOLD_SECS;
      if (nowIdle !== this.idle) {
        this.idle = nowIdle;
        this.emit(nowIdle ? 'idle' : 'active');
      }
    }, 10_000);
  }
  stop() { if (this.timer) clearInterval(this.timer); this.timer = null; }
  isIdle() { return this.idle; }
}
```

- [ ] **Step 2: Wire to tracker**

In `src/main/index.ts`:

```ts
import { IdleMonitor } from './services/idle';

const idleMon = new IdleMonitor();
idleMon.start();
idleMon.on('idle', () => { if (prefs.get().idleDetection) tracker.pause(); });
idleMon.on('active', () => tracker.resume());
```

- [ ] **Step 3: Manually verify**

Run `pnpm dev`. Don't touch mouse/keyboard for 5 minutes. Then move the mouse. Inspect logs or database — events should stop accumulating while idle.

- [ ] **Step 4: Commit**

```bash
git add src/main
git commit -m "feat(tracker): idle detection via powerMonitor pauses tracking"
```

---

# Phase 9 — Live Data in the UI

### Task 33: IPC for today summary + current app + ticks

**Files:**
- Modify: `src/shared/channels.ts`
- Modify: `src/main/ipc/handlers.ts`
- Modify: `src/preload/index.ts`
- Modify: `src/shared/types.ts`

- [ ] **Step 1: Add channels**

```ts
// src/shared/channels.ts additions
export const CH = {
  // …existing…
  TODAY_GET: 'today:get',
  HISTORY_GET_WEEK: 'history:get-week',
  CURRENT_APP: 'current-app',            // push
  TICK: 'tick',                          // push (once per second)
  EVENTS_CLEAR: 'events:clear',
  EVENTS_EXPORT: 'events:export',
} as const;
```

- [ ] **Step 2: Add handlers**

```ts
// src/main/ipc/handlers.ts
import { ipcMain, BrowserWindow, app } from 'electron';
import { CH } from '../../shared/channels';
import { aggregateDay, startOfToday } from '../services/aggregator';
import type { EventRepository } from '../services/repository';
import type { Tracker } from '../services/tracker';
import type { Focus } from '../services/focus'; // Task 35
import { computeMood } from '../services/mood';
import type { Preferences } from '../../shared/types';
import type { PreferencesStore } from '../services/preferences';

export function registerDataHandlers(repo: EventRepository, prefs: PreferencesStore, tracker: Tracker, focus: Focus) {
  ipcMain.handle(CH.TODAY_GET, () => aggregateDay(repo, startOfToday()));

  ipcMain.handle(CH.HISTORY_GET_WEEK, () => {
    const days: ReturnType<typeof aggregateDay>[] = [];
    const today = startOfToday();
    for (let i = 6; i >= 0; i--) days.push(aggregateDay(repo, today - i * 86_400_000));
    return days;
  });

  ipcMain.handle(CH.EVENTS_CLEAR, () => { repo.deleteAll(); });

  ipcMain.handle(CH.EVENTS_EXPORT, () => {
    // return all events within last 90 days for JSON export
    const from = Date.now() - 90 * 86_400_000;
    return repo.findInRange(from, Date.now());
  });

  // Push current app + tick to all renderers
  tracker.on('change', (info) => {
    for (const w of BrowserWindow.getAllWindows()) w.webContents.send(CH.CURRENT_APP, info);
  });

  setInterval(() => {
    const info = tracker.currentInfo();
    const today = aggregateDay(repo, startOfToday());
    const mood = computeMood({
      totalMins: today.totalMins,
      hour: new Date().getHours(),
      anyAppOverLimit: anyAppOverLimit(today, prefs.get()),
      focusRunning: focus.isRunning(),
    });
    for (const w of BrowserWindow.getAllWindows()) w.webContents.send(CH.TICK, { current: info, today, mood });
  }, 1000);
}

function anyAppOverLimit(summary: ReturnType<typeof aggregateDay>, prefs: Preferences): boolean {
  return summary.byApp.some((a) => {
    const limit = prefs.appLimits[a.appExe];
    return typeof limit === 'number' && a.mins >= limit;
  });
}
```

Call `registerDataHandlers(…)` in `whenReady` after repo/tracker/focus are constructed.

- [ ] **Step 3: Extend `Api` and preload**

```ts
// src/shared/types.ts — extend
export interface TickPayload {
  current: import('../main/services/tracker').CurrentAppInfo | null;
  today: TodaySummary;
  mood: import('./tokens').Mood;
}

export interface Api {
  // …existing…
  data: {
    getToday: () => Promise<TodaySummary>;
    getWeek: () => Promise<TodaySummary[]>;
    clearAll: () => Promise<void>;
    exportAll: () => Promise<UsageEvent[]>;
    onTick: (cb: (p: TickPayload) => void) => () => void;
    onCurrentApp: (cb: (p: unknown) => void) => () => void;
  };
}
```

Avoid importing from `main/services/*` in the `shared` types directory — copy the `CurrentAppInfo` shape into shared/types instead. Update this in `tracker.ts` too:

```ts
// src/shared/types.ts
export interface CurrentAppInfo {
  appExe: string;
  appName: string;
  category: string;
  currentSessionMins: number;
  sessionStartedAt: number;
}
```

And remove the duplicate from `tracker.ts`, importing from `../../shared/types`.

- [ ] **Step 4: Preload wiring**

```ts
// src/preload/index.ts — add to api:
data: {
  getToday:   () => ipcRenderer.invoke(CH.TODAY_GET),
  getWeek:    () => ipcRenderer.invoke(CH.HISTORY_GET_WEEK),
  clearAll:   () => ipcRenderer.invoke(CH.EVENTS_CLEAR),
  exportAll:  () => ipcRenderer.invoke(CH.EVENTS_EXPORT),
  onTick: (cb) => {
    const l = (_e: Electron.IpcRendererEvent, p: TickPayload) => cb(p);
    ipcRenderer.on(CH.TICK, l);
    return () => ipcRenderer.removeListener(CH.TICK, l);
  },
  onCurrentApp: (cb) => {
    const l = (_e: Electron.IpcRendererEvent, p: unknown) => cb(p);
    ipcRenderer.on(CH.CURRENT_APP, l);
    return () => ipcRenderer.removeListener(CH.CURRENT_APP, l);
  },
},
```

- [ ] **Step 5: Commit**

```bash
git add src/main src/preload src/shared
git commit -m "feat(ipc): today/week summary + per-second tick push"
```

---

### Task 34: Renderer store — subscribe to ticks

**Files:**
- Create: `src/renderer/state/store.ts`
- Create: `src/renderer/hooks/useToday.ts`
- Create: `src/renderer/hooks/useMood.ts`

- [ ] **Step 1: Zustand store**

```ts
// src/renderer/state/store.ts
import { create } from 'zustand';
import type { TickPayload, TodaySummary, CurrentAppInfo } from '@shared/types';
import type { Mood } from '@shared/tokens';

interface AppStore {
  today: TodaySummary | null;
  current: CurrentAppInfo | null;
  mood: Mood;
  week: TodaySummary[];
  setTick: (p: TickPayload) => void;
  setWeek: (w: TodaySummary[]) => void;
}

export const useStore = create<AppStore>((set) => ({
  today: null,
  current: null,
  mood: 'happy',
  week: [],
  setTick: (p) => set({ today: p.today, current: p.current, mood: p.mood }),
  setWeek: (w) => set({ week: w }),
}));
```

- [ ] **Step 2: Wire subscribe in App roots**

Edit `src/renderer/App.tsx`:

```tsx
import { useEffect } from 'react';
import { MainWindow } from './main-window/MainWindow';
import { useStore } from './state/store';

export default function App() {
  const { setTick, setWeek } = useStore();
  useEffect(() => {
    window.api.data.getToday().then((t) => setTick({ today: t, current: null, mood: 'happy' }));
    window.api.data.getWeek().then(setWeek);
    return window.api.data.onTick(setTick);
  }, [setTick, setWeek]);
  return <MainWindow />;
}
```

Do the same in `FloatingApp.tsx`.

- [ ] **Step 3: Hooks for ergonomic access**

```ts
// src/renderer/hooks/useToday.ts
import { useStore } from '../state/store';
export const useToday = () => useStore((s) => s.today);
export const useWeek = () => useStore((s) => s.week);
export const useCurrent = () => useStore((s) => s.current);

// src/renderer/hooks/useMood.ts
import { useStore } from '../state/store';
export const useMood = () => useStore((s) => s.mood);
```

- [ ] **Step 4: Commit**

```bash
git add src/renderer/state src/renderer/hooks src/renderer/App.tsx src/renderer/FloatingApp.tsx
git commit -m "feat(renderer): zustand store + tick subscription"
```

---

### Task 35: Replace mock data in Tabs with real data

**Files:**
- Modify: `src/renderer/main-window/tabs/TabToday.tsx`
- Modify: `src/renderer/main-window/tabs/TabApps.tsx`
- Modify: `src/renderer/main-window/tabs/TabTimeline.tsx`
- Modify: `src/renderer/main-window/tabs/TabStats.tsx`
- Modify: `src/renderer/main-window/widgets/PieDoodle.tsx`
- Modify: `src/renderer/main-window/widgets/TimelineMini.tsx`

- [ ] **Step 1: Refactor `PieDoodle` + `TimelineMini` to take data as props**

```tsx
// PieDoodle.tsx
interface PieDoodleProps {
  size?: number;
  slices: { name: string; mins: number; color: string }[];
}
export function PieDoodle({ size = 160, slices }: PieDoodleProps) { /* use slices instead of CATEGORIES */ }

// TimelineMini.tsx
interface TimelineMiniProps { hourly: number[]; nowHour?: number; }
export function TimelineMini({ hourly, nowHour = new Date().getHours() }: TimelineMiniProps) { /* … */ }
```

- [ ] **Step 2: Update `TabToday.tsx` to use `useToday()` + `useMood()`**

```tsx
import { useToday } from '../../hooks/useToday';
import { useMood } from '../../hooks/useMood';
import { CATEGORY_COLORS } from '@shared/tokens';

export function TabToday() {
  const today = useToday();
  const mood = useMood();
  if (!today) return <div style={{ padding: 40 }}>加载中…</div>;

  const h = Math.floor(today.totalMins / 60);
  const m = today.totalMins % 60;
  const slices = Object.entries(today.byCategory).map(([name, mins]) => ({
    name, mins, color: CATEGORY_COLORS[name as keyof typeof CATEGORY_COLORS] ?? 'var(--ink-mute)',
  }));
  const topApps = today.byApp.slice(0, 3);

  // …render with `today.*` and `mood`, keeping all JSX structure from Task 12…
  // Greeting mascot: use <CloudMascot mood={mood} />
  // Top 3 cards: map over topApps (AppIcon kind — pick 'doc' as fallback for unknown)…
}
```

Since real app `appExe` doesn't map to our 12 `AppIconKind` values, add a helper:

```ts
// src/renderer/utils/iconKind.ts
import type { AppIconKind } from '../components/primitives/AppIcon';
export function iconKindFor(appName: string, exePath: string): AppIconKind {
  const s = `${appName} ${exePath}`.toLowerCase();
  if (/code|cursor|vim|ide/.test(s)) return 'code';
  if (/figma|sketch|photoshop|illustr/.test(s)) return 'design';
  if (/feishu|slack|wechat|qq|discord|teams/.test(s)) return 'chat';
  if (/chrome|firefox|edge|safari|brave/.test(s)) return 'browse';
  if (/spotify|music|netease/.test(s)) return 'music';
  if (/youtube|bilibili|netflix|vlc/.test(s)) return 'video';
  if (/steam|epic|game/.test(s)) return 'game';
  if (/notion|word|excel|office|obsidian/.test(s)) return 'doc';
  if (/mail|outlook/.test(s)) return 'mail';
  if (/terminal|cmd|powershell|bash|wsl/.test(s)) return 'term';
  return 'doc';
}
```

- [ ] **Step 3: Update `TabApps.tsx`**

Use `today.byApp` instead of `TODAY_APPS`. Compute `max` from that list. Use `iconKindFor(name, exe)`. Filter categories from real data.

- [ ] **Step 4: Update `TabTimeline.tsx`**

Pass `today.hourly` to the big bar chart. Re-use same structure; replace `HOURLY` mock import.

- [ ] **Step 5: Update `TabStats.tsx`**

Replace `WEEKLY` mock with `useWeek()`. Map weekday labels from the day-of-week of each `dateMs`.

```ts
const WEEKDAY_CN = ['日', '一', '二', '三', '四', '五', '六'];
const weekly = week.map((d) => ({ d: WEEKDAY_CN[new Date(d.dateMs).getDay()], mins: d.totalMins }));
```

- [ ] **Step 6: Delete `mockData.ts` (keep only what the floating card still uses, or migrate those too)**

Remove all remaining imports of `TODAY_APPS`, `CATEGORIES`, `HOURLY`, `WEEKLY` in the main window. The floating widget card will use `useCurrent()` + `useToday()` — next task.

- [ ] **Step 7: Verify**

Run `pnpm dev`. Use your computer for a few minutes. Open main window — should see real app usage aggregating on Today, Timeline, and Apps tabs. Stats tab shows 7-day pattern (mostly just today).

- [ ] **Step 8: Commit**

```bash
git add src/renderer
git commit -m "feat(renderer): wire real SQLite-backed data into all tabs"
```

---

### Task 36: Floating widget uses live data

**Files:**
- Modify: `src/renderer/FloatingApp.tsx`
- Modify: `src/renderer/floating/popovers/ExpandedCard.tsx`

- [ ] **Step 1: Pull real data in `FloatingApp`**

```tsx
import { useToday, useCurrent } from './hooks/useToday';
import { useMood } from './hooks/useMood';
import { iconKindFor } from './utils/iconKind';

export default function FloatingApp() {
  const today = useToday();
  const current = useCurrent();
  const mood = useMood();
  // …same hover/contextmenu effect as before…
  const curApp = current
    ? { name: current.appName, kind: iconKindFor(current.appName, current.appExe), mins: current.currentSessionMins }
    : { name: '待命中', kind: 'doc' as const, mins: 0 };
  return (
    // …existing wrapper…
    <FloatingWidget variant="A" state={state} onStateChange={setState}
      mood={mood} curApp={curApp} todayMins={today?.totalMins ?? 0} />
  );
}
```

- [ ] **Step 2: Pass dynamic category slices to `ExpandedCard`**

`ExpandedCard` currently imports `CATEGORIES` (mock). Change it to take `categoryBreakdown: { name: string; mins: number; color: string }[]` + `totalMins` as props, and have the variants pass them through.

- [ ] **Step 3: Verify**

Run `pnpm dev`. Switch apps — the floating pill's badge should update each second. Click it → expanded card shows the live current app + today total.

- [ ] **Step 4: Commit**

```bash
git add src/renderer
git commit -m "feat(floating): consume live tick data for widget display"
```

---

### Task 37: Respect `floatingVariant` + `mascotKind` prefs

**Files:**
- Modify: `src/renderer/FloatingApp.tsx`
- Modify: `src/renderer/main-window/Sidebar.tsx`
- Modify: `src/renderer/main-window/tabs/TabToday.tsx`

- [ ] **Step 1: Read prefs in FloatingApp**

```tsx
const { prefs } = usePrefs();
// …
<FloatingWidget variant={prefs?.floatingVariant ?? 'A'} … />
```

- [ ] **Step 2: Read `mascotKind` + `theme` in main window**

Wrap `App.tsx`'s return in:

```tsx
const { prefs } = usePrefs();
return (
  <div className={prefs?.theme === 'dark' ? 'theme-dark' : ''} style={{ width:'100vw', height:'100vh' }}>
    <MainWindow mascotKind={prefs?.mascotKind ?? 'cloud'} />
  </div>
);
```

Thread `mascotKind` through `MainWindow` → `Sidebar`. Replace any `CloudMascot` in greeting row of `TabToday` with the conditional `JellyMascot` variant when `mascotKind === 'jelly'`.

- [ ] **Step 3: Add a hidden settings row to switch variant/mascot**

Append two more cards to `TabSettings`:

```tsx
<VariantCard prefs={prefs} onChange={update} />  // cycles A/B/C
<MascotCard prefs={prefs}  onChange={update} />  // cycles cloud/jelly
```

These are small inline sub-components with radio-style buttons.

- [ ] **Step 4: Verify**

Run `pnpm dev`. Toggle `floatingVariant` in settings → floating window updates live (via `prefs:changed` push from Task 25).

- [ ] **Step 5: Commit**

```bash
git add src/renderer
git commit -m "feat(prefs): live-wire floatingVariant, mascotKind, theme"
```

---

# Phase 10 — Native Polish

### Task 38: Focus mode state machine (IPC)

**Files:**
- Create: `src/main/services/focus.ts`
- Modify: `src/main/ipc/handlers.ts`
- Modify: `src/main/index.ts`
- Modify: `src/shared/channels.ts`
- Modify: `src/shared/types.ts`
- Modify: `src/renderer/main-window/tabs/TabFocus.tsx`

- [ ] **Step 1: Main-process `Focus`**

```ts
import { EventEmitter } from 'node:events';
import type { Notification } from 'electron';

export interface FocusState {
  running: boolean;
  remainingSecs: number;
  task: string;
  completedToday: number;
}

const DEFAULT_DURATION_SECS = 25 * 60;

export class Focus extends EventEmitter {
  private state: FocusState = { running: false, remainingSecs: DEFAULT_DURATION_SECS, task: '', completedToday: 0 };
  private timer: NodeJS.Timeout | null = null;

  start(minutes = 25) {
    this.state.remainingSecs = minutes * 60;
    this.state.running = true;
    this.timer = setInterval(() => {
      this.state.remainingSecs = Math.max(0, this.state.remainingSecs - 1);
      if (this.state.remainingSecs === 0) this.complete();
      this.emit('update', this.state);
    }, 1000);
    this.emit('update', this.state);
  }

  pause() { this.state.running = false; if (this.timer) clearInterval(this.timer); this.emit('update', this.state); }
  reset() { this.pause(); this.state.remainingSecs = DEFAULT_DURATION_SECS; this.emit('update', this.state); }

  private complete() {
    if (this.timer) clearInterval(this.timer);
    this.state.running = false;
    this.state.completedToday++;
    this.emit('update', this.state);
    this.emit('completed');
  }

  isRunning() { return this.state.running; }
  getState(): FocusState { return { ...this.state }; }
  setTask(task: string) { this.state.task = task; this.emit('update', this.state); }
}
```

- [ ] **Step 2: Add channels + handlers**

```ts
// channels.ts
FOCUS_GET: 'focus:get',
FOCUS_START: 'focus:start',
FOCUS_PAUSE: 'focus:pause',
FOCUS_RESET: 'focus:reset',
FOCUS_SET_TASK: 'focus:set-task',
FOCUS_UPDATE: 'focus:update',
```

```ts
// handlers.ts — new function:
export function registerFocusHandlers(focus: Focus) {
  ipcMain.handle(CH.FOCUS_GET, () => focus.getState());
  ipcMain.handle(CH.FOCUS_START, (_e, mins: number) => { focus.start(mins); });
  ipcMain.handle(CH.FOCUS_PAUSE, () => focus.pause());
  ipcMain.handle(CH.FOCUS_RESET, () => focus.reset());
  ipcMain.handle(CH.FOCUS_SET_TASK, (_e, t: string) => focus.setTask(t));
  focus.on('update', (s) => {
    for (const w of BrowserWindow.getAllWindows()) w.webContents.send(CH.FOCUS_UPDATE, s);
  });
}
```

- [ ] **Step 3: Preload + Api additions**

```ts
focus: {
  get:     () => ipcRenderer.invoke(CH.FOCUS_GET),
  start:   (mins: number) => ipcRenderer.invoke(CH.FOCUS_START, mins),
  pause:   () => ipcRenderer.invoke(CH.FOCUS_PAUSE),
  reset:   () => ipcRenderer.invoke(CH.FOCUS_RESET),
  setTask: (t: string) => ipcRenderer.invoke(CH.FOCUS_SET_TASK, t),
  onUpdate: (cb: (s: FocusState) => void) => {
    const l = (_e: Electron.IpcRendererEvent, s: FocusState) => cb(s);
    ipcRenderer.on(CH.FOCUS_UPDATE, l);
    return () => ipcRenderer.removeListener(CH.FOCUS_UPDATE, l);
  },
},
```

- [ ] **Step 4: Replace local timer in `TabFocus.tsx` with IPC-driven state**

```tsx
import { useEffect, useState } from 'react';
import type { FocusState } from '@shared/types';

export function TabFocus() {
  const [fs, setFs] = useState<FocusState | null>(null);
  useEffect(() => {
    window.api.focus.get().then(setFs);
    return window.api.focus.onUpdate(setFs);
  }, []);

  if (!fs) return null;
  const mm = String(Math.floor(fs.remainingSecs / 60)).padStart(2, '0');
  const ss = String(fs.remainingSecs % 60).padStart(2, '0');
  const pct = 1 - fs.remainingSecs / (25 * 60);

  // …same JSX as before, but:
  // - button: onClick={() => fs.running ? window.api.focus.pause() : window.api.focus.start(25)}
  // - reset: onClick={() => window.api.focus.reset()}
  // - task input: defaultValue={fs.task} onBlur={(e) => window.api.focus.setTask(e.target.value)}
}
```

Export `FocusState` from `@shared/types`.

- [ ] **Step 5: Verify**

Run `pnpm dev`. Start focus. Close the main window via tray/close button. Reopen it — the timer continues from where it was (state lives in main). Start floating widget's 🍅 button → same timer starts.

- [ ] **Step 6: Commit**

```bash
git add src/main src/preload src/shared src/renderer
git commit -m "feat(focus): main-process pomodoro state machine + IPC"
```

---

### Task 39: Sedentary reminder toast

**Files:**
- Modify: `src/main/index.ts`

- [ ] **Step 1: Use Electron `Notification`**

```ts
import { Notification } from 'electron';

let sedentaryTimer: NodeJS.Timeout | null = null;
function scheduleSedentary() {
  if (sedentaryTimer) clearInterval(sedentaryTimer);
  sedentaryTimer = setInterval(() => {
    if (!prefs.get().sedentaryReminder) return;
    if (idleMon.isIdle()) return;
    if (focus.isRunning()) return;
    new Notification({
      title: '云云来提醒啦～',
      body: '站起来动一动吧，眼睛也歇一歇～',
      silent: false,
    }).show();
  }, 45 * 60 * 1000);
}

app.whenReady().then(() => {
  // …
  scheduleSedentary();
});
```

- [ ] **Step 2: Verify**

For testing, temporarily lower interval to 30s, run, wait, confirm a native Windows notification appears. Reset to 45 min.

- [ ] **Step 3: Commit**

```bash
git add src/main/index.ts
git commit -m "feat(reminder): sedentary reminder via native Notification every 45m"
```

---

### Task 40: System tray

**Files:**
- Create: `src/main/services/tray.ts`
- Create: `resources/tray-icon.png` (16×16 PNG — derive from CloudMascot SVG; for now, use a simple placeholder white cloud)
- Modify: `src/main/index.ts`

- [ ] **Step 1: Generate a placeholder tray icon**

Create `resources/tray-icon.png` — a 16×16 cloud glyph on transparent. (Quickest path: rasterize `cloud-mascot.jsx`'s cloud path at 16×16 using any image editor or `sharp`. For a first cut, you can use a 16×16 solid-cream square and iterate later.)

Document this placeholder in the commit message so it's flagged for replacement.

- [ ] **Step 2: Write `tray.ts`**

```ts
import { Tray, Menu, nativeImage, app, BrowserWindow } from 'electron';
import path from 'node:path';

export function createTray(getMainWin: () => BrowserWindow | null, onQuit: () => void, onPause: () => void, onFocus: () => void): Tray {
  const iconPath = app.isPackaged
    ? path.join(process.resourcesPath, 'tray-icon.png')
    : path.join(__dirname, '../../resources/tray-icon.png');
  const img = nativeImage.createFromPath(iconPath);
  const tray = new Tray(img);

  const menu = Menu.buildFromTemplate([
    { label: '打开主窗口', click: () => { const w = getMainWin(); if (w) { if (w.isMinimized()) w.restore(); w.show(); w.focus(); } } },
    { label: '开始专注', click: onFocus },
    { label: '暂停记录', click: onPause },
    { type: 'separator' },
    { label: '退出', click: onQuit },
  ]);
  tray.setToolTip('屏幕使用时间 · 云云');
  tray.setContextMenu(menu);
  tray.on('double-click', () => { const w = getMainWin(); if (w) { w.show(); w.focus(); } });
  return tray;
}
```

- [ ] **Step 3: Wire in `src/main/index.ts`**

```ts
import { createTray } from './services/tray';

let tray: Electron.Tray;
app.whenReady().then(() => {
  // …
  tray = createTray(
    () => mainWin,
    () => app.quit(),
    () => tracker.pause(),
    () => focus.start(25),
  );
});
```

- [ ] **Step 4: Verify**

Run `pnpm dev`. See a cloud icon in the Windows system tray. Right-click → 4 items + Exit. Double-click → main window focuses.

- [ ] **Step 5: Commit**

```bash
git add resources src/main
git commit -m "feat(tray): system tray icon with context menu (TODO: real icon asset)"
```

---

### Task 41: Auto-start on boot

**Files:**
- Create: `src/main/services/autoStart.ts`
- Modify: `src/main/index.ts`

- [ ] **Step 1: Implement using `app.setLoginItemSettings`**

```ts
// src/main/services/autoStart.ts
import { app } from 'electron';
export function setAutoStart(enabled: boolean) {
  app.setLoginItemSettings({
    openAtLogin: enabled,
    path: process.execPath,
    args: ['--hidden'],
  });
}
export function getAutoStart(): boolean {
  return app.getLoginItemSettings().openAtLogin;
}
```

- [ ] **Step 2: Apply from prefs at startup + on pref change**

```ts
// src/main/index.ts
import { setAutoStart } from './services/autoStart';

app.whenReady().then(async () => {
  // …after prefs.load():
  setAutoStart(prefs.get().startOnBoot);
});
```

Listen for pref changes — update `registerPrefsHandlers` so after `prefs.set('startOnBoot', v)`, call `setAutoStart(v)`:

```ts
ipcMain.handle(CH.PREFS_SET, async (_e, key, value) => {
  await prefs.set(key, value as never);
  if (key === 'startOnBoot') setAutoStart(value as boolean);
  // …
});
```

Handle `--hidden` CLI arg in main:

```ts
const startHidden = process.argv.includes('--hidden');
// …
mainWin = createMainWindow();
if (startHidden) mainWin.hide();
```

- [ ] **Step 3: Verify**

Toggle 开机自启 in Settings → on → verify registry entry appears in `HKCU\Software\Microsoft\Windows\CurrentVersion\Run` (via `reg query` or Task Manager → Startup). Toggle off → entry removed.

- [ ] **Step 4: Commit**

```bash
git add src/main
git commit -m "feat(prefs): auto-start on boot (HKCU run key) + --hidden launch"
```

---

### Task 42: Export / clear events in Settings

**Files:**
- Modify: `src/renderer/main-window/tabs/TabSettings.tsx`

- [ ] **Step 1: Wire 导出 button**

```tsx
const onExport = async () => {
  const events = await window.api.data.exportAll();
  const blob = new Blob([JSON.stringify(events, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cloudcloud-export-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
};
```

- [ ] **Step 2: Wire 清空 button with confirm**

```tsx
const onClear = async () => {
  if (!confirm('确定要清空所有历史数据？此操作不可撤销。')) return;
  await window.api.data.clearAll();
  alert('已清空 · 云云会重新记录～');
};
```

- [ ] **Step 3: Attach to the bottom privacy card buttons**

```tsx
<DoodleButton onClick={onExport}>导出</DoodleButton>
<DoodleButton variant="peach" onClick={onClear}>清空</DoodleButton>
```

- [ ] **Step 4: Verify**

Run `pnpm dev`. Click 导出 → browser download prompt for JSON. Click 清空 → confirm → DB is emptied; verify main window tabs reset to 0.

- [ ] **Step 5: Commit**

```bash
git add src/renderer
git commit -m "feat(settings): export and clear history actions"
```

---

### Task 43: Save floating window position + floating toggle

**Files:**
- Modify: `src/main/windows/floatingWindow.ts`
- Modify: `src/main/index.ts`

- [ ] **Step 1: Use saved position on creation**

```ts
// floatingWindow.ts
export function createFloatingWindow(savedPos: { x: number; y: number } | null): BrowserWindow {
  const { workArea } = screen.getPrimaryDisplay();
  const defaultX = workArea.x + workArea.width - 320;
  const defaultY = workArea.y + workArea.height - 360;
  const win = new BrowserWindow({
    // …existing props…
    x: savedPos?.x ?? defaultX,
    y: savedPos?.y ?? defaultY,
  });
  // …
  return win;
}
```

Pass `prefs.get().floatingPos` into it.

- [ ] **Step 2: Save position on window `move` with debounce**

```ts
let moveDebounce: NodeJS.Timeout | null = null;
floatWin.on('move', () => {
  if (moveDebounce) clearTimeout(moveDebounce);
  moveDebounce = setTimeout(() => {
    const [x, y] = floatWin!.getPosition();
    void prefs.set('floatingPos', { x, y });
  }, 500);
});
```

- [ ] **Step 3: React to `floatingEnabled` toggling**

In `registerPrefsHandlers`, on the `floatingEnabled` change:

```ts
if (key === 'floatingEnabled') {
  if (value && !floatWin) floatWin = createFloatingWindow(prefs.get().floatingPos);
  else if (!value && floatWin) { floatWin.close(); floatWin = null; }
}
```

Export `floatWin` mutation as a callback or use a shared module reference.

- [ ] **Step 4: Verify**

Drag widget → kill app → relaunch → widget restored at the same position. Toggle "悬浮窗" off in Settings → widget disappears. Toggle on → reappears at last position.

- [ ] **Step 5: Commit**

```bash
git add src/main
git commit -m "feat(floating): persist position and honor floatingEnabled pref"
```

---

### Task 44: Dark-mode theme application

**Files:**
- Modify: `src/renderer/App.tsx` (done in Task 37 partially — confirm)
- Modify: `src/main/windows/mainWindow.ts` / `floatingWindow.ts` for background color

- [ ] **Step 1: Apply `.theme-dark` at document root**

Edit `src/renderer/main.tsx`:

```tsx
import { useEffect } from 'react';
// inside a wrapper or Root render, watch prefs and toggle document.body.classList.
```

Or simpler — in `App.tsx` and `FloatingApp.tsx`:

```tsx
useEffect(() => {
  document.documentElement.classList.toggle('theme-dark', prefs?.theme === 'dark');
}, [prefs?.theme]);
```

- [ ] **Step 2: Update `createMainWindow` backgroundColor to match theme**

```ts
backgroundColor: savedTheme === 'dark' ? '#1E1E2A' : '#F5F1E8',
```

Read from `prefs.get().theme` when calling `createMainWindow`.

- [ ] **Step 3: Verify**

Flip theme pref in settings (add a Dark Mode toggle card). Main window tokens flip — all CSS-var-styled components adapt.

- [ ] **Step 4: Commit**

```bash
git add src/renderer src/main
git commit -m "feat(theme): apply dark theme at document root + window bg"
```

---

### Task 45: Packaging + final QA

**Files:**
- Modify: `package.json` (verify electron-builder config)

- [ ] **Step 1: Build**

Run: `pnpm build`
Expected: `out/main/index.js`, `out/preload/index.js`, `out/renderer/index.html`, `out/renderer/floating.html` all generated.

- [ ] **Step 2: Preview**

Run: `pnpm start`
Expected: Production Electron app launches; all features (tracking, tray, floating widget, prefs) work.

- [ ] **Step 3: Produce installer**

Run: `pnpm dist`
Expected: `dist/CloudCloud Setup 0.1.0.exe` (NSIS installer).

- [ ] **Step 4: Smoke-test installed app**

Install the `.exe` into `%LocalAppData%\Programs\CloudCloud\`. Launch. Verify:
- Tracker records events (let it run 2 minutes).
- Floating widget renders correctly.
- Tray icon is present with context menu.
- Settings toggles persist across restart.
- Auto-start toggle reflects in `HKCU\…\Run`.

- [ ] **Step 5: Final lint + typecheck + tests**

Run: `pnpm lint && pnpm typecheck && pnpm test`
Expected: 0 errors, all tests pass.

- [ ] **Step 6: Commit + tag**

```bash
git add package.json
git commit -m "chore(release): 0.1.0 — first shippable build"
git tag v0.1.0
```

---

## Appendix A — Known Open Items for v0.1+

From README "Open Questions for Dev", left deliberately out of scope for v0.1:

1. **Multi-monitor floating position memory** — only primary display is honored; add per-display position map later.
2. **Focus-mode entertainment blocking** — soft reminder only (a toast); hard blocking (SuspendThread) deferred.
3. **User-editable categorization rules** — hard-coded regex in `categorizer.ts`; a future UI + `prefs.customCategories` map.
4. **Cloud sync** — explicitly excluded; all data stays in `%APPDATA%\CloudCloud\`.

## Appendix B — Native Windows Integration Caveats

- `get-windows` uses Windows APIs under the hood; no manual compilation required on modern versions, but verify `better-sqlite3` prebuilt binaries match Electron's Node ABI (see `node-abi` table). If `pnpm install` fails with "NODE_MODULE_VERSION mismatch", run `pnpm rebuild better-sqlite3` or add `@electron/rebuild`.
- `powerMonitor.getSystemIdleTime()` returns seconds since last input at the system level — it does not require elevation on Windows 10/11.
- `contextMenu` and `Tray` require the app to be packaged (or run via `pnpm start`) for all native behaviors to show correctly. Dev mode (`pnpm dev`) may display tray icons oddly on some Windows theme configurations.

---

**End of plan.** 45 tasks across 10 phases. Execute phase-by-phase with review checkpoints at the end of each phase.
