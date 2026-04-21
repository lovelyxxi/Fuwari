import type { Mood } from '../../shared/tokens';

export interface MoodInput {
  totalMins: number;
  hour: number;           // 0-23
  anyAppOverLimit: boolean;
  focusRunning: boolean;
}

export function computeMood(i: MoodInput): Mood {
  if (i.focusRunning) return 'calm';
  if (i.anyAppOverLimit) return 'alert';
  if (i.hour >= 22) return 'sleepy';
  if (i.totalMins >= 480) return 'worried';
  if (i.totalMins >= 300) return 'calm';
  return 'happy';
}
