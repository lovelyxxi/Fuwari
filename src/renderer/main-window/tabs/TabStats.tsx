import { CloudMascot } from '../../components/mascots/CloudMascot';
import { Chip } from '../../components/primitives/Chip';
import { fmtMins } from '../../utils/fmt';
import { WEEKLY } from '../../state/mockData';
import { StatCard } from '../widgets/StatCard';

export function TabStats() {
  const max = Math.max(...WEEKLY.map((d) => d.mins));
  const avg = Math.round(WEEKLY.reduce((s, d) => s + d.mins, 0) / 7);
  return (
    <div style={{ padding: '24px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-hand)', fontSize: 36, lineHeight: 1, color: 'var(--ink)' }}>本周回顾</div>
          <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 4 }}>4月15日 - 4月21日</div>
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
            {WEEKLY.map((d, i) => {
              const h = (d.mins / max) * 180 + 10;
              const isToday = i === 3;
              return (
                <div key={d.d} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ fontSize: 10, color: 'var(--ink-mute)', marginBottom: 4 }}>{fmtMins(d.mins)}</div>
                  <div className="bar-doodle" style={{
                    width: '100%', height: h,
                    background: isToday ? 'var(--lilac)' : 'var(--mint)',
                  }} />
                  <div style={{
                    marginTop: 8, fontSize: 13, fontFamily: 'var(--font-hand)',
                    color: isToday ? 'var(--lilac-deep)' : 'var(--ink-soft)',
                    fontWeight: isToday ? 700 : 400,
                  }}>
                    {d.d}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--ink-soft)' }}>
            <Chip bg="var(--lemon)">日均 {fmtMins(avg)}</Chip>
            <span>比上周 ↑ 8%</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <StatCard label="总时长" big="42h" note="本周一共" bg="var(--blue)" />
          <StatCard label="最高一天" big="周四" note="8h 48m" bg="var(--lilac)" />
          <StatCard label="专注番茄" big="23 🍅" note="打败了 78% 的用户" bg="var(--peach)" />
        </div>
      </div>

      <div className="doodle-border" style={{
        marginTop: 18, padding: '16px 20px', background: 'var(--mint)',
        display: 'flex', gap: 16, alignItems: 'center',
      }}>
        <CloudMascot size={60} mood="happy" />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-hand)', fontSize: 24, color: 'var(--ink)' }}>这周辛苦啦 🌿</div>
          <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 2 }}>
            周六的休息时间最充足，周四最专注。保持这个节奏就很好哦～
          </div>
        </div>
      </div>
    </div>
  );
}
