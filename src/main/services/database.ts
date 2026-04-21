import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

const MIGRATIONS = [
  `CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    app_exe TEXT NOT NULL,
    app_name TEXT NOT NULL,
    started_at INTEGER NOT NULL,
    ended_at INTEGER NOT NULL,
    category TEXT NOT NULL
  );`,
  `CREATE INDEX IF NOT EXISTS idx_started ON events(started_at);`,
  `CREATE INDEX IF NOT EXISTS idx_ended   ON events(ended_at);`,
];

export function openDatabase(filePath: string): Database.Database {
  if (filePath !== ':memory:') {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
  }
  const db = new Database(filePath);
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = NORMAL');
  for (const sql of MIGRATIONS) db.exec(sql);
  return db;
}
