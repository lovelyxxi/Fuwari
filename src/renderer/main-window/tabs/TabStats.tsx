import { CloudMascot } from '../../components/mascots/CloudMascot';
import { Chip } from '../../components/primitives/Chip';
import { fmtMins } from '../../utils/fmt';
import { useWeek } from '../../hooks/useToday';
import { StatCard } from '../widgets/StatCard';

const WEEKDAY_CN = ['日', '一', '二', '三', '四', '五', '六'];

export function TabStats() {
  const week = useWeek();
  const maxMins = Math.max(1, ...week.map((d) => d.totalMins));
  const totalWeek = week.reduce((s, d) => s + d.totalMins, 0);
  const avg = week.length ? Math.round(totalWeek / week.length) : 0;
  const peakDay = week.reduce((p, d) => (d.totalMins > p.totalMins ? d : p), { totalMins: 0, dateMs: Date.now() });
  const todayIdx = week.length - 1;

  return (
    <div style={{ padding: '24px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-hand)', fontSize: 36, lineHeight: 1, color: 'var(--ink)' }}>本周回顾</div>
          <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 4 }}>最近 7 天</div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="tab-doodle active">周</button>
          <button className="tab-doodle">月</button>
          <button className="tab-doodle">年</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
        <div className="doodle-border" style={{ padding: '22px 24px', background: 'var(--cloud-white)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 200 }}>
            {week.map((d, i) => {
              const hPx = (d.totalMins / maxMins) * 180 + 10;
              const isToday = i === todayIdx;
              const weekday = WEEKDAY_CN[new Date(d.dateMs).getDay()];
              return (
                <div key={d.dateMs} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ fontSize: 10, color: 'var(--ink-mute)', marginBottom: 4 }}>{fmtMins(d.totalMins)}</div>
                  <div className="bar-doodle" style={{
                    width: '100%', height: hPx,
                    background: isToday ? 'var(--lilac)' : 'var(--mint)',
                  }} />
                  <div style={{
                    marginTop: 8, fontSize: 13, fontFamily: 'var(--font-hand)',
                    color: isToday ? 'var(--lilac-deep)' : 'var(--ink-soft)',
                    fontWeight: isToday ? 700 : 400,
                  }}>{weekday}</div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--ink-soft)' }}>
            <Chip bg="var(--lemon)">日均 {fmtMins(avg)}</Chip>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <StatCard label="总时长" big={fmtMins(totalWeek)} note="最近 7 天" bg="var(--blue)" />
          <StatCard label="最高一天" big={WEEKDAY_CN[new Date(peakDay.dateMs).getDay()]} note={fmtMins(peakDay.totalMins)} bg="var(--lilac)" />
          <StatCard label="专注番茄" big="—" note="稍后接入" bg="var(--peach)" />
        </div>
      </div>

      <div className="doodle-border" style={{
        marginTop: 18, padding: '16px 20px', background: 'var(--mint)',
        display: 'flex', gap: 16, alignItems: 'center',
      }}>
        <CloudMascot size={60} mood="happy" />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-hand)', fontSize: 24, color: 'var(--ink)' }}>一周辛苦啦 🌿</div>
          <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 2 }}>云云一直在陪着你，慢慢记录～</div>
        </div>
      </div>
    </div>
  );
}
