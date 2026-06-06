/**
 * Local persistence layer using AsyncStorage.
 * All functions are null-safe: they never throw on missing/corrupt data.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Session } from "../types";

const SESSIONS_KEY = "ascenta_sessions";

type LegacySession = Session & { photo_uri?: string | null; photo_uris?: string[] };

const normalizeSession = (session: LegacySession): Session => {
  const legacyPhotoUri = typeof session.photo_uri === "string" && session.photo_uri.length > 0
    ? session.photo_uri
    : null;
  const photoUris = Array.isArray(session.photo_uris)
    ? session.photo_uris.filter((uri): uri is string => typeof uri === "string" && uri.length > 0)
    : legacyPhotoUri
      ? [legacyPhotoUri]
      : [];

  const { photo_uri: _legacyPhotoUri, ...normalized } = session;

  return {
    ...normalized,
    photo_uris: photoUris,
  };
};

async function readAll(): Promise<Session[]> {
  try {
    const raw = await AsyncStorage.getItem(SESSIONS_KEY);
    // AsyncStorage returns null when the key has never been set
    if (raw === null || raw === undefined || raw === "") return [];
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // Corrupt JSON — reset storage
      await AsyncStorage.removeItem(SESSIONS_KEY);
      return [];
    }
    if (!Array.isArray(parsed)) return [];
    return (parsed as LegacySession[]).map(normalizeSession);
  } catch {
    return [];
  }
}

async function writeAll(sessions: Session[]): Promise<void> {
  try {
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions.map(normalizeSession)));
  } catch {
    // Storage full or unavailable — fail silently
  }
}

export async function dbGetAllSessions(): Promise<Session[]> {
  const sessions = await readAll();
  return [...sessions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

export async function dbInsertSession(session: Session): Promise<void> {
  const sessions = await readAll();
  const idx = sessions.findIndex((s) => s.id === session.id);
  if (idx >= 0) {
    sessions[idx] = normalizeSession(session);
  } else {
    sessions.push(normalizeSession(session));
  }
  await writeAll(sessions);
}

export async function dbDeleteSession(id: string): Promise<void> {
  const sessions = await readAll();
  await writeAll(sessions.filter((s) => s.id !== id));
}

export async function dbMarkSynced(id: string): Promise<void> {
  const sessions = await readAll();
  await writeAll(
    sessions.map((s) => (s.id === id ? { ...s, synced: true } : s)),
  );
}

export async function dbClearAll(): Promise<void> {
  try {
    await AsyncStorage.removeItem(SESSIONS_KEY);
  } catch {}
}
