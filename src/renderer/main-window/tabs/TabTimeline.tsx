import { HighlightCard } from '../widgets/HighlightCard';
import { useToday } from '../../hooks/useToday';

export function TabTimeline() {
  const today = useToday();
  const hourly = today?.hourly ?? new Array(24).fill(0);
  const max = Math.max(1, ...hourly);
  const nowHour = new Date().getHours();

  // find peak hour for highlight
  let peakIdx = 0, peakVal = 0;
  hourly.forEach((v, i) => { if (v > peakVal) { peakVal = v; peakIdx = i; } });
  const peakLabel = `${String(peakIdx).padStart(2, '0')}:00 - ${String(peakIdx + 1).padStart(2, '0')}:00`;

  return (
    <div style={{ padding: '24px 32px' }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: 'var(--font-hand)', fontSize: 36, lineHeight: 1, color: 'var(--ink)' }}>今天的时光小径</div>
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
          {hourly.map((v, i) => {
            const hPx = (v / max) * 190 + (v > 0 ? 4 : 0);
            const isNow = i === nowHour;
            return (
              <div key={i} style={{ flex: 1, display: 'flex', alignItems: 'flex-end', height: '100%', position: 'relative' }}>
                <div style={{
                  width: '100%', height: hPx,
                  background: isNow ? 'var(--lilac)' : v > 40 ? 'var(--mint)' : v > 15 ? 'var(--blue)' : 'var(--peach)',
                  border: v > 0 ? '1.8px solid var(--line)' : 'none',
                  borderRadius: '5px 7px 1px 1px',
                }} />
                {isNow && v > 0 && (
                  <div style={{ position: 'absolute', bottom: hPx + 8, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap' }}>
                    <div className="doodle-border b-tight" style={{ padding: '4px 8px', background: 'var(--lemon)', fontSize: 10, fontWeight: 700 }}>
                      ⬇ 现在
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--ink-mute)', marginTop: 8, paddingTop: 8, borderTop: '1.5px dashed var(--ink-mute)' }}>
          {[0, 3, 6, 9, 12, 15, 18, 21, 24].map((h) => <span key={h}>{String(h).padStart(2, '0')}:00</span>)}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginTop: 18 }}>
        <HighlightCard icon="☀" title="最专注的时段" value={peakVal > 0 ? peakLabel : '--'} note={peakVal > 0 ? `这一小时 ${peakVal} 分钟` : '还没数据啦'} />
        <HighlightCard icon="☕" title="记录时长" value={`${hourly.filter((v) => v > 0).length} 小时`} note="出现活动的小时数" />
        <HighlightCard icon="💧" title="今日活跃" value={`${today?.byApp.length ?? 0} 个应用`} note="用过的不同应用" />
      </div>
    </div>
  );
}
