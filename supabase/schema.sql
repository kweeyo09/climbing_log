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

-- Indexes for fast lookups
CREATE INDEX idx_sessions_user_date ON public.sessions(user_id, date DESC);
CREATE INDEX idx_routes_session     ON public.routes(session_id);

-- Enable Row Level Security on both tables
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes   ENABLE ROW LEVEL SECURITY;

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
