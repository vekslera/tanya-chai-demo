// The English text → translation spans (SPEC §6.4): one span per unit, from the English units
// (anchored by data/splits/en/ under the same IDs as the Hebrew), with the footnotes it marks.
import { footnoteMarks } from '../../src/domain/footnotes.ts';
import type { TranslationSpan, Unit } from '../../src/domain/types.ts';
import type { TextLayer } from './load.ts';

/** The source ID of spans taken from the English resource file. */
export const EN_RESOURCE = 'en-resource';

export function translationSpans(
  units: Unit[],
  english: TextLayer,
): { spans: TranslationSpan[] } | { error: string } {
  const ids = (us: Unit[]) => us.map((u) => u.id).join();
  if (ids(english.units) !== ids(units)) {
    return { error: 'the English units do not have the same IDs as the Hebrew units' };
  }
  // Each span keeps its unit's exact text, spaces included, so spans join back to the English.
  const spans = english.units.map((u): TranslationSpan => {
    const text = u.text;
    const marks = footnoteMarks(text).filter((n) => n in english.footnotes);
    return {
      from: u.id,
      to: u.id,
      text,
      sourceId: EN_RESOURCE,
      ...(marks.length
        ? { footnotes: Object.fromEntries(marks.map((n) => [n, english.footnotes[n]!])) }
        : {}),
    };
  });
  return { spans };
}
