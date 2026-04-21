import { useState, useMemo } from 'react';
import { AppIcon } from '../../components/primitives/AppIcon';
import { Chip } from '../../components/primitives/Chip';
import { DoodleButton } from '../../components/primitives/DoodleButton';
import { fmtMins } from '../../utils/fmt';
import { iconKindFor } from '../../utils/iconKind';
import { useToday } from '../../hooks/useToday';
import { CATEGORY_COLORS, type Category } from '@shared/tokens';

export function TabApps() {
  const today = useToday();
  const [filter, setFilter] = useState<string>('全部');

  const apps = today?.byApp ?? [];
  const cats = useMemo(() => ['全部', ...Array.from(new Set(apps.map((a) => a.category)))], [apps]);
  const list = filter === '全部' ? apps : apps.filter((a) => a.category === filter);
  const max = Math.max(1, ...list.map((a) => a.mins));

  return (
    <div style={{ padding: '24px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-hand)', fontSize: 36, lineHeight: 1, color: 'var(--ink)' }}>应用排行榜</div>
          <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 4 }}>看看谁在偷偷抢占你的今天～</div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {cats.map((c) => (
            <button key={c} className={`tab-doodle ${filter === c ? 'active' : ''}`} onClick={() => setFilter(c)}>{c}</button>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-mute)', fontFamily: 'var(--font-hand)', fontSize: 22 }}>
          还没有记录呢～用着用着就会出现啦
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {list.map((app, i) => {
            const color = CATEGORY_COLORS[app.category as Category] ?? 'var(--lemon)';
            return (
              <div key={app.appExe} className="doodle-border b-tight"
                style={{ padding: '14px 18px', background: 'var(--cloud-white)',
                  display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ fontFamily: 'var(--font-hand)', fontSize: 28, width: 36,
                  color: i < 3 ? 'var(--lilac-deep)' : 'var(--ink-mute)', textAlign: 'center' }}>
                  {i + 1}
                </div>
                <AppIcon kind={iconKindFor(app.appName, app.appExe)} size={44} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>{app.appName}</div>
                    <Chip bg={color}>{app.category}</Chip>
                  </div>
                  <div style={{ height: 10, background: 'var(--paper-deep)', borderRadius: 5, overflow: 'hidden', border: '1.5px solid var(--line)' }}>
                    <div style={{ height: '100%', width: `${(app.mins / max) * 100}%`, background: color, borderRight: '1.5px solid var(--line)' }} />
                  </div>
                </div>
                <div style={{ textAlign: 'right', minWidth: 70 }}>
                  <div style={{ fontFamily: 'var(--font-hand)', fontSize: 24, lineHeight: 1, color: 'var(--ink)' }}>{fmtMins(app.mins)}</div>
                  <div style={{ fontSize: 10, color: 'var(--ink-mute)', marginTop: 2 }}>
                    {Math.round((app.mins / 60) * 10) / 10}h
                  </div>
                </div>
                <DoodleButton style={{ padding: '4px 10px', fontSize: 11, boxShadow: '2px 2px 0 var(--line)' }}>⏱ 限额</DoodleButton>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
