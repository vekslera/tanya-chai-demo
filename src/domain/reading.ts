// The reading screen (S3): the levels, the progress and the English.
import type { PortionSection } from './portion.ts';
import type { Level } from './types.ts';

export type LevelRule = { id: Level; showBiur: boolean };

/** Whether a level shows the ביאור; no level shows none. */
export const showsBiur = (levels: readonly LevelRule[], level?: Level) =>
  levels.some((l) => l.id === level && l.showBiur);

/** The level a section's ביאור switch sets (S2): the first that shows the ביאור, or hides it. The
 * levels in app.config.json include both. */
export const levelFor = (levels: readonly LevelRule[], biur: boolean): Level =>
  levels.find((l) => l.showBiur === biur)!.id;

/** Percentage done, rounded: of the questions answered, on the reading screen. */
export const readingProgress = (done: number, total: number) =>
  total === 0 ? 100 : Math.round((done / total) * 100);

/** Whether any of the sections has an English translation. */
export const hasEnglish = (sections: readonly PortionSection[]) =>
  sections.some((s) => s.english.length > 0);
