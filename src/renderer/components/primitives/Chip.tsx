import type { CSSProperties, ReactNode } from 'react';

interface ChipProps { children: ReactNode; bg?: string; style?: CSSProperties; }
export function Chip({ children, bg, style }: ChipProps) {
  return (
    <span className="chip" style={{ background: bg ?? 'var(--cloud-white)', ...style }}>
      {children}
    </span>
  );
}
