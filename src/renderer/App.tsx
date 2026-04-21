import { useEffect } from 'react';
import { MainWindow } from './main-window/MainWindow';
import { useStore } from './state/store';
import { usePrefs } from './hooks/usePrefs';

export default function App() {
  const setTick = useStore((s) => s.setTick);
  const setWeek = useStore((s) => s.setWeek);
  const { prefs } = usePrefs();

  useEffect(() => {
    void window.api.data.getToday().then((t) => setTick({ today: t, current: null, mood: 'happy' }));
    void window.api.data.getWeek().then(setWeek);
    return window.api.data.onTick(setTick);
  }, [setTick, setWeek]);

  useEffect(() => {
    if (!prefs) return;
    document.documentElement.classList.toggle('theme-dark', prefs.theme === 'dark');
  }, [prefs?.theme]);

  return <MainWindow mascotKind={prefs?.mascotKind ?? 'cloud'} />;
}
