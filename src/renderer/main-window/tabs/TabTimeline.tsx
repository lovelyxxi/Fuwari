import { HOURLY } from '../../state/mockData';
import { HighlightCard } from '../widgets/HighlightCard';

export function TabTimeline() {
  const max = Math.max(...HOURLY);
  return (
    <div style={{ padding: '24px 32px' }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: 'var(--font-hand)', fontSize: 36, lineHeight: 1, color: 'var(--ink)' }}>
          今天的时光小径
        </div>
        <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 4 }}>一天是怎么过去的呢？</div>
      </div>

      <div className="doodle-border" style={{ padding: '28px 24px 18px', background: 'var(--cloud-white)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 200, position: 'relative' }}>
          {[0.25, 0.5, 0.75].map((p) => (
            <div key={p} style={{
              position: 'absolute', left: 0, right: 0, bottom: `${p * 100}%`,
              borderTop: '1px dashed var(--ink-mute)',
            }} />
          ))}
          {HOURLY.map((v, i) => {
            const hPx = max === 0 ? 0 : (v / max) * 190 + (v > 0 ? 4 : 0);
            const isNow = i === 15;
            return (
              <div key={i} style={{
                flex: 1, display: 'flex', alignItems: 'flex-end', height: '100%', position: 'relative',
              }}>
                <div style={{
                  width: '100%', height: hPx,
                  background: isNow ? 'var(--lilac)' : v > 40 ? 'var(--mint)' : v > 15 ? 'var(--blue)' : 'var(--peach)',
                  border: v > 0 ? '1.8px solid var(--line)' : 'none',
                  borderRadius: '5px 7px 1px 1px',
                }} />
                {isNow && (
                  <div style={{
                    position: 'absolute', bottom: hPx + 8, left: '50%',
                    transform: 'translateX(-50%)', whiteSpace: 'nowrap',
                  }}>
                    <div className="doodle-border b-tight" style={{
                      padding: '4px 8px', background: 'var(--lemon)', fontSize: 10, fontWeight: 700,
                    }}>
                      ⬇ 现在 · Figma
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div style={{
          display: 'flex', justifyContent: 'space-between', fontSize: 11,
          color: 'var(--ink-mute)', marginTop: 8, paddingTop: 8,
          borderTop: '1.5px dashed var(--ink-mute)',
        }}>
          {[0, 3, 6, 9, 12, 15, 18, 21, 24].map((h) => (
            <span key={h}>{String(h).padStart(2, '0')}:00</span>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginTop: 18 }}>
        <HighlightCard icon="☀" title="最专注的时段" value="10:00 - 11:30" note="写了 127 行代码" />
        <HighlightCard icon="☕" title="最长的小憩" value="13:15 - 14:00" note="好好吃了午饭呢" />
        <HighlightCard icon="💧" title="切换应用" value="48 次" note="比昨天少一点啦" />
      </div>
    </div>
  );
}
