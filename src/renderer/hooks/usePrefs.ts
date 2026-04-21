import { useEffect, useState } from 'react';
import type { Preferences } from '@shared/types';

export function usePrefs() {
  const [prefs, setPrefs] = useState<Preferences | null>(null);

  useEffect(() => {
    void window.api.prefs.get().then(setPrefs);
    return window.api.prefs.onChange(setPrefs);
  }, []);

  const update = <K extends keyof Preferences>(key: K, value: Preferences[K]) =>
    window.api.prefs.set(key, value).then(setPrefs);

  return { prefs, update };
}
