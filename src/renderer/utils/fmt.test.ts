import { describe, it, expect } from 'vitest';
import { fmtMins } from './fmt';

describe('fmtMins', () => {
  it('formats minutes under an hour as "N分"', () => {
    expect(fmtMins(42)).toBe('42分');
  });
  it('formats whole hours as "N时"', () => {
    expect(fmtMins(120)).toBe('2时');
  });
  it('formats hours with remainder as "X时Y分"', () => {
    expect(fmtMins(183)).toBe('3时3分');
  });
  it('returns "0分" for zero', () => {
    expect(fmtMins(0)).toBe('0分');
  });
});
