// @vitest-environment node
import { describe, it, expect, beforeEach } from 'vitest';
import { openDatabase } from './database';
import { EventRepository } from './repository';
import { aggregateDay } from './aggregator';

describe('aggregateDay', () => {
  let repo: EventRepository;
  const dayStart = new Date('2026-04-21T00:00:00').getTime();
  const h = (hour: number, min = 0) => dayStart + hour * 3_600_000 + min * 60_000;

  beforeEach(() => {
    repo = new EventRepository(openDatabase(':memory:'));
  });

  it('sums minutes per app', () => {
    repo.insert({ appExe: 'code.exe', appName: 'VS Code', startedAt: h(9), endedAt: h(10), category: '工作' });
    repo.insert({ appExe: 'code.exe', appName: 'VS Code', startedAt: h(11), endedAt: h(11, 30), category: '工作' });
    const s = aggregateDay(repo, dayStart);
    expect(s.totalMins).toBe(90);
    expect(s.byApp[0]).toMatchObject({ appName: 'VS Code', mins: 90 });
  });

  it('splits a cross-hour event across hourly buckets', () => {
    repo.insert({ appExe: 'c.exe', appName: 'C', startedAt: h(10, 45), endedAt: h(11, 15), category: '工作' });
    const s = aggregateDay(repo, dayStart);
    expect(s.hourly[10]).toBe(15);
    expect(s.hourly[11]).toBe(15);
  });

  it('clamps events crossing midnight to the requested day', () => {
    repo.insert({ appExe: 'c.exe', appName: 'C', startedAt: h(23, 45), endedAt: h(24, 0) + 15 * 60_000, category: '工作' });
    const s = aggregateDay(repo, dayStart);
    expect(s.hourly[23]).toBe(15);
    expect(s.totalMins).toBe(15);
  });

  it('aggregates by category', () => {
    repo.insert({ appExe: 'a.exe', appName: 'A', startedAt: h(9), endedAt: h(10), category: '工作' });
    repo.insert({ appExe: 'b.exe', appName: 'B', startedAt: h(14), endedAt: h(15), category: '娱乐' });
    const s = aggregateDay(repo, dayStart);
    expect(s.byCategory).toEqual({ 工作: 60, 娱乐: 60 });
  });
});
