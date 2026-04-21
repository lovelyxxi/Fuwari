import { useStore } from '../state/store';

export const useMood = () => useStore((s) => s.mood);
