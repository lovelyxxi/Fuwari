interface HighlightCardProps { icon: string; title: string; value: string; note: string; }

export function HighlightCard({ icon, title, value, note }: HighlightCardProps) {
  return (
    <div className="doodle-border b-tight" style={{ padding: '14px 16px', background: 'var(--cloud-white)' }}>
      <div style={{ fontSize: 22 }}>{icon}</div>
      <div style={{ fontSize: 11, color: 'var(--ink-soft)', fontWeight: 700, marginTop: 4 }}>{title}</div>
      <div style={{ fontFamily: 'var(--font-hand)', fontSize: 22, color: 'var(--ink)', marginTop: 2 }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--ink-mute)', marginTop: 2 }}>{note}</div>
    </div>
  );
}
