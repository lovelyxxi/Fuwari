export type WindowKind = 'main' | 'floating';

import type { Theme, MascotKind, FloatingVariant } from './tokens';

export interface Preferences {
  theme: Theme;
  mascotKind: MascotKind;
  floatingVariant: FloatingVariant;
  floatingPos: { x: number; y: number } | null;
  startOnBoot: boolean;
  idleDetection: boolean;
  sedentaryReminder: boolean;
  dailySummary: boolean;
  floatingEnabled: boolean;
  privacyBlank: boolean;
  appLimits: Record<string, number>;
}

export const DEFAULT_PREFS: Preferences = {
  theme: 'light',
  mascotKind: 'cloud',
  floatingVariant: 'A',
  floatingPos: null,
  startOnBoot: false,
  idleDetection: true,
  sedentaryReminder: true,
  dailySummary: false,
  floatingEnabled: true,
  privacyBlank: false,
  appLimits: {},
};

export interface UsageEvent {
  id?: number;
  appExe: string;
  appName: string;
  startedAt: number;   // unix ms
  endedAt: number;     // unix ms
  category: string;
}

export interface TodaySummary {
  dateMs: number;              // midnight of the day
  totalMins: number;
  byApp: { appName: string; appExe: string; category: string; mins: number }[];
  byCategory: Record<string, number>;
  hourly: number[];            // 24 numbers, minutes per hour
}

export interface CurrentAppInfo {
  appExe: string;
  appName: string;
  category: string;
  currentSessionMins: number;
  sessionStartedAt: number;
}

import type { Mood } from './tokens';

export interface TickPayload {
  current: CurrentAppInfo | null;
  today: TodaySummary;
  mood: Mood;
}

export interface FocusState {
  running: boolean;
  remainingSecs: number;
  durationSecs: number;
  task: string;
  completedToday: number;
}

export interface Api {
  getWindowKind: () => WindowKind;
  win: {
    minimize: () => void;
    maximize: () => void;
    close: () => void;
  };
  floating: {
    startDrag: (offsetX: number, offsetY: number) => void;
    stopDrag: () => void;
    openMain: () => void;
  };
  prefs: {
    get: () => Promise<Preferences>;
    set: <K extends keyof Preferences>(key: K, value: Preferences[K]) => Promise<Preferences>;
    onChange: (cb: (p: Preferences) => void) => () => void;
  };
  data: {
    getToday: () => Promise<TodaySummary>;
    getWeek: () => Promise<TodaySummary[]>;
    clearAll: () => Promise<void>;
    exportAll: () => Promise<UsageEvent[]>;
    onTick: (cb: (p: TickPayload) => void) => () => void;
    onCurrentApp: (cb: (info: CurrentAppInfo | null) => void) => () => void;
  };
  focus: {
    get: () => Promise<FocusState>;
    start: (mins?: number) => Promise<void>;
    pause: () => Promise<void>;
    reset: () => Promise<void>;
    setTask: (t: string) => Promise<void>;
    onUpdate: (cb: (s: FocusState) => void) => () => void;
  };
}
