// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { PreferencesStore } from './preferences';
import { DEFAULT_PREFS } from '../../shared/types';

describe('PreferencesStore', () => {
  let tmpDir: string;
  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'cc-prefs-'));
  });
  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it('returns defaults when no file exists', async () => {
    const store = new PreferencesStore(tmpDir);
    const prefs = await store.load();
    expect(prefs).toEqual(DEFAULT_PREFS);
  });

  it('persists and loads set values', async () => {
    const store = new PreferencesStore(tmpDir);
    await store.load();
    await store.set('floatingVariant', 'B');
    const reloaded = await new PreferencesStore(tmpDir).load();
    expect(reloaded.floatingVariant).toBe('B');
  });

  it('merges new defaults into existing prefs file', async () => {
    await fs.writeFile(path.join(tmpDir, 'prefs.json'), JSON.stringify({ theme: 'dark' }));
    const prefs = await new PreferencesStore(tmpDir).load();
    expect(prefs.theme).toBe('dark');
    expect(prefs.mascotKind).toBe('cloud');
  });
});
