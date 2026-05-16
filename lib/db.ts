/**
 * Local persistence layer using AsyncStorage.
 * Replaces expo-sqlite to avoid native binary build issues on Windows/dev.
 * Data is stored as JSON under the key ascenta_sessions.
 * All function signatures are identical to the original db.ts so no other
 * files need to change.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Session } from "../types";

const SESSIONS_KEY = "ascenta_sessions";

async function readAll(): Promise<Session[]> {
  try {
    const raw = await AsyncStorage.getItem(SESSIONS_KEY);
    return JSON.parse(raw) as Session[];
  } catch {
    return [];
  }
}

async function writeAll(sessions: Session[]): Promise<void> {
  await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export async function dbGetAllSessions(): Promise<Session[]> {
  const sessions = await readAll();
  return sessions.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

export async function dbInsertSession(session: Session): Promise<void> {
  const sessions = await readAll();
  const idx = sessions.findIndex(s => s.id === session.id);
  if (idx >= 0) {
    sessions[idx] = session;
  } else {
    sessions.push(session);
  }
  await writeAll(sessions);
}

export async function dbDeleteSession(id: string): Promise<void> {
  const sessions = await readAll();
  await writeAll(sessions.filter(s => s.id !== id));
}

export async function dbMarkSynced(id: string): Promise<void> {
  const sessions = await readAll();
  await writeAll(sessions.map(s => s.id === id ? { ...s, synced: true } : s));
}
