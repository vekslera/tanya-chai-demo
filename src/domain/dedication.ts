// The day's dedication (SPEC S3): the demo has several, and shows one of them at a time.
import { seededShuffle } from './shuffle.ts';
import type { Dedication } from './types.ts';

/** The dedication of a lesson: one of the portion's, chosen by a seed; or none. */
export const dedicationFor = (
  dedications: readonly Dedication[] | undefined,
  seed: number,
): Dedication | undefined => seededShuffle(dedications ?? [], seed, 'dedication')[0];
