import type { GradeSystem } from '../types';

export const FRENCH_GRADES = [
  '5', '5+', '6a', '6a+', '6b', '6b+', '6c', '6c+',
  '7a', '7a+', '7b', '7b+', '7c', '7c+',
  '8a', '8a+', '8b', '8b+', '8c',
];

export const V_GRADES = [
  'VB', 'V0', 'V1', 'V2', 'V3', 'V4', 'V5',
  'V6', 'V7', 'V8', 'V9', 'V10', 'V11', 'V12',
];

export const CLIMB_STYLES = ['Lead', 'Top Rope', 'Boulder', 'Auto-belay'] as const;

export const getGrades = (system: GradeSystem) =>
  system === 'french' ? FRENCH_GRADES : V_GRADES;

export const getTopGrade = (
  routes: Array<{ grade: string; completed: boolean }>,
  system: GradeSystem,
): string | null => {
  const completed = routes.filter(r => r.completed);
  if (!completed.length) return null;
  const grades = getGrades(system);
  return completed.reduce((best, r) =>
    grades.indexOf(r.grade) > grades.indexOf(best) ? r.grade : best,
    completed[0].grade,
  );
};
