// The reading screen (S3): the levels, the progress and the English.
import type { PortionSection } from './portion.ts';
import type { Level } from './types.ts';

export type LevelRule = { id: Level; showBiur: boolean };

export const showsBiur = (levels: readonly LevelRule[], level: Level) =>
  levels.some((l) => l.id === level && l.showBiur);

/** Percentage done, rounded: of the questions answered, on the reading screen. */
export const readingProgress = (done: number, total: number) =>
  total === 0 ? 100 : Math.round((done / total) * 100);

/** The sections that have an English translation, by ID. */
export const englishSectionIds = (sections: readonly PortionSection[]) =>
  sections.flatMap((s) => (s.english.length ? [s.id] : []));
