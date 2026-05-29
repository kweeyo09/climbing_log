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
import { deleteLocalPhoto, uploadPhotoToSupabase } from '../lib/photos';
import type { Session, SessionPhoto, NewSessionInput } from '../types';

const uid = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const buildPhotoMeta = (sessionId: string, photoUris: string[]): SessionPhoto[] =>
  photoUris.map((localUri, index) => ({
    id: `${sessionId}-photo-${index}-${Math.random().toString(36).slice(2, 8)}`,
    session_id: sessionId,
    local_uri: localUri,
    created_at: new Date().toISOString(),
    tags: [],
  }));

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
    const sessionId = uid();
    const photoUris = input.photo_uris ?? [];
    const session: Session = {
      id:           sessionId,
      created_at:   new Date().toISOString(),
      synced:       false,
      user_id:      undefined,
      ...input,
      photo_uris:   photoUris,
      photos:       input.photos ?? buildPhotoMeta(sessionId, photoUris),
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
    const photoUris = input.photo_uris ?? [];
    const existingPhotoByUri = new Map((existing.photos ?? []).map(photo => [photo.local_uri, photo]));
    const photos = photoUris.map(uri => existingPhotoByUri.get(uri)).filter(Boolean) as SessionPhoto[];
    const newPhotos = photoUris.filter(uri => !existingPhotoByUri.has(uri));

    const updated: Session = {
      ...existing,
      ...input,
      photo_uris: photoUris,
      photos: [...photos, ...buildPhotoMeta(id, newPhotos)],
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
    const existing = get().sessions.find(s => s.id === id);
    await dbDeleteSession(id);
    set(state => ({ sessions: state.sessions.filter(s => s.id !== id) }));

    if (existing?.photo_uris?.length) {
      existing.photo_uris.forEach(uri => deleteLocalPhoto(uri));
    }

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

      const uploadedPhotos: SessionPhoto[] = [];
      let photoUploadFailed = false;
      for (const uri of session.photo_uris ?? []) {
        const existingPhoto = session.photos?.find(photo => photo.local_uri === uri && photo.remote_url);
        if (existingPhoto) {
          uploadedPhotos.push(existingPhoto);
          continue;
        }

        try {
          const uploaded = await uploadPhotoToSupabase(uri, session.id, user.id);
          if (!uploaded) {
            photoUploadFailed = true;
            continue;
          }

          const photoMeta: SessionPhoto = {
            id: `${session.id}-${uploaded.storage_path}`,
            session_id: session.id,
            local_uri: uri,
            remote_url: uploaded.remote_url,
            storage_path: uploaded.storage_path,
            owner_id: user.id,
            uploaded_at: uploaded.uploaded_at,
            created_at: uploaded.uploaded_at,
            tags: [],
          };

          uploadedPhotos.push(photoMeta);

          await supabase.from('session_photos').upsert({
            id: photoMeta.id,
            session_id: session.id,
            user_id: user.id,
            storage_path: photoMeta.storage_path,
            public_url: photoMeta.remote_url,
            tags: photoMeta.tags,
            created_at: photoMeta.created_at,
            uploaded_at: photoMeta.uploaded_at,
          });
        } catch {
          photoUploadFailed = true;
          // Keep the session unsynced so the photo upload can be retried later.
        }
      }

      const syncedSession: Session = {
        ...session,
        user_id: user.id,
        photos: uploadedPhotos.length > 0 ? uploadedPhotos : session.photos,
        synced: !photoUploadFailed,
      };

      await dbInsertSession(syncedSession);
      if (!photoUploadFailed) {
        await dbMarkSynced(session.id);
      }

      set(state => ({
        sessions: state.sessions.map(s =>
          s.id === session.id ? syncedSession : s,
        ),
      }));
    }
  },
}));
