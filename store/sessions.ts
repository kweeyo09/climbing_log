/**
 * Zustand store — the single source of truth for session data in memory.
 *
 * Zustand is a lightweight state management library. Think of this store as
 * a globally accessible object with both data (sessions, loading) and methods
 * (loadSessions, addSession, etc.) that any component can subscribe to.
 *
 * Supabase cloud sync is optional — the app works fully offline when
 * EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY are not set.
 */

import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import {
  dbGetAllSessions,
  dbInsertSession,
  dbDeleteSession,
  dbMarkSynced,
} from '../lib/db';
import type { Session, NewSessionInput } from '../types';

const uid = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

interface SessionState {
  sessions: Session[];
  loading: boolean;
  // Methods
  loadSessions:   () => Promise<void>;
  addSession:     (input: NewSessionInput) => Promise<void>;
  updateSession:  (id: string, input: NewSessionInput) => Promise<void>;
  deleteSession:  (id: string) => Promise<void>;
  syncToCloud:    () => Promise<void>;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  sessions: [],
  loading:  true,

  /** Load all sessions from the local database on app start */
  loadSessions: async () => {
    set({ loading: true });
    try {
      const sessions = await dbGetAllSessions();
      set({ sessions });
    } finally {
      set({ loading: false });
    }
  },

  /** Save a new session locally, then try to sync it to Supabase */
  addSession: async (input) => {
    const session: Session = {
      id:           uid(),
      created_at:   new Date().toISOString(),
      synced:       false,
      user_id:      undefined,
      ...input,
      routes: input.routes.map((r, i) => ({
        ...r,
        id:         `${Date.now()}-${i}`,
        session_id: '',
      })),
    };
    session.routes = session.routes.map(r => ({
      ...r,
      session_id: session.id,
    }));

    await dbInsertSession(session);

    set(state => ({
      sessions: [session, ...state.sessions].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      ),
    }));

    // Fire-and-forget sync (skipped silently if Supabase is not configured)
    get().syncToCloud().catch(() => {});
  },

  /** Update an existing session locally */
  updateSession: async (id, input) => {
    const existing = get().sessions.find(s => s.id === id);
    if (!existing) return;
    const updated: Session = {
      ...existing,
      ...input,
      synced: false,
      routes: input.routes.map((r, i) => ({
        ...r,
        id:         `${Date.now()}-${i}`,
        session_id: id,
      })),
    };
    await dbInsertSession(updated);
    set(state => ({
      sessions: state.sessions
        .map(s => s.id === id ? updated : s)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    }));
    get().syncToCloud().catch(() => {});
  },

  /** Delete locally and from Supabase (if configured) */
  deleteSession: async (id) => {
    await dbDeleteSession(id);
    set(state => ({ sessions: state.sessions.filter(s => s.id !== id) }));

    // Best-effort remote delete — only when Supabase is configured
    if (supabase) {
      supabase.from('sessions').delete().eq('id', id).then(() => {});
    }
  },

  /** Push any un-synced sessions to Supabase — silently skipped if not configured */
  syncToCloud: async () => {
    if (!supabase) return; // Supabase not configured — skip silently

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return; // not logged in — skip

    const unsynced = get().sessions.filter(s => !s.synced);

    for (const session of unsynced) {
      const { error: sErr } = await supabase.from('sessions').upsert({
        id:           session.id,
        user_id:      user.id,
        date:         session.date,
        location:     session.location,
        duration:     session.duration,
        grade_system: session.grade_system,
        reflections:  session.reflections,
        created_at:   session.created_at,
      });

      if (sErr) continue;

      for (const route of session.routes) {
        await supabase.from('routes').upsert({
          id:         route.id,
          session_id: session.id,
          grade:      route.grade,
          style:      route.style,
          completed:  route.completed,
        });
      }

      await dbMarkSynced(session.id);

      set(state => ({
        sessions: state.sessions.map(s =>
          s.id === session.id ? { ...s, synced: true } : s,
        ),
      }));
    }
  },
}));
