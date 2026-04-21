interface StatCardProps { label: string; big: string; note: string; bg: string; }

export function StatCard({ label, big, note, bg }: StatCardProps) {
  return (
    <div className="doodle-border b-tight" style={{
      padding: '14px 18px', background: bg, flex: 1,
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
    }}>
      <div style={{ fontSize: 11, color: 'var(--ink-soft)', fontWeight: 700, letterSpacing: 1 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-hand)', fontSize: 30, color: 'var(--ink)', lineHeight: 1, marginTop: 2 }}>{big}</div>
      <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 2 }}>{note}</div>
    </div>
  );
}
