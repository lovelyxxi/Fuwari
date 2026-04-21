import { CloudMascot } from '../../components/mascots/CloudMascot';
import { AppIcon } from '../../components/primitives/AppIcon';
import { Star } from '../../components/primitives/Star';
import { Chip } from '../../components/primitives/Chip';
import { fmtMins } from '../../utils/fmt';
import { TODAY_APPS, CATEGORIES } from '../../state/mockData';
import { PieDoodle } from '../widgets/PieDoodle';
import { TimelineMini } from '../widgets/TimelineMini';

export function TabToday() {
  const totalMins = TODAY_APPS.reduce((s, a) => s + a.mins, 0);
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;

  return (
    <div style={{ padding: '28px 36px' }}>
      {/* greeting row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
        <CloudMascot size={80} mood="happy" />
        <div>
          <div style={{ fontFamily: 'var(--font-hand)', fontSize: 32, lineHeight: 1, color: 'var(--ink)' }}>下午好呀 ~</div>
          <div style={{ fontSize: 14, color: 'var(--ink-soft)', marginTop: 6 }}>今天已经专注了好一会儿啦，记得歇歇眼睛哦 💧</div>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: 1 }}>TODAY · 周四</div>
          <div style={{ fontFamily: 'var(--font-hand)', fontSize: 26, color: 'var(--ink)' }}>4月21日</div>
        </div>
      </div>

      {/* big number + pie */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 18, marginBottom: 20 }}>
        <div className="doodle-border" style={{ padding: '22px 24px', background: 'var(--cloud-white)' }}>
          <div style={{ fontSize: 12, color: 'var(--ink-soft)', fontWeight: 700, letterSpacing: 1 }}>今日总使用</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 8 }}>
            <span style={{ fontFamily: 'var(--font-hand)', fontSize: 64, lineHeight: 0.9, color: 'var(--ink)' }}>{h}</span>
            <span style={{ fontSize: 16, color: 'var(--ink-soft)', fontWeight: 700, marginRight: 8 }}>小时</span>
            <span style={{ fontFamily: 'var(--font-hand)', fontSize: 48, lineHeight: 0.9, color: 'var(--ink)' }}>{m}</span>
            <span style={{ fontSize: 14, color: 'var(--ink-soft)', fontWeight: 700 }}>分</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
            <Chip bg="var(--mint)">↓ 比昨天少 23 分</Chip>
            <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>做得不错呢～</span>
          </div>
          <div style={{ marginTop: 18 }}>
            <div style={{
              display: 'flex', height: 14, overflow: 'hidden',
              border: '2px solid var(--line)',
              borderRadius: '8px 10px 8px 10px',
            }}>
              {CATEGORIES.map((c, i) => (
                <div key={c.name} style={{ background: c.color, width: `${(c.mins / totalMins) * 100}%`, borderRight: i < CATEGORIES.length - 1 ? '2px solid var(--line)' : 'none' }} />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: 'var(--ink-soft)' }}>
              {CATEGORIES.map((c) => (
                <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 8, height: 8, background: c.color, border: '1.5px solid var(--line)', borderRadius: 2 }} />
                  {c.name} · {fmtMins(c.mins)}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="doodle-border" style={{ padding: 22, background: 'var(--cloud-white)', position: 'relative' }}>
          <div style={{ fontSize: 12, color: 'var(--ink-soft)', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>分类占比</div>
          <PieDoodle size={170} />
          <div style={{ position: 'absolute', right: 12, top: 10, fontFamily: 'var(--font-hand)', fontSize: 16, color: 'var(--lilac-deep)', transform: 'rotate(6deg)' }}>
            ✦ 专注日
          </div>
        </div>
      </div>

      {/* mini timeline */}
      <div className="doodle-border" style={{ padding: '18px 22px', background: 'var(--cloud-white)', marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--ink-soft)', fontWeight: 700, letterSpacing: 1 }}>今日时间线</div>
            <div style={{ fontFamily: 'var(--font-hand)', fontSize: 22, color: 'var(--ink)' }}>一天的节奏</div>
          </div>
          <div style={{ fontSize: 11, color: 'var(--ink-mute)' }}>00 &nbsp;·&nbsp; 06 &nbsp;·&nbsp; 12 &nbsp;·&nbsp; 18 &nbsp;·&nbsp; 24</div>
        </div>
        <TimelineMini />
      </div>

      {/* Top 3 apps */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {TODAY_APPS.slice(0, 3).map((app, i) => (
          <div key={app.name} className="doodle-border b-tight" style={{ padding: '14px 16px', background: 'var(--cloud-white)', display: 'flex', gap: 12, alignItems: 'center', position: 'relative' }}>
            <AppIcon kind={app.kind} size={40} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{app.name}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>{app.cat}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--font-hand)', fontSize: 20, lineHeight: 1, color: 'var(--ink)' }}>{fmtMins(app.mins)}</div>
              <div style={{ fontSize: 10, color: 'var(--ink-mute)', fontWeight: 700, marginTop: 2 }}>TOP {i + 1}</div>
            </div>
            {i === 0 && (
              <div style={{ position: 'absolute', top: -8, right: -6, transform: 'rotate(15deg)' }}>
                <Star size={22} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
