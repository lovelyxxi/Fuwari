// Windows 风格窗口外壳 + 主窗口（含左侧导航 + tab 切换）

function WinChrome({ title = '屏幕使用时间 · 云云', onMin, dark, children, width = 960, height = 620 }) {
  return (
    <div className={dark ? 'theme-dark' : ''} style={{
      width, height,
      display: 'flex', flexDirection: 'column',
      background: 'var(--paper)',
      border: '2px solid var(--line)',
      borderRadius: '14px 16px 14px 16px',
      boxShadow: '6px 6px 0 var(--line), 0 20px 60px rgba(42,42,60,0.15)',
      overflow: 'hidden',
      fontFamily: 'var(--font-sans)',
      color: 'var(--ink)',
    }}>
      {/* 标题栏 —— Windows 风，但圆角手绘 */}
      <div style={{
        height: 36, flexShrink: 0,
        display: 'flex', alignItems: 'center',
        borderBottom: '2px solid var(--line)',
        background: 'var(--cloud-white)',
        paddingLeft: 12,
      }}>
        <CloudMascot size={26} mood="happy" wobble={false} />
        <div style={{ marginLeft: 10, fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{title}</div>
        <div style={{ marginLeft: 10, fontSize: 11, color: 'var(--ink-mute)', fontFamily: 'var(--font-hand)' }}>
          — 陪你看时间慢慢走
        </div>
        <div style={{ flex: 1 }} />
        <WinBtn kind="min" onClick={onMin} />
        <WinBtn kind="max" />
        <WinBtn kind="close" />
      </div>

      {children}
    </div>
  );
}

function WinBtn({ kind, onClick }) {
  const icons = {
    min:   <line x1="2" y1="6" x2="10" y2="6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />,
    max:   <rect x="2" y="2" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="1.3" />,
    close: <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><line x1="2" y1="2" x2="10" y2="10"/><line x1="10" y1="2" x2="2" y2="10"/></g>,
  };
  const [h, setH] = React.useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{
        width: 46, height: 36, border: 'none', background: h ? (kind==='close' ? 'var(--peach)' : 'var(--paper-deep)') : 'transparent',
        borderLeft: '1.5px solid var(--line)',
        color: 'var(--ink)', cursor: 'pointer', display:'flex', alignItems:'center', justifyContent:'center',
      }}>
      <svg width="12" height="12" viewBox="0 0 12 12">{icons[kind]}</svg>
    </button>
  );
}

const NAV_ITEMS = [
  { key: 'today',    label: '今日',    icon: '☁' },
  { key: 'apps',     label: '排行榜',  icon: '★' },
  { key: 'timeline', label: '时间线',  icon: '∿' },
  { key: 'stats',    label: '周月',    icon: '▦' },
  { key: 'focus',    label: '专注',    icon: '🍅' },
  { key: 'settings', label: '设置',    icon: '⚙' },
];

function MainWindow({ dark, onMin, startTab = 'today', mascotKind = 'cloud' }) {
  const [tab, setTab] = React.useState(startTab);

  const Mascot = mascotKind === 'jelly' ? JellyMascot : CloudMascot;

  return (
    <WinChrome dark={dark} onMin={onMin}>
      <div style={{ flex: 1, display: 'flex', minHeight: 0, background: 'var(--paper)' }}>
        {/* 左侧导航 */}
        <div style={{
          width: 88, flexShrink: 0,
          background: 'var(--paper-deep)',
          borderRight: '2px solid var(--line)',
          padding: '14px 8px',
          display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          {NAV_ITEMS.map(n => (
            <button
              key={n.key}
              onClick={() => setTab(n.key)}
              style={{
                border: tab===n.key ? '2px solid var(--line)' : '2px solid transparent',
                background: tab===n.key ? 'var(--cloud-white)' : 'transparent',
                borderRadius: '12px 14px 12px 14px',
                padding: '10px 0',
                cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                boxShadow: tab===n.key ? '2px 2px 0 var(--line)' : 'none',
                color: 'var(--ink)',
              }}
            >
              <span style={{ fontSize: 20, lineHeight: 1 }}>{n.icon}</span>
              <span style={{ fontSize: 11, fontWeight: 700 }}>{n.label}</span>
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <div style={{ textAlign: 'center', paddingTop: 10, borderTop: '1.5px dashed var(--ink-mute)' }}>
            <Mascot size={42} mood="calm" />
            <div style={{ fontFamily: 'var(--font-hand)', fontSize: 14, color: 'var(--ink-soft)', marginTop: 2 }}>v1.0</div>
          </div>
        </div>

        {/* 内容区 */}
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

Object.assign(window, { MainWindow, WinChrome });
