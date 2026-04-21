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

  return (
    <div style={{ padding: '20px 32px 28px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24 }}>
        {/* left: tomato timer */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-hand)', fontSize: 32, color: 'var(--ink)' }}>来颗番茄吧 🍅</div>
          <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 2 }}>专心 25 分钟，休息 5 分钟</div>

          <div style={{ position: 'relative', marginTop: 16 }}>
            <svg width="230" height="230" viewBox="0 0 230 230">
              <circle cx="115" cy="115" r="100" fill="var(--peach)" stroke="var(--line)" strokeWidth="2.5" />
              <circle cx="115" cy="115" r="100" fill="none" stroke="var(--line)" strokeWidth="4"
                strokeDasharray={`${pct * 628} 628`} strokeDashoffset="0"
                transform="rotate(-90 115 115)" strokeLinecap="round" />
              <path d="M 90 40 Q 95 28 115 32 Q 130 22 140 36 Q 160 28 155 48 Q 135 60 115 54 Q 95 58 90 40 Z"
                fill="var(--mint)" stroke="var(--line)" strokeWidth="2" />
              <text x="115" y="128" textAnchor="middle" fontFamily="Nunito" fontWeight="800" fontSize="54" fill="var(--ink)">
                {mm}:{ss}
              </text>
            </svg>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
            <DoodleButton variant="primary" onClick={() => setRunning((r) => !r)}>
              {running ? '⏸ 暂停' : '▶ 开始专注'}
            </DoodleButton>
            <DoodleButton onClick={() => { setRunning(false); setSecs(25 * 60); }}>↺ 重置</DoodleButton>
          </div>
        </div>

        {/* right: today's tomatoes + task + options */}
        <div style={{ width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="doodle-border b-tight" style={{ padding: '14px 16px', background: 'var(--cloud-white)' }}>
            <div style={{ fontSize: 11, color: 'var(--ink-soft)', fontWeight: 700, letterSpacing: 1 }}>今天的番茄</div>
            <div style={{ fontFamily: 'var(--font-hand)', fontSize: 30, color: 'var(--ink)', lineHeight: 1, margin: '4px 0 10px' }}>5 / 8</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} style={{ width: 24, height: 24, opacity: i < 5 ? 1 : 0.35 }}>
                  <svg viewBox="0 0 24 24" width="24" height="24">
                    <circle cx="12" cy="14" r="8"
                      fill={i < 5 ? 'var(--peach)' : 'var(--paper-deep)'}
                      stroke="var(--line)" strokeWidth="1.5" />
                    <path d="M 9 6 Q 12 3 15 6" stroke="var(--line)" strokeWidth="1.5" fill="var(--mint)" />
                  </svg>
                </div>
              ))}
            </div>
          </div>

          <div className="doodle-border b-tight" style={{ padding: '14px 16px', background: 'var(--cloud-white)' }}>
            <div style={{ fontSize: 11, color: 'var(--ink-soft)', fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>本轮任务</div>
            <input defaultValue="完成屏幕时间 App 的 UI" style={{
              width: '100%', border: 'none', borderBottom: '1.5px dashed var(--ink-mute)',
              background: 'transparent', fontSize: 14, padding: '4px 0', outline: 'none',
              color: 'var(--ink)', fontFamily: 'inherit',
            }} />
          </div>

          <div className="doodle-border b-tight" style={{ padding: '14px 16px', background: 'var(--lemon)' }}>
            <div style={{ fontSize: 12, color: 'var(--ink)', fontWeight: 700 }}>专注期间</div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, fontSize: 13 }}>
              <input type="checkbox" defaultChecked /> 屏蔽娱乐类应用
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, fontSize: 13 }}>
              <input type="checkbox" defaultChecked /> 隐藏通知
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, fontSize: 13 }}>
              <input type="checkbox" /> 白噪音陪伴
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
