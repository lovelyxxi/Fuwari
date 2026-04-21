import { useState, type MouseEventHandler } from 'react';

interface WinBtnProps {
  kind: 'min' | 'max' | 'close';
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

const STYLES: Record<WinBtnProps['kind'], { bg: string; glyph: string; label: string }> = {
  close: { bg: 'var(--peach)', glyph: '×', label: '关闭' },
  min:   { bg: 'var(--lemon)', glyph: '−', label: '最小化' },
  max:   { bg: 'var(--mint)',  glyph: '+', label: '最大化' },
};

export function WinBtn({ kind, onClick }: WinBtnProps) {
  const [hover, setHover] = useState(false);
  const s = STYLES[kind];
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-label={s.label}
      title={s.label}
      style={{
        width: 14,
        height: 14,
        padding: 0,
        border: '1.5px solid var(--line)',
        borderRadius: '50% 48% 52% 50% / 48% 52% 50% 48%',
        background: s.bg,
        color: 'var(--ink)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 10,
        fontWeight: 800,
        lineHeight: 1,
        boxShadow: '1px 1px 0 rgba(42,42,60,0.25)',
      }}
    >
      <span
        style={{
          opacity: hover ? 1 : 0,
          transition: 'opacity .12s',
          transform: 'translateY(-0.5px)',
        }}
      >
        {s.glyph}
      </span>
    </button>
  );
}
