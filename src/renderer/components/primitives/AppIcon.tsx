export type AppIconKind =
  | 'code' | 'design' | 'chat' | 'doc' | 'video' | 'music'
  | 'browse' | 'mail' | 'game' | 'shop' | 'term' | 'draw';

interface AppIconProps { kind: AppIconKind; size?: number; }

export function AppIcon({ kind, size = 32 }: AppIconProps) {
  const icons: Record<AppIconKind, { bg: string; glyph: string; fg: string }> = {
    code:   { bg: '#2A2A3C', glyph: '</>', fg: '#B8E0D2' },
    design: { bg: '#C8B6FF', glyph: '✎',  fg: '#2A2A3C' },
    chat:   { bg: '#A4C8F0', glyph: '💬', fg: '#2A2A3C' },
    doc:    { bg: '#FFE5A8', glyph: '📄', fg: '#2A2A3C' },
    video:  { bg: '#FFCFB8', glyph: '▶',  fg: '#2A2A3C' },
    music:  { bg: '#B8E0D2', glyph: '♪',  fg: '#2A2A3C' },
    browse: { bg: '#A4C8F0', glyph: '🌐', fg: '#2A2A3C' },
    mail:   { bg: '#C8B6FF', glyph: '✉',  fg: '#2A2A3C' },
    game:   { bg: '#FFCFB8', glyph: '♥',  fg: '#2A2A3C' },
    shop:   { bg: '#FFE5A8', glyph: '🛍', fg: '#2A2A3C' },
    term:   { bg: '#2A2A3C', glyph: '_',  fg: '#B8E0D2' },
    draw:   { bg: '#B8E0D2', glyph: '✏',  fg: '#2A2A3C' },
  };
  const i = icons[kind];
  return (
    <div
      style={{
        width: size,
        height: size,
        background: i.bg,
        color: i.fg,
        border: '2px solid var(--line)',
        borderRadius: `${size * 0.28}px ${size * 0.32}px ${size * 0.28}px ${size * 0.32}px / ${size * 0.32}px ${size * 0.28}px ${size * 0.32}px ${size * 0.28}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.5,
        fontWeight: 700,
        flexShrink: 0,
        lineHeight: 1,
      }}
    >
      {i.glyph}
    </div>
  );
}
