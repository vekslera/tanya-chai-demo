// Checks of the learning content attached to units: the glossary and the ביאור. A sentence's
// ביאור is kept on its first unit (SPEC §6.2).
import type { ContentRules } from '../config.ts';
import { isReviewed, wordCount, type Context } from './context.ts';

export function checkGlossary(ctx: Context): Set<string> {
  const ids = new Set<string>();
  for (const g of ctx.all.glossary) {
    if (ids.has(g.id)) ctx.errors.push(`glossary: duplicate id ${g.id}`);
    ids.add(g.id);
    if (!g.term) ctx.errors.push(`glossary ${g.id}: no term`);
    if (!isReviewed(g.body)) ctx.errors.push(`glossary ${g.id}: body is not a Reviewed<string>`);
  }
  return ids;
}

export function checkUnitContent(ctx: Context, glossaryIds: Set<string>, rules: ContentRules) {
  const ids = new Set<string>();
  for (const c of ctx.all.unitContent) {
    const where = `content ${c.id}`;
    const known = ctx.unitRef('content', c.id);
    if (ids.has(c.id)) ctx.errors.push(`content: duplicate ${c.id}`);
    ids.add(c.id);
    const continued = known ? ctx.byId.get(c.id)!.sentence : undefined;
    if (continued && c.biur) {
      ctx.errors.push(`${where}: continues ${continued}'s sentence; its ביאור belongs there`);
    }
    // A longer sentence may have a longer ביאור: the limit is per unit.
    const units = ctx.sentenceSize.get(c.id) ?? 1;
    for (const [language, b] of Object.entries(c.biur ?? {})) {
      const biur = b.short;
      const perUnit = rules.biurMaxWords[language];
      const max = perUnit === undefined ? undefined : perUnit * units;
      if (max === undefined) ctx.errors.push(`${where}: biur in an unknown language "${language}"`);
      else if (biur && !isReviewed(biur)) {
        ctx.errors.push(`${where}: biur.${language} is not a Reviewed<string>`);
      } else if (biur && wordCount(biur.value) > max) {
        ctx.warnings.push(
          `${where}: biur.${language} has ${wordCount(biur.value)} words (max ${max})`,
        );
      }
    }
    for (const m of c.glossary ?? []) {
      if (!glossaryIds.has(m.entryId)) {
        ctx.errors.push(`${where}: unknown glossary entry ${m.entryId}`);
      }
      if (known && !ctx.byId.get(c.id)!.text.includes(m.match)) {
        ctx.errors.push(`${where}: glossary match "${m.match}" not in the unit text`);
      }
    }
  }
}
