interface MenuItem { icon: string; label: string; shortcut?: string; warn?: boolean; }
type MenuEntry = MenuItem | null;

interface ContextMenuProps { onClose: () => void; onAction?: (label: string) => void; }

export function ContextMenu({ onClose, onAction }: ContextMenuProps) {
  const items: MenuEntry[] = [
    { icon: '⏸', label: '暂停记录', shortcut: 'Ctrl+P' },
    { icon: '🍅', label: '开始专注', shortcut: 'Ctrl+F' },
    { icon: '⤢', label: '打开主窗口', shortcut: 'Dbl-click' },
    null,
    { icon: '📌', label: '吸附到边缘' },
    { icon: '👁', label: '仅图标模式' },
    null,
    { icon: '⚙', label: '设置' },
    { icon: '✕', label: '退出', warn: true },
  ];
  return (
    <div
      onClick={onClose}
      data-widget-popover
      style={{
        position: 'absolute', bottom: 'calc(100% + 12px)', left: 70,
        width: 220, background: 'var(--cloud-white)',
        border: '2px solid var(--line)',
        borderRadius: '10px 12px 10px 12px',
        boxShadow: '4px 4px 0 var(--line)',
        padding: 6,
        fontFamily: 'var(--font-sans)',
        // @ts-expect-error non-standard CSS property handled by Electron
        WebkitAppRegion: 'no-drag',
      }}
    >
      {items.map((it, i) =>
        it === null ? (
          <div key={`sep-${i}`} style={{ height: 1, background: 'var(--paper-deep)', margin: '4px 2px' }} />
        ) : (
          <div
            key={it.label}
            onClick={(e) => { e.stopPropagation(); onAction?.(it.label); onClose(); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '7px 10px', borderRadius: 6, fontSize: 13,
              color: it.warn ? 'var(--peach-deep)' : 'var(--ink)', cursor: 'pointer',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--paper-deep)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <span style={{ width: 18, textAlign: 'center' }}>{it.icon}</span>
            <span style={{ flex: 1 }}>{it.label}</span>
            {it.shortcut && <span style={{ fontSize: 10, color: 'var(--ink-mute)', fontFamily: 'monospace' }}>{it.shortcut}</span>}
          </div>
        ),
      )}
    </div>
  );
}
