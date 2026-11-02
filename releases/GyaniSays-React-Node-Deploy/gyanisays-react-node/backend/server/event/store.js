import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

export function openEventStore(filename) {
  if (filename !== ':memory:') mkdirSync(path.dirname(filename), { recursive: true });
  const db = new DatabaseSync(filename);
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;
    CREATE TABLE IF NOT EXISTS invitees(id INTEGER PRIMARY KEY, import_key TEXT UNIQUE NOT NULL, name TEXT NOT NULL, department TEXT NOT NULL, external_id TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1);
    CREATE TABLE IF NOT EXISTS registrations(id INTEGER PRIMARY KEY, reference TEXT UNIQUE NOT NULL, payload TEXT NOT NULL, team TEXT NOT NULL, created_at TEXT NOT NULL, request_key TEXT UNIQUE NOT NULL, request_hash TEXT NOT NULL, invitee_id INTEGER UNIQUE REFERENCES invitees(id));
    CREATE TABLE IF NOT EXISTS catalog(id INTEGER PRIMARY KEY CHECK(id=1),payload TEXT NOT NULL,revision INTEGER NOT NULL DEFAULT 1);
    CREATE TABLE IF NOT EXISTS winners(award TEXT PRIMARY KEY,recipient TEXT NOT NULL,note TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS limits(key TEXT PRIMARY KEY,count INTEGER NOT NULL,reset INTEGER NOT NULL);`);
  db.prepare('INSERT OR IGNORE INTO catalog(id,payload) VALUES(1,?)').run(readFileSync(new URL('./catalog.json', import.meta.url), 'utf8'));
  return db;
}
