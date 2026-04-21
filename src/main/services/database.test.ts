// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { openDatabase } from './database';

describe('database', () => {
  let dir: string;
  beforeEach(async () => { dir = await fs.mkdtemp(path.join(os.tmpdir(), 'cc-db-')); });
  afterEach(async () => { await fs.rm(dir, { recursive: true, force: true }); });

  it('creates the events table on first open', () => {
    const db = openDatabase(path.join(dir, 'events.sqlite'));
    const rows = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as { name: string }[];
    expect(rows.map((r) => r.name)).toContain('events');
    db.close();
  });

  it('is idempotent on repeated open', () => {
    const f = path.join(dir, 'events.sqlite');
    openDatabase(f).close();
    const db = openDatabase(f);
    expect(() => db.prepare('SELECT 1').get()).not.toThrow();
    db.close();
  });
});
