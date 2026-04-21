import type { ReactNode } from 'react';
import { CloudMascot } from '../mascots/CloudMascot';
import { WinBtn } from './WinBtn';

interface WinChromeProps {
  children: ReactNode;
  dark?: boolean;
}

export function WinChrome({ children, dark }: WinChromeProps) {
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
          paddingLeft: 14,
          paddingRight: 14,
          // @ts-expect-error non-standard CSS property handled by Electron
          WebkitAppRegion: 'drag',
        }}
      >
        <CloudMascot size={24} mood="happy" wobble={false} />
        <div style={{ flex: 1 }} />

        {/* macOS-style traffic lights — close / min / max — moved to the right */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            // @ts-expect-error non-standard CSS property handled by Electron
            WebkitAppRegion: 'no-drag',
          }}
        >
          <WinBtn kind="min"   onClick={() => window.api.win.minimize()} />
          <WinBtn kind="max"   onClick={() => window.api.win.maximize()} />
          <WinBtn kind="close" onClick={() => window.api.win.close()} />
        </div>
      </div>
      {children}
    </div>
  );
}
