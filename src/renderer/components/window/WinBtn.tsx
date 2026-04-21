import { useState, type MouseEventHandler } from 'react';

interface WinBtnProps {
  kind: 'min' | 'max' | 'close';
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

const ICONS = {
  min:   <line x1="2" y1="6" x2="10" y2="6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />,
  max:   <rect x="2" y="2" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="1.3" />,
  close: (
    <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <line x1="2" y1="2" x2="10" y2="10" />
      <line x1="10" y1="2" x2="2" y2="10" />
    </g>
  ),
};

export function WinBtn({ kind, onClick }: WinBtnProps) {
  const [hover, setHover] = useState(false);
  const bg = hover ? (kind === 'close' ? 'var(--peach)' : 'var(--paper-deep)') : 'transparent';
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: 46, height: 36, border: 'none', background: bg,
        borderLeft: '1.5px solid var(--line)', color: 'var(--ink)', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <svg width="12" height="12" viewBox="0 0 12 12">{ICONS[kind]}</svg>
    </button>
  );
}
