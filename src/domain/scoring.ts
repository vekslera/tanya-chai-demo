// Points for answers and completions (SPEC §3.1, §5.3).
import type { Level } from './types.ts';

export type ScoringRules = {
  /** Points for a correct answer on attempt 1, 2, …; later attempts earn nothing. */
  pointsByAttempt: readonly number[];
  /** What a question's points are multiplied by, by its level (S4); 1 for a level not listed. */
  levelFactor: Readonly<Record<string, number>>;
  completionBonus: number;
  /** How far the heart's contour advances on a completion, and its maximum. */
  heartStep: number;
  heartMax: number;
};

/** What a question of `level` multiplies its points by; a question without a level, 1. */
export const factorFor = (level: Level | undefined, rules: Pick<ScoringRules, 'levelFactor'>) =>
  (level !== undefined && rules.levelFactor[level]) || 1;

/** Points for a correct answer on the given attempt (1-based), on a question of `level`. */
export function pointsFor(
  attempt: number,
  rules: Pick<ScoringRules, 'pointsByAttempt' | 'levelFactor'>,
  level?: Level,
): number {
  return (rules.pointsByAttempt[attempt - 1] ?? 0) * factorFor(level, rules);
}
