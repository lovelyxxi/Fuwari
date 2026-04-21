// 桌面场景 —— 展示悬浮窗 + 最小化状态 + 可选主窗口并排

function DesktopScene({ variant = 'A', state = 'pill', mood = 'happy', dark = false, showMainMini = false, label }) {
  // 模拟桌面 —— 一张纸底 + 几个应用轮廓 + 任务栏 + 浮动 widget
  return (
    <div className={dark ? 'theme-dark' : ''} style={{
      width: 560, height: 380,
      position: 'relative',
      background: dark
        ? 'linear-gradient(135deg, #1a1a28 0%, #252535 100%)'
        : 'linear-gradient(135deg, #E8EDF5 0%, #F0E8EE 100%)',
      border: '2px solid var(--line)',
      borderRadius: '14px 16px 14px 16px',
      overflow: 'hidden',
      fontFamily: 'var(--font-sans)',
      boxShadow: '4px 4px 0 var(--line)',
    }}>
      {/* 桌面应用图标 */}
      <div style={{ position: 'absolute', top: 16, left: 16, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {['browse','doc','code','design','chat','video'].map((k, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ opacity: 0.85 }}><AppIcon kind={k} size={32} /></div>
            <div style={{ fontSize: 9, color: dark ? '#BDBACF' : '#5A5A72', fontWeight: 600 }}>—</div>
          </div>
        ))}
      </div>

      {/* 模拟当前前台应用窗口（被最小化前的样子淡化） */}
      {showMainMini && (
        <div style={{
          position: 'absolute', top: 30, right: 40,
          width: 220, height: 140,
          background: dark ? '#2A2A3A' : 'var(--cloud-white)',
          border: '1.8px solid var(--line)',
          borderRadius: 8,
          opacity: 0.5,
          boxShadow: '3px 3px 0 var(--line)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}>
          <div style={{ height: 20, background: 'var(--paper-deep)', borderBottom: '1.5px solid var(--line)', display:'flex', alignItems:'center', paddingLeft: 8, fontSize: 10, fontWeight: 700 }}>
            Figma — design.fig
          </div>
          <div style={{ flex: 1, background: 'repeating-linear-gradient(45deg, transparent 0 6px, rgba(42,42,60,0.06) 6px 7px)' }} />
        </div>
      )}

      {/* 悬浮窗位置 —— 右下角 */}
      <div style={{ position: 'absolute', bottom: 56, right: 24 }}>
        <FloatingWidget variant={variant} state={state} mood={mood} />
      </div>

      {/* Windows 任务栏 */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 36,
        background: dark ? 'rgba(20,20,28,0.85)' : 'rgba(253,252,248,0.85)',
        borderTop: '2px solid var(--line)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', paddingLeft: 10, gap: 6,
      }}>
        {/* Start */}
        <div style={{ width: 26, height: 26, borderRadius: 4, background: 'var(--mint)', border: '1.5px solid var(--line)', display:'flex', alignItems:'center', justifyContent:'center', fontSize: 12 }}>⊞</div>
        <div style={{ width: 120, height: 22, background: dark ? '#3A3A4A' : 'var(--paper-deep)', borderRadius: 11, border: '1.5px solid var(--line)', fontSize: 10, color: dark ? '#9A9AB0' : '#9A9AB0', display:'flex', alignItems:'center', paddingLeft: 10 }}>🔍 搜索</div>
        {[' ',' ',' ',' '].map((_,i)=>(
          <div key={i} style={{ width: 26, height: 26, borderRadius: 4, background: 'transparent', border: '1.5px dashed ' + (dark?'#5A5A72':'#9A9AB0') }} />
        ))}
        <div style={{ flex: 1 }} />
        {/* 云云图标已常驻任务栏 */}
        <div style={{ display:'flex', alignItems:'center', gap: 6, paddingRight: 12, fontSize: 10, color: dark ? '#BDBACF' : '#5A5A72', fontWeight: 700 }}>
          <div style={{ width: 22, height: 22, borderRadius:'50%', background: 'var(--cloud-white)', border: '1.5px solid var(--line)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <CloudMascot size={16} mood={mood} wobble={false} />
          </div>
          8h 44
        </div>
      </div>

      {label && (
        <div style={{
          position: 'absolute', top: 10, right: 14,
          background: 'var(--lemon)',
          border: '1.5px solid var(--line)',
          borderRadius: 10,
          padding: '3px 10px',
          fontSize: 10, fontWeight: 800,
          boxShadow: '2px 2px 0 var(--line)',
          transform: 'rotate(3deg)',
        }}>{label}</div>
      )}
    </div>
  );
}

Object.assign(window, { DesktopScene });
