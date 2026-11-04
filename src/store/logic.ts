// Pure demo logic (SPEC §3.1, §5.3): scoring, completion awards and seeded shuffling.

export type Level = 1 | 2;
export type Track = 'solo' | 'together';

export const POINTS_FIRST_TRY = 10;
export const POINTS_SECOND_TRY = 5;
export const COMPLETION_BONUS = 20;
export const HEART_STEP = 3;

/** Points for a correct answer on the given attempt (1-based). */
export function pointsFor(attempt: number): number {
  if (attempt === 1) return POINTS_FIRST_TRY;
  if (attempt === 2) return POINTS_SECOND_TRY;
  return 0;
}

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
 * advances the heart by 3 (capped at 100), and increments the streak once per session, not per
 * level. Avos uBanim also increments the family streak.
 */
export function complete(p: Progress, track: Track, level: Level | undefined, earned: number) {
  const already = track === 'solo' ? p.completedLevels.includes(level!) : p.completedTogether;
  if (already) {
    return {
      progress: p,
      completion: { track, level, earned, bonus: 0, awarded: false, before: p, after: p },
    };
  }
  const firstOfSession = p.completedLevels.length === 0 && !p.completedTogether;
  const after: Progress = {
    streak: firstOfSession ? p.streak + 1 : p.streak,
    points: p.points + earned + COMPLETION_BONUS,
    heartProgress: Math.min(100, p.heartProgress + HEART_STEP),
    completedLevels: track === 'solo' ? [...p.completedLevels, level!] : p.completedLevels,
    completedTogether: track === 'together' ? true : p.completedTogether,
    familyStreak: track === 'together' ? p.familyStreak + 1 : p.familyStreak,
  };
  const completion: Completion = {
    track,
    level,
    earned,
    bonus: COMPLETION_BONUS,
    awarded: true,
    before: p,
    after,
  };
  return { progress: after, completion };
}

/** Deterministic PRNG, so a reload does not reorder the options a user is looking at. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** A shuffled copy, stable for the same seed and key. */
export function seededShuffle<T>(items: readonly T[], seed: number, key: string): T[] {
  const rand = mulberry32(seed ^ hash(key));
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}
