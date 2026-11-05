// Points for answers and completions (SPEC §3.1, §5.3).

export type ScoringRules = {
  /** Points for a correct answer on attempt 1, 2, …; later attempts earn nothing. */
  pointsByAttempt: readonly number[];
  completionBonus: number;
  /** How far the heart's contour advances on a completion, and its maximum. */
  heartStep: number;
  heartMax: number;
};

/** Points for a correct answer on the given attempt (1-based). */
export function pointsFor(attempt: number, rules: Pick<ScoringRules, 'pointsByAttempt'>): number {
  return rules.pointsByAttempt[attempt - 1] ?? 0;
}
