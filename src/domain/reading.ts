// The reading screen (S3): which units were seen, and when the questions open.
import type { PortionSection } from './portion.ts';
import type { Level } from './types.ts';

export type LevelRule = { id: Level; showBiur: boolean };

export const showsBiur = (levels: readonly LevelRule[], level: Level) =>
  levels.some((l) => l.id === level && l.showBiur);

/** Percentage of units seen, rounded. */
export const readingProgress = (seen: number, total: number) =>
  total === 0 ? 100 : Math.round((seen / total) * 100);

/** The questions open once the last unit was seen, or after the reading time has passed. */
export const isUnlocked = (timeUp: boolean, seen: ReadonlySet<string>, lastUnit: string) =>
  timeUp || seen.has(lastUnit);

/** The sections that have an English translation, by ID. */
export const englishSectionIds = (sections: readonly PortionSection[]) =>
  sections.flatMap((s) => (s.english.length ? [s.id] : []));
