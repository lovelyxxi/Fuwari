import { useState, useEffect } from 'react';
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

  useEffect(() => {
    let hoverTimer: ReturnType<typeof setTimeout> | null = null;
    const onMouseEnter = () => {
      hoverTimer = setTimeout(() => setState((s) => (s === 'pill' ? 'tooltip' : s)), 500);
    };
    const onMouseLeave = () => {
      if (hoverTimer) clearTimeout(hoverTimer);
      setState((s) => (s === 'tooltip' ? 'pill' : s));
    };
    const onContextMenu = (e: MouseEvent) => { e.preventDefault(); setState('menu'); };
    const onDocClick = (e: MouseEvent) => {
      const t = e.target as Element | null;
      if (t && t.closest('[data-widget-root]')) return;
      setState((s) => (s === 'menu' ? 'pill' : s));
    };
    document.addEventListener('mouseenter', onMouseEnter);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('contextmenu', onContextMenu);
    document.addEventListener('click', onDocClick);
    return () => {
      document.removeEventListener('mouseenter', onMouseEnter);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('contextmenu', onContextMenu);
      document.removeEventListener('click', onDocClick);
      if (hoverTimer) clearTimeout(hoverTimer);
    };
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
