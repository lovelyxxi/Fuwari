import { useEffect, useState } from 'react';
import type { FocusState } from '@shared/types';

export function useFocus() {
  const [state, setState] = useState<FocusState | null>(null);
  useEffect(() => {
    void window.api.focus.get().then(setState);
    return window.api.focus.onUpdate(setState);
  }, []);
  return state;
}
