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
        <div style={{
          display: 'flex',
          // @ts-expect-error non-standard CSS property handled by Electron
          WebkitAppRegion: 'no-drag',
        }}>
          <WinBtn kind="min"   onClick={() => window.api.win.minimize()} />
          <WinBtn kind="max"   onClick={() => window.api.win.maximize()} />
          <WinBtn kind="close" onClick={() => window.api.win.close()} />
        </div>
      </div>
      {children}
    </div>
  );
}
