import { AppIcon } from '../../components/primitives/AppIcon';
import { CloudMascot } from '../../components/mascots/CloudMascot';
import { DoodleButton } from '../../components/primitives/DoodleButton';
import { fmtMins } from '../../utils/fmt';
import { CATEGORIES } from '../../state/mockData';
import type { Mood } from '@shared/tokens';
import type { CurrentApp } from '../FloatingWidget';

interface ExpandedCardProps {
  curApp: CurrentApp;
  todayMins: number;
  mood: Mood;
  onClose: () => void;
}

export function ExpandedCard({ curApp, todayMins, mood, onClose }: ExpandedCardProps) {
  return (
    <div
      className="doodle-border"
      style={{
        position: 'absolute',
        bottom: 'calc(100% + 12px)',
        left: -6,
        width: 256,
        padding: '14px 16px',
        background: 'var(--cloud-white)',
        boxShadow: '4px 5px 0 var(--line), 0 10px 30px rgba(42,42,60,0.22)',
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
        <span className="chip" style={{ background: 'var(--mint)' }}>↓ 比昨天少</span>
      </div>

      {/* Category strip */}
      <div
        style={{
          display: 'flex',
          height: 8,
          border: '1.5px solid var(--line)',
          borderRadius: 4,
          overflow: 'hidden',
          marginTop: 10,
        }}
      >
        {CATEGORIES.map((c, i) => (
          <div
            key={c.name}
            style={{
              background: c.color,
              width: `${(c.mins / 524) * 100}%`,
              borderRight: i < CATEGORIES.length - 1 ? '1.5px solid var(--line)' : 'none',
            }}
          />
        ))}
      </div>

      {/* 3-button row */}
      <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
        <DoodleButton variant="primary" style={{ flex: 1, padding: '6px 8px', fontSize: 12 }}>
          🍅 专注
        </DoodleButton>
        <DoodleButton variant="mint" style={{ flex: 1, padding: '6px 8px', fontSize: 12 }}>
          ⤢ 打开
        </DoodleButton>
        <DoodleButton style={{ padding: '6px 10px', fontSize: 12 }}>⏸</DoodleButton>
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
