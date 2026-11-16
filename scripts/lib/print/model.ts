// The integrated ביאור (ביאור משולב) of a portion in one language: each paragraph of the Tanya
// with the ביאור of each unit right after its text, its footnotes, and the sources for the footer.
import {
  footnoteMarks,
  footnoteSegments,
  type FootnoteSegment,
} from '../../../src/domain/footnotes.ts';
import { assemblePortion, sentenceText } from '../../../src/domain/portion.ts';
import type { Portion, Source } from '../../../src/domain/types.ts';
import { en } from '../../../src/strings/en.ts';
import { he } from '../../../src/strings/he.ts';
import { config } from '../config.ts';
import type { ChapterLayers } from '../load.ts';

/** The strings a printed document needs, in its language. */
type PrintStrings = {
  appName: { full: string };
  print: {
    title: string;
    legend: { text: string; biur: string };
    draft: string;
    page: string;
    sourceCredit: (s: Source) => string;
    contentCredit: string;
  };
};

export const PRINT_STRINGS: Record<string, PrintStrings> = { he, en };

export type PrintUnit = { text: FootnoteSegment[]; biur?: string };

export type PrintModel = {
  title: string;
  subtitle: string;
  legend: { text: string; biur: string };
  /** The draft notice while any ביאור of the portion waits for approval. */
  draft: string | null;
  paragraphs: PrintUnit[][];
  /** The footnotes marked in the portion's text, by number. */
  footnotes: Record<string, string>;
  credits: string[];
  page: string;
};

export function printModel(
  all: ChapterLayers,
  portion: Portion,
  language: string,
  version = (config.sefaria.versions as Record<string, string | undefined>)[language],
): PrintModel {
  const strings = PRINT_STRINGS[language];
  const text = all.texts[language];
  if (!strings || !text) throw new Error(`print: no ${language} strings or text`);
  const { print, appName } = strings;
  const { units, sentences, paragraphs } = assemblePortion({
    ...all,
    units: text.units,
    language,
    portion,
    translations: [],
  });
  const marked = units.flatMap((u) => footnoteMarks(u.display)).filter((n) => n in text.footnotes);
  const source = portion.sources.find((s) => s.versionTitle === version);
  const inLanguage = (t: Record<string, string>) => t[language] ?? '';
  return {
    title: `${appName.full}: ${print.title}`,
    subtitle: `${inLanguage(portion.location)} · ${inLanguage(portion.label)}`,
    legend: print.legend,
    draft: sentences.some((s) => s.biur && !s.biur.reviewed) ? print.draft : null,
    paragraphs: paragraphs.map((p) =>
      p.sentences.map((s) => ({
        text: footnoteSegments(sentenceText(s), text.footnotes),
        ...(s.biur ? { biur: s.biur.value } : {}),
      })),
    ),
    footnotes: Object.fromEntries(marked.map((n) => [n, text.footnotes[n]!])),
    credits: [...(source ? [print.sourceCredit(source)] : []), print.contentCredit],
    page: print.page,
  };
}
