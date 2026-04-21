import { create } from 'zustand';
import type { TickPayload, TodaySummary, CurrentAppInfo } from '@shared/types';
import type { Mood } from '@shared/tokens';

interface AppStore {
  today: TodaySummary | null;
  current: CurrentAppInfo | null;
  mood: Mood;
  week: TodaySummary[];
  setTick: (p: TickPayload) => void;
  setWeek: (w: TodaySummary[]) => void;
}

export const useStore = create<AppStore>((set) => ({
  today: null,
  current: null,
  mood: 'happy',
  week: [],
  setTick: (p) => set({ today: p.today, current: p.current, mood: p.mood }),
  setWeek: (w) => set({ week: w }),
}));
