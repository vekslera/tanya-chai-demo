// The learner's progress, and what completing the lesson or Avos uBanim awards (SPEC §5.3).
import type { ScoringRules } from './scoring.ts';
import type { Track } from './types.ts';

export type Progress = {
  streak: number;
  points: number;
  heartProgress: number;
  /** The Matmid lesson was completed, at whatever level its sections were read (S2). */
  completedSolo: boolean;
  completedTogether: boolean;
  familyStreak: number;
};

export type Completion = {
  track: Track;
  earned: number;
  bonus: number;
  /** False when this track was already completed: nothing is awarded twice. */
  awarded: boolean;
  before: Progress;
  after: Progress;
};

/**
 * Completing the lesson, or Avos uBanim, for the first time awards the points and the bonus,
 * advances the heart (up to its maximum), and increments the streak once per session, not per
 * track. Avos uBanim also increments the family streak.
 */
export function complete(
  p: Progress,
  track: Track,
  earned: number,
  rules: ScoringRules,
): { progress: Progress; completion: Completion } {
  const solo = track === 'solo';
  const already = solo ? p.completedSolo : p.completedTogether;
  if (already) {
    return {
      progress: p,
      completion: { track, earned, bonus: 0, awarded: false, before: p, after: p },
    };
  }
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
    completion: { track, earned, bonus: rules.completionBonus, awarded: true, before: p, after },
  };
}
