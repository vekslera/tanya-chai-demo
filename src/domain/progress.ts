// The learner's progress, and what completing the lesson or Avos uBanim awards (SPEC §5.3). The
// demo is built to be used many times: every completion awards its points.
import type { ScoringRules } from './scoring.ts';
import type { Track } from './types.ts';

export type Progress = {
  streak: number;
  points: number;
  heartProgress: number;
  /** The Matmid lesson was completed, at whatever level its sections were read (S2); the streak
   * counts once, after the first completion of a session. */
  completedSolo: boolean;
  completedTogether: boolean;
  familyStreak: number;
};

export type Completion = {
  track: Track;
  earned: number;
  bonus: number;
  before: Progress;
  after: Progress;
};

/**
 * Completing the lesson, or Avos uBanim, awards the points and the bonus, every time, and advances
 * the heart (up to its maximum). The streak increments once per session, on its first completion.
 * Avos uBanim also increments the family streak.
 */
export function complete(
  p: Progress,
  track: Track,
  earned: number,
  rules: ScoringRules,
): { progress: Progress; completion: Completion } {
  const solo = track === 'solo';
  const firstOfSession = !p.completedSolo && !p.completedTogether;
  const after: Progress = {
    streak: firstOfSession ? p.streak + 1 : p.streak,
    points: p.points + earned + rules.completionBonus,
    heartProgress: Math.min(rules.heartMax, p.heartProgress + rules.heartStep),
    completedSolo: solo || p.completedSolo,
    completedTogether: !solo || p.completedTogether,
    familyStreak: solo ? p.familyStreak : p.familyStreak + 1,
  };
  return {
    progress: after,
    completion: { track, earned, bonus: rules.completionBonus, before: p, after },
  };
}
