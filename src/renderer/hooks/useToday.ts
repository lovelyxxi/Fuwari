import { useStore } from '../state/store';

export const useToday = () => useStore((s) => s.today);
export const useWeek = () => useStore((s) => s.week);
export const useCurrent = () => useStore((s) => s.current);
