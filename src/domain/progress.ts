// The learner's progress, and what completing a level or Avos uBanim awards (SPEC §5.3).
import type { ScoringRules } from './scoring.ts';
import type { Level, Track } from './types.ts';

export type Progress = {
  streak: number;
  points: number;
  heartProgress: number;
  completedLevels: Level[];
  completedTogether: boolean;
  familyStreak: number;
};

export type Completion = {
  track: Track;
  level?: Level;
  earned: number;
  bonus: number;
  /** False when this level (or Avos uBanim) was already completed: nothing is awarded twice. */
  awarded: boolean;
  before: Progress;
  after: Progress;
};

/**
 * Completing a level, or Avos uBanim, for the first time awards the points and the bonus,
 * advances the heart (up to its maximum), and increments the streak once per session, not per
 * level. Avos uBanim also increments the family streak.
 */
export function complete(
  p: Progress,
  track: Track,
  level: Level | undefined,
  earned: number,
  rules: ScoringRules,
): { progress: Progress; completion: Completion } {
  const solo = track === 'solo';
  const already = solo ? p.completedLevels.includes(level!) : p.completedTogether;
  if (already) {
    return {
      progress: p,
      completion: { track, level, earned, bonus: 0, awarded: false, before: p, after: p },
    };
  }
  const firstOfSession = p.completedLevels.length === 0 && !p.completedTogether;
  const after: Progress = {
    streak: firstOfSession ? p.streak + 1 : p.streak,
    points: p.points + earned + rules.completionBonus,
    heartProgress: Math.min(rules.heartMax, p.heartProgress + rules.heartStep),
    completedLevels: solo ? [...p.completedLevels, level!] : p.completedLevels,
    completedTogether: solo ? p.completedTogether : true,
    familyStreak: solo ? p.familyStreak : p.familyStreak + 1,
  };
  return {
    progress: after,
    completion: {
      track,
      level,
      earned,
      bonus: rules.completionBonus,
      awarded: true,
      before: p,
      after,
    },
  };
}
