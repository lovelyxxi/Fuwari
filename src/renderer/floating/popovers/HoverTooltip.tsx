import { AppIcon } from '../../components/primitives/AppIcon';
import { fmtMins } from '../../utils/fmt';
import type { CurrentApp } from '../FloatingWidget';

interface HoverTooltipProps { curApp: CurrentApp; todayMins: number; }

export function HoverTooltip({ curApp, todayMins }: HoverTooltipProps) {
  return (
    <div
      data-widget-popover
      style={{
        position: 'absolute', bottom: 'calc(100% + 12px)', left: -4,
        background: 'var(--ink)',
        color: 'var(--cloud-white)',
        padding: '8px 12px',
        borderRadius: '10px 12px 10px 12px',
        boxShadow: '3px 3px 0 var(--line)',
        fontSize: 12,
        width: 200,
        pointerEvents: 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
        <AppIcon kind={curApp.kind} size={18} /> {curApp.name}
      </div>
      <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between', opacity: 0.85 }}>
        <span>本次 {fmtMins(curApp.mins)}</span>
        <span>今日 {fmtMins(todayMins)}</span>
      </div>
      <div style={{ marginTop: 6, fontFamily: 'var(--font-hand)', fontSize: 14, color: 'var(--mint)' }}>
        双击打开主窗口
      </div>
    </div>
  );
}
