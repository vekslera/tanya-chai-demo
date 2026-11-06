// Checks of the text layers: the schedule and the English translation.
import { footnoteMarks } from '../../../src/domain/footnotes.ts';
import { YEAR_TYPES, type TranslationSpan } from '../../../src/domain/types.ts';
import { pathOf } from '../config.ts';
import { EN_RESOURCE } from '../translations.ts';
import type { Context } from './context.ts';

export function checkSchedule(ctx: Context) {
  for (const yearType of YEAR_TYPES) {
    for (const [key, ranges] of Object.entries(ctx.all.schedule[yearType] ?? {})) {
      ranges.forEach((r, i) => ctx.range(`schedule ${yearType}.${key}[${i}]`, r));
    }
  }
}

function checkSpan(ctx: Context, s: TranslationSpan, where: string) {
  const en = ctx.all.enResource;
  if (typeof s.text !== 'string' || !s.text.trim()) ctx.errors.push(`${where}: empty text`);
  else if (/<[^>]+>/.test(s.text)) ctx.errors.push(`${where}: contains HTML tags`);
  if (s.sourceId === EN_RESOURCE && en && !en.paragraphs.includes(s.text)) {
    ctx.errors.push(`${where}: text is not verbatim from the English resource`);
  }
  const marks = footnoteMarks(s.text ?? '');
  for (const n of marks) {
    if (!s.footnotes?.[n]) ctx.errors.push(`${where}: footnote mark [${n}] has no footnote`);
    else if (en && en.footnotes[n] !== s.footnotes[n]) {
      ctx.errors.push(`${where}: footnote [${n}] is not verbatim from the English resource`);
    }
  }
  for (const n of Object.keys(s.footnotes ?? {})) {
    if (!marks.includes(n)) ctx.errors.push(`${where}: footnote [${n}] is not marked in the text`);
  }
}

/** The English covers each unit of the chapter exactly once, verbatim from the resource. */
export function checkTranslations(ctx: Context, strict: boolean) {
  const { all } = ctx;
  if (all.enResource?.errors.length) {
    ctx.errors.push(...all.enResource.errors.map((e) => `English resource: ${e}`));
  }
  if (!all.translations) {
    (strict ? ctx.errors : ctx.warnings).push(
      `no English translation yet (${pathOf('translations', all)})`,
    );
    return;
  }
  const covered = new Map<string, number>();
  all.translations.forEach((s, i) => {
    const where = `translation[${i}]`;
    checkSpan(ctx, s, where);
    if (!ctx.range(where, s)) return;
    for (const u of ctx.unitsOf(s)) covered.set(u.id, (covered.get(u.id) ?? 0) + 1);
  });
  for (const u of all.units) {
    const n = covered.get(u.id) ?? 0;
    if (n !== 1) ctx.errors.push(`translation: ${u.id} covered ${n} times`);
  }
}
