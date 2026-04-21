import { JellyMascot } from '../../components/mascots/JellyMascot';
import { ExpandedCard } from '../popovers/ExpandedCard';
import { HoverTooltip } from '../popovers/HoverTooltip';
import { ContextMenu } from '../popovers/ContextMenu';
import { fmtMins } from '../../utils/fmt';
import type { WidgetState, CurrentApp } from '../FloatingWidget';
import type { Mood } from '@shared/tokens';

interface StandingMascotProps {
  state: WidgetState;
  set: (s: WidgetState) => void;
  curApp: CurrentApp;
  todayMins: number;
  mood: Mood;
}

export function StandingMascot({ state, set, curApp, todayMins, mood }: StandingMascotProps) {
  return (
    <div style={{ position: 'relative', display: 'inline-block', width: 120, height: 120 }}>
      <div style={{
        position: 'absolute', bottom: 0, left: '50%',
        transform: 'translateX(-50%)',
        width: 64, height: 8,
        background: 'rgba(42,42,60,0.15)',
        borderRadius: '50%', filter: 'blur(2px)',
      }} />
      <div
        style={{ position: 'absolute', top: 0, left: 0, width: 120, cursor: 'pointer' }}
        onClick={() => set(state === 'card' ? 'pill' : 'card')}
      >
        <JellyMascot size={110} mood={mood} />
      </div>
      <div style={{
        position: 'absolute', top: -6, right: -14,
        background: 'var(--cloud-white)',
        border: '2px solid var(--line)',
        borderRadius: '14px 16px 14px 4px',
        padding: '4px 9px',
        fontSize: 11, fontWeight: 700,
        boxShadow: '2px 2px 0 var(--line)',
        whiteSpace: 'nowrap',
      }}>
        {fmtMins(curApp.mins)} @ {curApp.name}
      </div>

      {state === 'card' && <ExpandedCard curApp={curApp} todayMins={todayMins} mood={mood} onClose={() => set('pill')} />}
      {state === 'tooltip' && <HoverTooltip curApp={curApp} todayMins={todayMins} />}
      {state === 'menu' && <ContextMenu onClose={() => set('pill')} />}
    </div>
  );
}
