// 悬浮窗 — 桌面上的小云朵，支持 4 种形态
// pill（默认）| card（展开）| tooltip（悬停）| menu（右键）

function FloatingWidget({ variant = 'A', state: forcedState, mood = 'happy', onStateChange }) {
  // variant A: 云云头像 pill
  // variant B: 胶囊条
  // variant C: 吉祥物（站在桌面上）

  const [state, setState] = React.useState(forcedState || 'pill');
  React.useEffect(() => { if (forcedState) setState(forcedState); }, [forcedState]);
  const set = (s) => { setState(s); onStateChange?.(s); };

  const curApp = { name: 'Figma', kind: 'design', mins: 74 };
  const todayMins = 524;

  if (variant === 'B') return <PillBar state={state} set={set} curApp={curApp} todayMins={todayMins} mood={mood} />;
  if (variant === 'C') return <StandingMascot state={state} set={set} curApp={curApp} todayMins={todayMins} mood={mood} />;

  // === Variant A: 小圆头像 pill（默认） ===
  return (
    <div style={{ position: 'relative', width: 240, display: 'inline-block' }}>
      {/* 主 pill — 小圆头像 + 两段数字 */}
      <div
        style={{
          width: 72, height: 72,
          borderRadius: '50%',
          background: 'var(--cloud-white)',
          border: '2.5px solid var(--line)',
          boxShadow: '3px 4px 0 var(--line), 0 6px 20px rgba(42,42,60,0.18)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
          cursor: 'pointer',
        }}
        onClick={() => set(state === 'card' ? 'pill' : 'card')}
      >
        <CloudMascot size={56} mood={mood} />
        {/* 小数字徽章 */}
        <div style={{
          position: 'absolute', bottom: -4, right: -4,
          background: 'var(--lilac)',
          border: '2px solid var(--line)',
          borderRadius: 12,
          padding: '2px 7px',
          fontSize: 11, fontWeight: 800,
          boxShadow: '1.5px 1.5px 0 var(--line)',
          fontFamily: 'var(--font-sans)',
        }}>
          {Math.floor(todayMins/60)}h{todayMins%60}
        </div>
        {/* 左上腮红 "drag" 提示 */}
        <div style={{
          position: 'absolute', top: -6, left: -6,
          width: 16, height: 16, borderRadius: '50%',
          background: 'var(--peach)',
          border: '2px solid var(--line)',
          display: state === 'pill' ? 'flex' : 'none',
          alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:800,
        }}>⋮⋮</div>
      </div>

      {/* 展开卡片 */}
      {state === 'card' && <ExpandedCard curApp={curApp} todayMins={todayMins} mood={mood} onClose={()=>set('pill')} />}

      {/* hover tooltip */}
      {state === 'tooltip' && <HoverTooltip curApp={curApp} todayMins={todayMins} />}

      {/* 右键菜单 */}
      {state === 'menu' && <ContextMenu onClose={()=>set('pill')} />}
    </div>
  );
}

function ExpandedCard({ curApp, todayMins, mood, onClose }) {
  return (
    <div
      className="doodle-border"
      style={{
        position: 'absolute', bottom: 'calc(100% + 12px)', left: -6,
        width: 256, padding: '14px 16px',
        background: 'var(--cloud-white)',
        boxShadow: '4px 5px 0 var(--line), 0 10px 30px rgba(42,42,60,0.22)',
      }}
    >
      {/* 小尾巴 — 向下 */}
      <svg style={{ position: 'absolute', bottom: -14, left: 24 }} width="18" height="16" viewBox="0 0 18 16">
        <path d="M 1 1 L 9 14 L 17 1 Z" fill="var(--cloud-white)" stroke="var(--line)" strokeWidth="2" strokeLinejoin="round" />
        <line x1="2" y1="1" x2="17" y2="1" stroke="var(--cloud-white)" strokeWidth="3" />
      </svg>

      {/* 关闭 */}
      <button onClick={onClose} style={{ position: 'absolute', top: 8, right: 10, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 16, color: 'var(--ink-soft)', lineHeight:1 }}>×</button>

      {/* 当前应用 */}
      <div style={{ fontSize: 10, color: 'var(--ink-mute)', fontWeight: 700, letterSpacing: 1 }}>正在使用</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
        <AppIcon kind={curApp.kind} size={36} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--ink)' }}>{curApp.name}</div>
          <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>已打开 {fmtMins(curApp.mins)}</div>
        </div>
        <CloudMascot size={40} mood={mood} />
      </div>

      <div className="hr-wavy" style={{ margin: '12px -4px 10px' }} />

      {/* 今日总览 */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
        <div>
          <div style={{ fontSize: 10, color: 'var(--ink-mute)', fontWeight: 700, letterSpacing: 1 }}>今日总计</div>
          <div style={{ display: 'flex', alignItems:'baseline', gap: 4, marginTop: 2 }}>
            <span style={{ fontFamily: 'var(--font-hand)', fontSize: 32, lineHeight: 0.9, color: 'var(--ink)' }}>{Math.floor(todayMins/60)}</span>
            <span style={{ fontSize: 11, color: 'var(--ink-soft)', fontWeight: 700 }}>h</span>
            <span style={{ fontFamily: 'var(--font-hand)', fontSize: 26, lineHeight: 0.9, color: 'var(--ink)' }}>{todayMins%60}</span>
            <span style={{ fontSize: 11, color: 'var(--ink-soft)', fontWeight: 700 }}>m</span>
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <span className="chip" style={{ background: 'var(--mint)' }}>↓ 比昨天少</span>
      </div>

      {/* 分类条 */}
      <div style={{ display:'flex', height: 8, borderRadius: 4, overflow: 'hidden', border:'1.5px solid var(--line)', marginTop: 10 }}>
        {CATEGORIES.map((c, i) => (
          <div key={c.name} style={{ background: c.color, width: `${c.mins/524*100}%`, borderRight: i<CATEGORIES.length-1?'1.5px solid var(--line)':'none' }} />
        ))}
      </div>

      {/* 按钮排 */}
      <div style={{ display:'flex', gap: 6, marginTop: 12 }}>
        <button className="btn-doodle primary" style={{ flex:1, padding:'6px 8px', fontSize: 12 }}>🍅 专注</button>
        <button className="btn-doodle mint" style={{ flex:1, padding:'6px 8px', fontSize: 12 }}>⤢ 打开</button>
        <button className="btn-doodle" style={{ padding:'6px 10px', fontSize: 12 }}>⏸</button>
      </div>

      {/* 小贴心 */}
      <div style={{ marginTop: 10, padding: '8px 10px', background: 'var(--lemon)', borderRadius: 8, fontSize: 11, color: 'var(--ink)', fontFamily:'var(--font-hand-cn)' }}>
        💧 记得歇歇眼睛哦
      </div>
    </div>
  );
}

function HoverTooltip({ curApp, todayMins }) {
  return (
    <div style={{
      position: 'absolute', bottom: 'calc(100% + 12px)', left: -4,
      background: 'var(--ink)',
      color: 'var(--cloud-white)',
      padding: '8px 12px',
      borderRadius: '10px 12px 10px 12px',
      boxShadow: '3px 3px 0 var(--line)',
      fontSize: 12,
      width: 200,
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:6, fontWeight:700 }}>
        <AppIcon kind={curApp.kind} size={18} /> {curApp.name}
      </div>
      <div style={{ marginTop: 6, display:'flex', justifyContent:'space-between', opacity: 0.85 }}>
        <span>本次 {fmtMins(curApp.mins)}</span>
        <span>今日 {fmtMins(todayMins)}</span>
      </div>
      <div style={{ marginTop: 6, fontFamily: 'var(--font-hand)', fontSize: 14, color: 'var(--mint)' }}>
        双击打开主窗口
      </div>
    </div>
  );
}

function ContextMenu({ onClose }) {
  const items = [
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
  return (
    <div onClick={onClose} style={{
      position: 'absolute', bottom: 'calc(100% + 12px)', left: 70,
      width: 220, background: 'var(--cloud-white)',
      border: '2px solid var(--line)',
      borderRadius: '10px 12px 10px 12px',
      boxShadow: '4px 4px 0 var(--line)',
      padding: 6,
      fontFamily: 'var(--font-sans)',
    }}>
      {items.map((it, i) => it === null
        ? <div key={i} style={{ height: 1, background: 'var(--paper-deep)', margin: '4px 2px' }} />
        : (
          <div key={i} style={{
            display:'flex', alignItems:'center', gap: 10,
            padding: '7px 10px',
            borderRadius: 6,
            fontSize: 13,
            color: it.warn ? 'var(--peach-deep)' : 'var(--ink)',
            cursor: 'pointer',
          }}
          onMouseEnter={e=>e.currentTarget.style.background='var(--paper-deep)'}
          onMouseLeave={e=>e.currentTarget.style.background='transparent'}
          >
            <span style={{ width: 18, textAlign:'center' }}>{it.icon}</span>
            <span style={{ flex: 1 }}>{it.label}</span>
            {it.shortcut && <span style={{ fontSize: 10, color: 'var(--ink-mute)', fontFamily:'monospace' }}>{it.shortcut}</span>}
          </div>
        )
      )}
    </div>
  );
}

// === Variant B：胶囊条 ===
function PillBar({ state, set, curApp, todayMins, mood }) {
  return (
    <div style={{ position:'relative', display:'inline-block' }}>
      <div
        onClick={() => set(state==='card' ? 'pill' : 'card')}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '6px 14px 6px 6px',
          background: 'var(--cloud-white)',
          border: '2.5px solid var(--line)',
          borderRadius: 36,
          boxShadow: '3px 4px 0 var(--line), 0 6px 20px rgba(42,42,60,0.18)',
          cursor: 'pointer',
          width: 'fit-content',
        }}
      >
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--paper-deep)', border: '2px solid var(--line)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <CloudMascot size={32} mood={mood} wobble={false} />
        </div>
        <div>
          <div style={{ fontSize: 10, color: 'var(--ink-mute)', fontWeight: 700, letterSpacing: 1 }}>正在 · {curApp.name}</div>
          <div style={{ display:'flex', alignItems:'baseline', gap: 4 }}>
            <span style={{ fontFamily: 'var(--font-hand)', fontSize: 20, lineHeight: 1, color: 'var(--ink)' }}>{fmtMins(curApp.mins)}</span>
            <span style={{ fontSize: 10, color: 'var(--ink-mute)' }}>· 今日 {fmtMins(todayMins)}</span>
          </div>
        </div>
      </div>

      {state === 'card' && <ExpandedCard curApp={curApp} todayMins={todayMins} mood={mood} onClose={()=>set('pill')} />}
      {state === 'tooltip' && <HoverTooltip curApp={curApp} todayMins={todayMins} />}
      {state === 'menu' && <ContextMenu onClose={()=>set('pill')} />}
    </div>
  );
}

// === Variant C：站在桌面上的吉祥物 ===
function StandingMascot({ state, set, curApp, todayMins, mood }) {
  return (
    <div style={{ position:'relative', display:'inline-block', width: 120, height: 120 }}>
      {/* 影子 */}
      <div style={{ position:'absolute', bottom: 0, left: '50%', transform:'translateX(-50%)', width: 64, height: 8, background: 'rgba(42,42,60,0.15)', borderRadius:'50%', filter:'blur(2px)' }} />

      <div style={{ position:'absolute', top: 0, left: 0, width: 120, cursor:'pointer' }} onClick={() => set(state==='card' ? 'pill' : 'card')}>
        <JellyMascot size={110} mood={mood} />
      </div>

      {/* 头顶小气泡 */}
      <div style={{
        position:'absolute', top: -6, right: -14,
        background: 'var(--cloud-white)',
        border: '2px solid var(--line)',
        borderRadius: '14px 16px 14px 4px',
        padding: '4px 9px',
        fontSize: 11, fontWeight: 700,
        boxShadow: '2px 2px 0 var(--line)',
        whiteSpace: 'nowrap',
      }}>
        {fmtMins(curApp.mins)} @ {curApp.name}
      </div>

      {state === 'card' && <ExpandedCard curApp={curApp} todayMins={todayMins} mood={mood} onClose={()=>set('pill')} />}
      {state === 'tooltip' && <HoverTooltip curApp={curApp} todayMins={todayMins} />}
      {state === 'menu' && <ContextMenu onClose={()=>set('pill')} />}
    </div>
  );
}

Object.assign(window, { FloatingWidget, ExpandedCard, HoverTooltip, ContextMenu });
