import { useMemo } from 'react';

interface HandLineProps { w?: number; color?: string; thickness?: number; }
export function HandLine({ w = 100, color = 'var(--ink)', thickness = 2 }: HandLineProps) {
  const midY = useMemo(() => (Math.random() > 0.5 ? 1 : 5), []);
  return (
    <svg width={w} height={6} viewBox={`0 0 ${w} 6`} style={{ display: 'block' }}>
      <path
        d={`M 2 3 Q ${w * 0.25} ${midY} ${w * 0.5} 3 T ${w - 2} 3`}
        fill="none"
        stroke={color}
        strokeWidth={thickness}
        strokeLinecap="round"
      />
    </svg>
  );
}
