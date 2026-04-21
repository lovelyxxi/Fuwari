import { AppIcon } from '../../components/primitives/AppIcon';
import { CloudMascot } from '../../components/mascots/CloudMascot';
import { DoodleButton } from '../../components/primitives/DoodleButton';
import { fmtMins } from '../../utils/fmt';
import { useFocus } from '../../hooks/useFocus';
import type { Mood } from '@shared/tokens';
import type { CurrentApp, CategorySlice } from '../FloatingWidget';

interface ExpandedCardProps {
  curApp: CurrentApp;
  todayMins: number;
  mood: Mood;
  categoryBreakdown: CategorySlice[];
  onClose: () => void;
}

export function ExpandedCard({ curApp, todayMins, mood, categoryBreakdown, onClose }: ExpandedCardProps) {
  const focus = useFocus();
  const focusRunning = focus?.running ?? false;
  const focusMM = focus ? String(Math.floor(focus.remainingSecs / 60)).padStart(2, '0') : '25';
  const focusSS = focus ? String(focus.remainingSecs % 60).padStart(2, '0') : '00';
  const focusPartial = focus ? focus.remainingSecs < focus.durationSecs && focus.remainingSecs > 0 : false;

  return (
    <div
      data-widget-popover
      className="doodle-border"
      style={{
        position: 'absolute',
        bottom: 'calc(100% + 12px)',
        left: -6,
        width: 256,
        padding: '14px 16px',
        background: 'var(--cloud-white)',
        boxShadow: '4px 5px 0 var(--line), 0 10px 30px rgba(42,42,60,0.22)',
        // @ts-expect-error non-standard CSS property handled by Electron
        WebkitAppRegion: 'no-drag',
      }}
    >
      {/* Inverted-triangle tail pointing down */}
      <svg
        style={{ position: 'absolute', bottom: -14, left: 24, width: 18, height: 16 }}
        viewBox="0 0 18 16"
      >
        <path
          d="M 1 1 L 9 14 L 17 1 Z"
          fill="var(--cloud-white)"
          stroke="var(--line)"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* 3px cloud-white line masks the triangle's top stroke against the card border */}
        <line x1="2" y1="1" x2="17" y2="1" stroke="var(--cloud-white)" strokeWidth="3" />
      </svg>

      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 8,
          right: 10,
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          fontSize: 16,
          color: 'var(--ink-soft)',
          lineHeight: 1,
        }}
      >
        ×
      </button>

      {/* "正在使用" label */}
      <div style={{ fontSize: 10, color: 'var(--ink-mute)', fontWeight: 700, letterSpacing: 1 }}>
        正在使用
      </div>

      {/* Current-app row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
        <AppIcon kind={curApp.kind} size={36} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--ink)' }}>{curApp.name}</div>
          <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>已打开 {fmtMins(curApp.mins)}</div>
        </div>
        <CloudMascot size={40} mood={mood} />
      </div>

      {/* Wavy divider */}
      <div className="hr-wavy" style={{ margin: '12px -4px 10px' }} />

      {/* Today total row */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
        <div>
          <div style={{ fontSize: 10, color: 'var(--ink-mute)', fontWeight: 700, letterSpacing: 1 }}>
            今日总计
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 2 }}>
            <span style={{ fontFamily: 'var(--font-hand)', fontSize: 32, lineHeight: 0.9, color: 'var(--ink)' }}>
              {Math.floor(todayMins / 60)}
            </span>
            <span style={{ fontSize: 11, color: 'var(--ink-soft)', fontWeight: 700 }}>h</span>
            <span style={{ fontFamily: 'var(--font-hand)', fontSize: 26, lineHeight: 0.9, color: 'var(--ink)' }}>
              {todayMins % 60}
            </span>
            <span style={{ fontSize: 11, color: 'var(--ink-soft)', fontWeight: 700 }}>m</span>
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <span className="chip" style={{ background: 'var(--mint)' }}>专注记录中</span>
      </div>

      {/* Category strip */}
      {categoryBreakdown.length > 0 && (
        <div style={{
          display: 'flex',
          height: 8,
          borderRadius: 4,
          overflow: 'hidden',
          border: '1.5px solid var(--line)',
          marginTop: 10,
        }}>
          {categoryBreakdown.map((c, i) => {
            const total = categoryBreakdown.reduce((s, x) => s + x.mins, 0) || 1;
            return (
              <div
                key={c.name}
                style={{
                  background: c.color,
                  width: `${(c.mins / total) * 100}%`,
                  borderRight: i < categoryBreakdown.length - 1 ? '1.5px solid var(--line)' : 'none',
                }}
              />
            );
          })}
        </div>
      )}

      {/* 3-button row */}
      <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
        <DoodleButton
          variant="primary"
          onClick={() => {
            if (focusRunning) void window.api.focus.pause();
            else void window.api.focus.start(25);
          }}
          style={{ flex: 1, padding: '6px 8px', fontSize: 12, fontVariantNumeric: 'tabular-nums' }}
        >
          {focusRunning ? `⏸ ${focusMM}:${focusSS}` : '🍅 专注'}
        </DoodleButton>
        <DoodleButton
          variant="mint"
          onClick={() => window.api.floating.openMain()}
          style={{ flex: 1, padding: '6px 8px', fontSize: 12 }}
        >
          ⤢ 打开
        </DoodleButton>
        <DoodleButton
          onClick={() => void window.api.focus.reset()}
          disabled={!focusRunning && !focusPartial}
          style={{
            padding: '6px 10px',
            fontSize: 12,
            opacity: !focusRunning && !focusPartial ? 0.4 : 1,
            cursor: !focusRunning && !focusPartial ? 'default' : 'pointer',
          }}
          title="重置"
        >
          ↺
        </DoodleButton>
      </div>

      {/* Lemon tip footer */}
      <div
        style={{
          marginTop: 10,
          padding: '8px 10px',
          background: 'var(--lemon)',
          borderRadius: 8,
          fontSize: 11,
          color: 'var(--ink)',
          fontFamily: 'var(--font-hand-cn)',
        }}
      >
        💧 记得歇歇眼睛哦
      </div>
    </div>
  );
}
