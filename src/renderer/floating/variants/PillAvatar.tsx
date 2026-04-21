import { CloudMascot } from '../../components/mascots/CloudMascot';
import { ExpandedCard } from '../popovers/ExpandedCard';
import { HoverTooltip } from '../popovers/HoverTooltip';
import { ContextMenu } from '../popovers/ContextMenu';
import type { WidgetState, CurrentApp, CategorySlice } from '../FloatingWidget';
import type { Mood } from '@shared/tokens';

interface PillAvatarProps {
  state: WidgetState;
  set: (s: WidgetState) => void;
  curApp: CurrentApp;
  todayMins: number;
  mood: Mood;
  categoryBreakdown: CategorySlice[];
}

export function PillAvatar({
  state, set, curApp, todayMins, mood, categoryBreakdown,
}: PillAvatarProps) {
  return (
    <div style={{ position: 'relative', width: 240, display: 'inline-block' }}>
      <div
        data-pill-body
        style={{
          width: 72, height: 72,
          borderRadius: '50%',
          background: 'var(--cloud-white)',
          border: '2.5px solid var(--line)',
          boxShadow: '3px 4px 0 var(--line), 0 6px 20px rgba(42,42,60,0.18)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
          cursor: 'grab',
          // @ts-expect-error non-standard CSS property handled by Electron — OS-native window drag
          WebkitAppRegion: 'drag',
        }}
      >
        <CloudMascot size={56} mood={mood} />
        <div style={{
          position: 'absolute', bottom: -4, right: -4,
          background: 'var(--lilac)',
          border: '2px solid var(--line)',
          borderRadius: 12,
          padding: '2px 7px',
          fontSize: 11, fontWeight: 800,
          boxShadow: '1.5px 1.5px 0 var(--line)',
          fontFamily: 'var(--font-sans)',
        }}>
          {Math.floor(todayMins / 60)}h{todayMins % 60}
        </div>
        <div style={{
          position: 'absolute', top: -6, left: -6,
          width: 16, height: 16, borderRadius: '50%',
          background: 'var(--peach)',
          border: '2px solid var(--line)',
          display: state === 'pill' ? 'flex' : 'none',
          alignItems: 'center', justifyContent: 'center',
          fontSize: 9, fontWeight: 800,
        }}>⋮⋮</div>
      </div>

      {state === 'card' && (
        <ExpandedCard
          curApp={curApp}
          todayMins={todayMins}
          mood={mood}
          categoryBreakdown={categoryBreakdown}
          onClose={() => set('pill')}
        />
      )}
      {state === 'tooltip' && <HoverTooltip curApp={curApp} todayMins={todayMins} />}
      {state === 'menu' && <ContextMenu onClose={() => set('pill')} />}
    </div>
  );
}
