import { useState } from 'react';
import { WinChrome } from '../components/window/WinChrome';
import { Sidebar, type TabKey } from './Sidebar';
import { TabToday } from './tabs/TabToday';
import { TabApps } from './tabs/TabApps';
import { TabTimeline } from './tabs/TabTimeline';
import { TabStats } from './tabs/TabStats';
import { TabFocus } from './tabs/TabFocus';
import { TabSettings } from './tabs/TabSettings';

export function MainWindow() {
  const [tab, setTab] = useState<TabKey>('today');
  return (
    <WinChrome>
      <div style={{ flex: 1, display: 'flex', minHeight: 0, background: 'var(--paper)' }}>
        <Sidebar active={tab} onChange={setTab} />
        <div className="scroll-hide" style={{ flex: 1, overflow: 'auto', minWidth: 0 }}>
          {tab === 'today'    && <TabToday />}
          {tab === 'apps'     && <TabApps />}
          {tab === 'timeline' && <TabTimeline />}
          {tab === 'stats'    && <TabStats />}
          {tab === 'focus'    && <TabFocus />}
          {tab === 'settings' && <TabSettings />}
        </div>
      </div>
    </WinChrome>
  );
}
