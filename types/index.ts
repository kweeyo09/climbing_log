export type GradeSystem = 'french' | 'v';

export type ClimbStyle = 'Lead' | 'Top Rope' | 'Boulder' | 'Auto-belay';

export interface Route {
  id: string;
  session_id: string;
  grade: string;
  style: ClimbStyle;
  completed: boolean;
}

export interface Session {
  id: string;
  user_id?: string;
  date: string;          // YYYY-MM-DD
  location: string;
  duration: number;      // minutes
  grade_system: GradeSystem;
  reflections: string;
  photo_uri?: string | null;
  routes: Route[];
  created_at: string;
  synced?: boolean;
}

// Used when creating a new session (before id/created_at are generated)
export type NewSessionInput = {
  date: string;
  location: string;
  duration: number;
  grade_system: GradeSystem;
  reflections: string;
  photo_uri?: string | null;
  routes: Array<Omit<Route, 'id' | 'session_id'>>;
};
