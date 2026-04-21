export interface PieSlice { name: string; mins: number; color: string; }

interface PieDoodleProps {
  size?: number;
  slices: PieSlice[];
}

export function PieDoodle({ size = 160, slices }: PieDoodleProps) {
  const total = slices.reduce((s, c) => s + c.mins, 0) || 1;
  let acc = 0;
  const r = size / 2 - 14;
  const cx = size / 2, cy = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices.map((c) => {
        const start = (acc / total) * Math.PI * 2 - Math.PI / 2;
        acc += c.mins;
        const end = (acc / total) * Math.PI * 2 - Math.PI / 2;
        const x1 = cx + Math.cos(start) * r, y1 = cy + Math.sin(start) * r;
        const x2 = cx + Math.cos(end) * r,   y2 = cy + Math.sin(end) * r;
        const large = end - start > Math.PI ? 1 : 0;
        return (
          <path
            key={c.name}
            d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`}
            fill={c.color} stroke="var(--line)" strokeWidth="2" strokeLinejoin="round"
          />
        );
      })}
      <circle cx={cx} cy={cy} r={18} fill="var(--cloud-white)" stroke="var(--line)" strokeWidth="2" />
      <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle"
        fontFamily="Caveat" fontSize="16" fill="var(--ink)">
        {Math.round(total / 60)}h
      </text>
    </svg>
  );
}
