import { useState, useEffect } from 'react';
import { FloatingWidget, type WidgetState } from './floating/FloatingWidget';

export default function FloatingApp() {
  const [state, setState] = useState<WidgetState>('pill');

  useEffect(() => {
    let hoverTimer: ReturnType<typeof setTimeout> | null = null;

    const onMouseEnter = () => {
      hoverTimer = setTimeout(() => {
        setState((s) => (s === 'pill' ? 'tooltip' : s));
      }, 500);
    };
    const onMouseLeave = () => {
      if (hoverTimer) clearTimeout(hoverTimer);
      setState((s) => (s === 'tooltip' ? 'pill' : s));
    };
    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      setState('menu');
    };
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Element | null;
      // Close menu/card when clicking outside the widget body — handled by popover onClose too; this is belt-and-suspenders.
      if (target && target.closest('[data-widget-root]')) return;
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
        variant="A"
        state={state}
        onStateChange={setState}
        mood="happy"
        curApp={{ name: 'Figma', kind: 'design', mins: 74 }}
        todayMins={524}
      />
    </div>
  );
}
