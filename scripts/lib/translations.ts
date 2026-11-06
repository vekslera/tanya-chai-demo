// The English resource → translation spans (SPEC §6.4): line N of the English covers paragraph N
// of the Hebrew, with the footnotes it marks.
import { footnoteMarks } from '../../src/domain/footnotes.ts';
import type { TranslationSpan, Unit } from '../../src/domain/types.ts';
import type { ParsedEnglish } from './english.ts';

/** The source ID of spans taken from the English resource file. */
export const EN_RESOURCE = 'en-resource';

export function translationSpans(
  units: Unit[],
  hebrewParagraphs: number,
  english: ParsedEnglish,
): { spans: TranslationSpan[] } | { error: string } {
  if (english.paragraphs.length !== hebrewParagraphs) {
    return {
      error: `the English has ${english.paragraphs.length} paragraphs, the Hebrew ${hebrewParagraphs}. Ask Alex how to align them.`,
    };
  }
  const spans = english.paragraphs.map((text, i): TranslationSpan => {
    const inParagraph = units.filter((u) => u.paragraph === i + 1);
    const marks = footnoteMarks(text).filter((n) => n in english.footnotes);
    return {
      from: inParagraph[0]!.id,
      to: inParagraph[inParagraph.length - 1]!.id,
      text,
      sourceId: EN_RESOURCE,
      ...(marks.length
        ? { footnotes: Object.fromEntries(marks.map((n) => [n, english.footnotes[n]!])) }
        : {}),
    };
  });
  return { spans };
}
