import * as SQLite from 'expo-sqlite';
import type { Session } from '../types';

// Module-level singleton — the DB is opened once and reused
let _db: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!_db) {
    _db = await SQLite.openDatabaseAsync('climbing.db');
    await bootstrap(_db);
  }
  return _db;
}

/** Creates tables if they don't already exist */
async function bootstrap(db: SQLite.SQLiteDatabase) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS sessions (
      id           TEXT PRIMARY KEY,
      user_id      TEXT,
      date         TEXT NOT NULL,
      location     TEXT NOT NULL,
      duration     INTEGER DEFAULT 0,
      grade_system TEXT    DEFAULT 'french',
      reflections  TEXT    DEFAULT '',
      created_at   TEXT    NOT NULL,
      synced       INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS routes (
      id         TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      grade      TEXT NOT NULL,
      style      TEXT NOT NULL,
      completed  INTEGER DEFAULT 1,
      FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_date    ON sessions(date DESC);
    CREATE INDEX IF NOT EXISTS idx_routes_session   ON routes(session_id);
  `);
}

/** Fetch every session with its routes, sorted newest-first */
export async function dbGetAllSessions(): Promise<Session[]> {
  const db = await getDb();

  const rows = await db.getAllAsync<any>(
    'SELECT * FROM sessions ORDER BY date DESC, created_at DESC',
  );

  return Promise.all(
    rows.map(async (row) => {
      const routes = await db.getAllAsync<any>(
        'SELECT * FROM routes WHERE session_id = ?',
        [row.id],
      );
      return {
        ...row,
        synced: row.synced === 1,
        routes: routes.map(r => ({ ...r, completed: r.completed === 1 })),
      } as Session;
    }),
  );
}

/** Insert or replace a full session (including its routes) */
export async function dbInsertSession(session: Session): Promise<void> {
  const db = await getDb();

  await db.runAsync(
    `INSERT OR REPLACE INTO sessions
       (id, user_id, date, location, duration, grade_system, reflections, created_at, synced)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      session.id,
      session.user_id ?? null,
      session.date,
      session.location,
      session.duration,
      session.grade_system,
      session.reflections,
      session.created_at,
      session.synced ? 1 : 0,
    ],
  );

  for (const route of session.routes) {
    await db.runAsync(
      `INSERT OR REPLACE INTO routes (id, session_id, grade, style, completed)
       VALUES (?, ?, ?, ?, ?)`,
      [route.id, session.id, route.grade, route.style, route.completed ? 1 : 0],
    );
  }
}

/** Delete a session and its routes */
export async function dbDeleteSession(id: string): Promise<void> {
  const db = await getDb();
  // Cascades to routes via the FOREIGN KEY definition above
  await db.runAsync('DELETE FROM sessions WHERE id = ?', [id]);
}

/** Mark a session as synced to the cloud */
export async function dbMarkSynced(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE sessions SET synced = 1 WHERE id = ?', [id]);
}
