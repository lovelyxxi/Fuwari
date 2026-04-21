import { promises as fs } from 'node:fs';
import path from 'node:path';
import { DEFAULT_PREFS, type Preferences } from '../../shared/types';

export class PreferencesStore {
  private cache: Preferences | null = null;
  constructor(private readonly dir: string) {}

  private get file() {
    return path.join(this.dir, 'prefs.json');
  }

  async load(): Promise<Preferences> {
    try {
      await fs.mkdir(this.dir, { recursive: true });
      const raw = await fs.readFile(this.file, 'utf8');
      const parsed = JSON.parse(raw) as Partial<Preferences>;
      this.cache = { ...DEFAULT_PREFS, ...parsed };
    } catch {
      this.cache = { ...DEFAULT_PREFS };
    }
    return this.cache;
  }

  get(): Preferences {
    if (!this.cache) throw new Error('PreferencesStore.load() must be called first');
    return this.cache;
  }

  async set<K extends keyof Preferences>(key: K, value: Preferences[K]): Promise<Preferences> {
    if (!this.cache) await this.load();
    this.cache = { ...(this.cache as Preferences), [key]: value };
    await fs.mkdir(this.dir, { recursive: true });
    await fs.writeFile(this.file, JSON.stringify(this.cache, null, 2), 'utf8');
    return this.cache;
  }
}
