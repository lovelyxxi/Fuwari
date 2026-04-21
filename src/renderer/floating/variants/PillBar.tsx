import { CloudMascot } from '../../components/mascots/CloudMascot';
import { ExpandedCard } from '../popovers/ExpandedCard';
import { HoverTooltip } from '../popovers/HoverTooltip';
import { ContextMenu } from '../popovers/ContextMenu';
import { fmtMins } from '../../utils/fmt';
import type { WidgetState, CurrentApp } from '../FloatingWidget';
import type { Mood } from '@shared/tokens';

interface PillBarProps {
  state: WidgetState;
  set: (s: WidgetState) => void;
  curApp: CurrentApp;
  todayMins: number;
  mood: Mood;
}

export function PillBar({ state, set, curApp, todayMins, mood }: PillBarProps) {
  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    window.api.floating.startDrag(e.clientX, e.clientY);
    const stop = () => {
      window.api.floating.stopDrag();
      window.removeEventListener('mouseup', stop);
    };
    window.addEventListener('mouseup', stop);
  };

  const onDoubleClick = () => window.api.floating.openMain();

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div
        onClick={() => set(state === 'card' ? 'pill' : 'card')}
        onMouseDown={onMouseDown}
        onDoubleClick={onDoubleClick}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '6px 14px 6px 6px',
          background: 'var(--cloud-white)',
          border: '2.5px solid var(--line)',
          borderRadius: 36,
          boxShadow: '3px 4px 0 var(--line), 0 6px 20px rgba(42,42,60,0.18)',
          cursor: 'pointer',
          width: 'fit-content',
        }}
      >
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: 'var(--paper-deep)',
          border: '2px solid var(--line)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <CloudMascot size={32} mood={mood} wobble={false} />
        </div>
        <div>
          <div style={{ fontSize: 10, color: 'var(--ink-mute)', fontWeight: 700, letterSpacing: 1 }}>
            正在 · {curApp.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontFamily: 'var(--font-hand)', fontSize: 20, lineHeight: 1, color: 'var(--ink)' }}>
              {fmtMins(curApp.mins)}
            </span>
            <span style={{ fontSize: 10, color: 'var(--ink-mute)' }}>· 今日 {fmtMins(todayMins)}</span>
          </div>
        </div>
      </div>

      {state === 'card' && <ExpandedCard curApp={curApp} todayMins={todayMins} mood={mood} onClose={() => set('pill')} />}
      {state === 'tooltip' && <HoverTooltip curApp={curApp} todayMins={todayMins} />}
      {state === 'menu' && <ContextMenu onClose={() => set('pill')} />}
    </div>
  );
}
