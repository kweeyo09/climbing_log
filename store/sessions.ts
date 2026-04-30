/**
 * Zustand store — the single source of truth for session data in memory.
 *
 * Zustand is a lightweight state management library. Think of this store as
 * a globally accessible object with both data (sessions, loading) and methods
 * (loadSessions, addSession, etc.) that any component can subscribe to.
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
  loadSessions: () => Promise<void>;
  addSession:   (input: NewSessionInput) => Promise<void>;
  deleteSession:(id: string) => Promise<void>;
  syncToCloud:  () => Promise<void>;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  sessions: [],
  loading:  true,

  /** Load all sessions from the local SQLite database on app start */
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
      // Give each route a unique id and attach the session id
      routes: input.routes.map((r, i) => ({
        ...r,
        id:         `${Date.now()}-${i}`,
        session_id: '', // set below
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

    // Fire-and-forget sync (offline? it'll sync next time)
    get().syncToCloud().catch(() => {});
  },

  /** Delete locally and from Supabase */
  deleteSession: async (id) => {
    await dbDeleteSession(id);
    set(state => ({ sessions: state.sessions.filter(s => s.id !== id) }));

    // Best-effort remote delete
    supabase.from('sessions').delete().eq('id', id).then(() => {});
  },

  /** Push any un-synced sessions to Supabase */
  syncToCloud: async () => {
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

      if (sErr) continue; // skip routes if session failed

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
