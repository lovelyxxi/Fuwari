import type Database from 'better-sqlite3';
import type { UsageEvent } from '../../shared/types';

type Row = {
  id: number;
  app_exe: string;
  app_name: string;
  started_at: number;
  ended_at: number;
  category: string;
};

function rowToEvent(r: Row): UsageEvent {
  return {
    id: r.id,
    appExe: r.app_exe,
    appName: r.app_name,
    startedAt: r.started_at,
    endedAt: r.ended_at,
    category: r.category,
  };
}

export class EventRepository {
  constructor(private readonly db: Database.Database) {}

  insert(e: Omit<UsageEvent, 'id'>): number {
    const r = this.db
      .prepare(
        `INSERT INTO events (app_exe, app_name, started_at, ended_at, category)
         VALUES (?, ?, ?, ?, ?)`,
      )
      .run(e.appExe, e.appName, e.startedAt, e.endedAt, e.category);
    return Number(r.lastInsertRowid);
  }

  findById(id: number): UsageEvent | null {
    const row = this.db.prepare(`SELECT * FROM events WHERE id = ?`).get(id) as Row | undefined;
    return row ? rowToEvent(row) : null;
  }

  findInRange(fromMs: number, toMs: number): UsageEvent[] {
    const rows = this.db
      .prepare(`SELECT * FROM events WHERE started_at < ? AND ended_at > ? ORDER BY started_at`)
      .all(toMs, fromMs) as Row[];
    return rows.map(rowToEvent);
  }

  deleteAll(): void {
    this.db.exec(`DELETE FROM events`);
  }
}
