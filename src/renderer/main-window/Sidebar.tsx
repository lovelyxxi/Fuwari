import { CloudMascot } from '../components/mascots/CloudMascot';
import { JellyMascot } from '../components/mascots/JellyMascot';
import type { MascotKind } from '@shared/tokens';

export type TabKey = 'today' | 'apps' | 'timeline' | 'stats' | 'focus' | 'settings';

const NAV_ITEMS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'today',    label: '今日',   icon: '☁' },
  { key: 'apps',     label: '排行榜', icon: '★' },
  { key: 'timeline', label: '时间线', icon: '∿' },
  { key: 'stats',    label: '周月',   icon: '▦' },
  { key: 'focus',    label: '专注',   icon: '🍅' },
  { key: 'settings', label: '设置',   icon: '⚙' },
];

interface SidebarProps {
  active: TabKey;
  onChange: (k: TabKey) => void;
  mascotKind?: MascotKind;
}

export function Sidebar({ active, onChange, mascotKind = 'cloud' }: SidebarProps) {
  const Mascot = mascotKind === 'jelly' ? JellyMascot : CloudMascot;
  return (
    <div style={{
      width: 88, flexShrink: 0, background: 'var(--paper-deep)',
      borderRight: '2px solid var(--line)', padding: '14px 8px',
      display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      {NAV_ITEMS.map((n) => {
        const isActive = active === n.key;
        return (
          <button
            key={n.key}
            onClick={() => onChange(n.key)}
            style={{
              border: isActive ? '2px solid var(--line)' : '2px solid transparent',
              background: isActive ? 'var(--cloud-white)' : 'transparent',
              borderRadius: '12px 14px 12px 14px',
              padding: '10px 0', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              boxShadow: isActive ? '2px 2px 0 var(--line)' : 'none',
              color: 'var(--ink)',
            }}
          >
            <span style={{ fontSize: 20, lineHeight: 1 }}>{n.icon}</span>
            <span style={{ fontSize: 11, fontWeight: 700 }}>{n.label}</span>
          </button>
        );
      })}
      <div style={{ flex: 1 }} />
      <div style={{ textAlign: 'center', paddingTop: 10, borderTop: '1.5px dashed var(--ink-mute)' }}>
        <Mascot size={42} mood="calm" />
        <div style={{ fontFamily: 'var(--font-hand)', fontSize: 14, color: 'var(--ink-soft)', marginTop: 2 }}>v1.0</div>
      </div>
    </div>
  );
}
