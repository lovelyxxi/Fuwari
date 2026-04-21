import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { FloatingWidget, type WidgetState } from './floating/FloatingWidget';
import { useStore } from './state/store';
import { usePrefs } from './hooks/usePrefs';
import { iconKindFor } from './utils/iconKind';

export default function FloatingApp() {
  const [state, setState] = useState<WidgetState>('pill');
  const setTick = useStore((s) => s.setTick);
  const today = useStore((s) => s.today);
  const current = useStore((s) => s.current);
  const mood = useStore((s) => s.mood);
  const { prefs } = usePrefs();

  useEffect(() => {
    void window.api.data.getToday().then((t) => setTick({ today: t, current: null, mood: 'happy' }));
    return window.api.data.onTick(setTick);
  }, [setTick]);

  useEffect(() => {
    if (!prefs) return;
    document.documentElement.classList.toggle('theme-dark', prefs.theme === 'dark');
  }, [prefs?.theme]);

  // -webkit-app-region: drag swallows DOM mouse events on the pill. So we do hover
  // detection in the main process by polling the real OS cursor vs the pill's rect.
  // When the card is open, we include the card area so the cursor can traverse the gap
  // from pill to card without closing it.
  useLayoutEffect(() => {
    const measure = () => {
      const pill = document.querySelector<HTMLElement>('[data-pill-body]');
      if (!pill) { window.api.floating.setPillRect(null); return; }
      const pr = pill.getBoundingClientRect();

      const popover = state === 'card' || state === 'menu'
        ? document.querySelector<HTMLElement>('[data-widget-popover]')
        : null;
      if (!popover) {
        window.api.floating.setPillRect({ x: pr.x, y: pr.y, w: pr.width, h: pr.height });
        return;
      }
      const cr = popover.getBoundingClientRect();
      const x = Math.min(pr.x, cr.x);
      const y = Math.min(pr.y, cr.y);
      const right = Math.max(pr.right, cr.right);
      const bottom = Math.max(pr.bottom, cr.bottom);
      window.api.floating.setPillRect({ x, y, w: right - x, h: bottom - y });
    };
    measure();
    const t = window.setTimeout(measure, 0);
    window.addEventListener('resize', measure);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('resize', measure);
    };
  }, [state, prefs?.floatingVariant, prefs?.mascotKind]);

  // Hover the pill → expand into card. Leave → collapse back to pill.
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const unsub = window.api.floating.onPillHover((inside) => {
      if (inside) {
        if (hoverTimer.current) clearTimeout(hoverTimer.current);
        hoverTimer.current = setTimeout(() => {
          setState((s) => (s === 'pill' ? 'card' : s));
        }, 50);
      } else {
        if (hoverTimer.current) { clearTimeout(hoverTimer.current); hoverTimer.current = null; }
        setState((s) => (s === 'card' ? 'pill' : s));
      }
    });
    return () => {
      unsub();
      if (hoverTimer.current) clearTimeout(hoverTimer.current);
    };
  }, []);

  // Right-click on the pill: also routed via main since drag regions swallow contextmenu.
  useEffect(() => {
    return window.api.floating.onContextMenu(() => setState('menu'));
  }, []);

  // Outside-click still needs document listener to dismiss card/menu when clicking the
  // non-drag transparent area of the floating window.
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const t = e.target as Element | null;
      if (t && t.closest('[data-pill-body]')) return;
      if (t && t.closest('[data-widget-popover]')) return;
      setState((s) => (s === 'menu' || s === 'card' ? 'pill' : s));
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const curApp = current
    ? { name: current.appName, kind: iconKindFor(current.appName, current.appExe), mins: current.currentSessionMins }
    : { name: '待命中', kind: 'doc' as const, mins: 0 };
  const todayMins = today?.totalMins ?? 0;

  const categoryBreakdown = today
    ? Object.entries(today.byCategory).map(([name, mins]) => ({ name, mins, color: categoryColor(name) }))
    : [];

  return (
    <div
      data-widget-root
      style={{
        width: '100vw', height: '100vh',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end',
        padding: 16, background: 'transparent',
      }}
    >
      <FloatingWidget
        variant={prefs?.floatingVariant ?? 'A'}
        state={state}
        onStateChange={setState}
        mood={mood}
        curApp={curApp}
        todayMins={todayMins}
        categoryBreakdown={categoryBreakdown}
      />
    </div>
  );
}

function categoryColor(cat: string): string {
  switch (cat) {
    case '工作': return 'var(--mint)';
    case '沟通': return 'var(--blue)';
    case '浏览': return 'var(--lilac)';
    case '娱乐': return 'var(--peach)';
    default:    return 'var(--lemon)';
  }
}
