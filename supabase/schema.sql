-- Run this in your Supabase project: SQL Editor → New Query → Paste → Run

-- Enable Row Level Security (RLS) so users only see their own data
-- RLS = a database-level rule that filters rows based on who's asking

CREATE TABLE public.sessions (
  id          TEXT        PRIMARY KEY,
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date        DATE        NOT NULL,
  location    TEXT        NOT NULL,
  duration    INTEGER     DEFAULT 0,
  grade_system TEXT       DEFAULT 'french' CHECK (grade_system IN ('french', 'v')),
  reflections TEXT        DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.routes (
  id          TEXT        PRIMARY KEY,
  session_id  TEXT        NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  grade       TEXT        NOT NULL,
  style       TEXT        NOT NULL CHECK (style IN ('Lead', 'Top Rope', 'Boulder', 'Auto-belay')),
  completed   BOOLEAN     DEFAULT TRUE
);

-- Stores Supabase Storage metadata for session photos.
-- Binary image files live in the Storage bucket named by EXPO_PUBLIC_SUPABASE_STORAGE_BUCKET.
CREATE TABLE public.session_photos (
  id           TEXT        PRIMARY KEY,
  session_id   TEXT        NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  storage_path TEXT        NOT NULL,
  public_url   TEXT        NOT NULL,
  tags         TEXT[]      DEFAULT '{}',
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  uploaded_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX idx_sessions_user_date      ON public.sessions(user_id, date DESC);
CREATE INDEX idx_routes_session          ON public.routes(session_id);
CREATE INDEX idx_session_photos_session  ON public.session_photos(session_id);
CREATE INDEX idx_session_photos_user     ON public.session_photos(user_id);

-- Enable Row Level Security on both tables
ALTER TABLE public.sessions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_photos ENABLE ROW LEVEL SECURITY;

-- Policy: users can only read/write their own sessions
CREATE POLICY "Users manage own sessions"
  ON public.sessions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: users can only read/write routes that belong to their sessions
CREATE POLICY "Users manage own routes"
  ON public.routes FOR ALL
  USING (
    session_id IN (
      SELECT id FROM public.sessions WHERE user_id = auth.uid()
    )
  );

-- Policy: users can only read/write photo metadata for their own sessions
CREATE POLICY "Users manage own session photos"
  ON public.session_photos FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create a private Storage bucket for local-first session photos.
-- Optional: run this once if the bucket has not already been created in Supabase Dashboard → Storage.
INSERT INTO storage.buckets (id, name, public)
VALUES ('session-photos', 'session-photos', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for authenticated users. Files are written under: {user_id}/{session_id}/{file_name}.
CREATE POLICY "Users upload own session photo files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'session-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users read own session photo files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'session-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users update own session photo files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'session-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'session-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users delete own session photo files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'session-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
