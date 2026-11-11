// Seeded shuffling, so a reload does not reorder the options a learner is looking at.

const SEED_RANGE = 2 ** 31;

/** Deterministic PRNG (mulberry32). */
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

/** FNV-1a hash of a string. */
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

/** A new session seed. */
export function newSeed(random: () => number = Math.random): number {
  return Math.floor(random() * SEED_RANGE);
}
