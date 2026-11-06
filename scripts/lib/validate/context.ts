// What every check shares: the chapter's layers, the findings so far, and unit lookups.
import type { Range, Reviewed, Unit } from '../../../src/domain/types.ts';
import { unitsIn } from '../../../src/domain/units.ts';
import type { ChapterLayers } from '../load.ts';

export type Findings = { errors: string[]; warnings: string[] };

export function createContext(all: ChapterLayers) {
  const byId = new Map(all.units.map((u) => [u.id, u]));
  const errors: string[] = [];
  const warnings: string[] = [];

  /** Reports an unknown unit; true when the unit exists. */
  const unitRef = (where: string, id: string) => {
    if (!byId.has(id)) errors.push(`${where}: unknown unit ${id}`);
    return byId.has(id);
  };

  /** Reports a range with unknown or reversed ends; true when it is usable. */
  const range = (where: string, r: Range) => {
    const known = [unitRef(where, r.from), unitRef(where, r.to)].every(Boolean);
    if (!known) return false;
    if (byId.get(r.from)!.seq > byId.get(r.to)!.seq) {
      errors.push(`${where}: ${r.from} is after ${r.to}`);
      return false;
    }
    return true;
  };

  return {
    all,
    byId,
    errors,
    warnings,
    unitRef,
    range,
    unitsOf: (r: Range): Unit[] => unitsIn(all.units, r),
  };
}

export type Context = ReturnType<typeof createContext>;

export const isReviewed = (r: unknown): r is Reviewed<string> =>
  !!r &&
  typeof r === 'object' &&
  typeof (r as Reviewed<string>).value === 'string' &&
  typeof (r as Reviewed<string>).reviewed === 'boolean';

export const wordCount = (s: string) => s.trim().split(/\s+/).length;
