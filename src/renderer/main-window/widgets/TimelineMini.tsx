import { HOURLY } from '../../state/mockData';

interface TimelineMiniProps { nowHour?: number; }

export function TimelineMini({ nowHour = 15 }: TimelineMiniProps) {
  const max = Math.max(...HOURLY);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 52 }}>
      {HOURLY.map((v, i) => {
        const hPx = max === 0 ? 0 : (v / max) * 48 + (v > 0 ? 4 : 0);
        const isNow = i === nowHour;
        return (
          <div key={i} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            height: '100%', justifyContent: 'flex-end', position: 'relative',
          }}>
            <div style={{
              width: '100%', height: hPx,
              background: isNow ? 'var(--lilac)' : v > 30 ? 'var(--mint)' : 'var(--blue)',
              border: v > 0 ? '1.5px solid var(--line)' : 'none',
              borderRadius: '4px 5px 1px 1px',
            }} />
            {isNow && (
              <div style={{ position: 'absolute', top: -14, fontSize: 10,
                color: 'var(--lilac-deep)', fontWeight: 700 }}>
                现在
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
