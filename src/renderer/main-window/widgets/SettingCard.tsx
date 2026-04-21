interface SettingCardProps {
  title: string;
  desc: string;
  value: boolean;
  onChange: (v: boolean) => void;
}

export function SettingCard({ title, desc, value, onChange }: SettingCardProps) {
  return (
    <div className="doodle-border b-tight" style={{
      padding: '14px 18px', background: 'var(--cloud-white)',
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 2 }}>{desc}</div>
      </div>
      <button
        onClick={() => onChange(!value)}
        style={{
          width: 44, height: 24, border: '2px solid var(--line)', borderRadius: 14,
          background: value ? 'var(--mint)' : 'var(--paper-deep)', padding: 0,
          cursor: 'pointer', position: 'relative', flexShrink: 0,
        }}
      >
        <div style={{
          width: 16, height: 16, borderRadius: '50%', background: 'var(--cloud-white)',
          border: '1.5px solid var(--line)', position: 'absolute', top: 2,
          left: value ? 22 : 2, transition: 'left .15s',
        }} />
      </button>
    </div>
  );
}
