import { describe, it, expect } from 'vitest';
import { computeMood } from './mood';

describe('computeMood', () => {
  const baseHour = 14;

  it('returns happy when under 5 hours', () => {
    expect(computeMood({ totalMins: 60,  hour: baseHour, anyAppOverLimit: false, focusRunning: false })).toBe('happy');
    expect(computeMood({ totalMins: 299, hour: baseHour, anyAppOverLimit: false, focusRunning: false })).toBe('happy');
  });
  it('returns calm at 5–8 hours', () => {
    expect(computeMood({ totalMins: 300, hour: baseHour, anyAppOverLimit: false, focusRunning: false })).toBe('calm');
    expect(computeMood({ totalMins: 479, hour: baseHour, anyAppOverLimit: false, focusRunning: false })).toBe('calm');
  });
  it('returns worried at 8+ hours', () => {
    expect(computeMood({ totalMins: 480, hour: baseHour, anyAppOverLimit: false, focusRunning: false })).toBe('worried');
  });
  it('returns sleepy after 22:00', () => {
    expect(computeMood({ totalMins: 200, hour: 22, anyAppOverLimit: false, focusRunning: false })).toBe('sleepy');
    expect(computeMood({ totalMins: 200, hour: 23, anyAppOverLimit: false, focusRunning: false })).toBe('sleepy');
  });
  it('returns alert when an app exceeds its limit', () => {
    expect(computeMood({ totalMins: 60, hour: 14, anyAppOverLimit: true, focusRunning: false })).toBe('alert');
  });
  it('focus mode overrides everything with calm', () => {
    expect(computeMood({ totalMins: 9999, hour: 23, anyAppOverLimit: true, focusRunning: true })).toBe('calm');
  });
});
