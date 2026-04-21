// @vitest-environment node
import { describe, it, expect, beforeEach } from 'vitest';
import { openDatabase } from './database';
import { EventRepository } from './repository';

describe('EventRepository', () => {
  let repo: EventRepository;
  beforeEach(() => {
    const db = openDatabase(':memory:');
    repo = new EventRepository(db);
  });

  it('inserts an event and reads it back', () => {
    const id = repo.insert({ appExe: 'code.exe', appName: 'VS Code', startedAt: 1000, endedAt: 2000, category: '工作' });
    expect(repo.findById(id)).toMatchObject({ appName: 'VS Code', category: '工作' });
  });

  it('returns events in a time range', () => {
    repo.insert({ appExe: 'a.exe', appName: 'A', startedAt: 100, endedAt: 200, category: '工作' });
    repo.insert({ appExe: 'b.exe', appName: 'B', startedAt: 500, endedAt: 600, category: '娱乐' });
    repo.insert({ appExe: 'c.exe', appName: 'C', startedAt: 900, endedAt: 1000, category: '工作' });
    const rows = repo.findInRange(150, 650);
    expect(rows).toHaveLength(2);
    expect(rows.map((r) => r.appName).sort()).toEqual(['A', 'B']);
  });

  it('deletes all events', () => {
    repo.insert({ appExe: 'a.exe', appName: 'A', startedAt: 1, endedAt: 2, category: '工作' });
    repo.deleteAll();
    expect(repo.findInRange(0, 999_999)).toHaveLength(0);
  });
});
