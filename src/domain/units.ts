// Unit IDs and ranges of units (SPEC §6.1). Pure: no React, no DOM.
import type { ChapterRef, Range, Unit, UnitId } from './types.ts';

/** "LA.32.001", or "LA.32.007a" after a later split. */
export const UNIT_ID = /^([A-Z]{2})\.(\d+)\.(\d{3})([a-z]?)$/;

/** The chapter a unit belongs to, read from its ID. */
export function chapterOf(id: UnitId): ChapterRef {
  const m = UNIT_ID.exec(id);
  if (!m) throw new Error(`Malformed unit ID: ${id}`);
  return { part: m[1]!, chapter: Number(m[2]) };
}

export const chapterKey = ({ part, chapter }: ChapterRef) => `${part}.${chapter}`;

/** The distinct chapters that a list of ranges touches, in order. */
export function chaptersOf(ranges: readonly Range[]): ChapterRef[] {
  const out = new Map<string, ChapterRef>();
  for (const r of ranges) {
    for (const id of [r.from, r.to]) {
      const ch = chapterOf(id);
      out.set(chapterKey(ch), ch);
    }
  }
  return [...out.values()];
}

/** The ID of a unit's sentence: its first unit's (SPEC §6.2). */
export const sentenceOf = (u: Unit): UnitId => u.sentence ?? u.id;

/** The units from `range.from` to `range.to`, inclusive, in reading order. */
export function unitsIn<U extends Unit>(units: readonly U[], range: Range): U[] {
  const seqOf = (id: UnitId) => units.find((u) => u.id === id)?.seq;
  const lo = seqOf(range.from);
  const hi = seqOf(range.to);
  if (lo === undefined || hi === undefined) {
    throw new Error(`Unknown range ${range.from}–${range.to}`);
  }
  return units.filter((u) => u.seq >= lo && u.seq <= hi);
}
