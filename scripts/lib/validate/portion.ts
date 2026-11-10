// Checks of the portion file itself: its day in the schedule, its sources, its ביאור coverage.
import type { Portion, Unit } from '../../../src/domain/types.ts';
import { pathOf } from '../config.ts';
import type { Context } from './context.ts';

/** The portion and its units, or null (with an error) when it cannot be placed. */
export function checkPortion(ctx: Context): { p: Portion; units: Unit[] } | null {
  const { all } = ctx;
  const p = all.portion;
  if (!p) {
    ctx.errors.push(`${pathOf('portion', all)} is missing`);
    return null;
  }
  const ranges = all.schedule[p.yearType]?.[p.dateKey];
  if (!ranges || !ranges.every((r, i) => ctx.range(`portion range ${i}`, r))) {
    ctx.errors.push(`portion: no usable schedule entry ${p.yearType}.${p.dateKey}`);
    return null;
  }
  const units = ranges.flatMap(ctx.unitsOf);
  if (!p.boundariesConfirmed) ctx.warnings.push('portion: boundaries not confirmed');
  for (const u of units) {
    const biur = all.unitContent.find((c) => c.id === u.id)?.biur;
    for (const language of Object.keys(all.texts)) {
      if (!biur?.[language]?.short) {
        ctx.warnings.push(`content: ${u.id} has no short biur in "${language}"`);
      }
    }
  }
  checkSources(ctx, p);
  return { p, units };
}

/** Every source needs a license and an attribution; every shown English needs its source. */
function checkSources(ctx: Context, p: Portion) {
  for (const s of p.sources ?? []) {
    if (!s.license || !s.attribution) {
      ctx.errors.push(`source ${s.id}: license and attribution are required`);
    }
  }
  const shown = new Set((ctx.all.translations ?? []).map((s) => s.sourceId));
  for (const id of shown) {
    if (!(p.sources ?? []).some((s) => s.id === id)) {
      ctx.errors.push(`portion: the English is shown but source "${id}" has no attribution`);
    }
  }
}
