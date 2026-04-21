export function SunDoodle({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40">
      <circle cx="20" cy="20" r="7" fill="var(--lemon)" stroke="var(--line)" strokeWidth="2" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
        const r = (a * Math.PI) / 180;
        const x1 = 20 + Math.cos(r) * 10;
        const y1 = 20 + Math.sin(r) * 10;
        const x2 = 20 + Math.cos(r) * 15;
        const y2 = 20 + Math.sin(r) * 15;
        return (
          <line key={a} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="var(--line)" strokeWidth="2" strokeLinecap="round" />
        );
      })}
    </svg>
  );
}
