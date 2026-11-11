// Assembles a daily portion from its layers (SPEC §6.5): the schedule picks the units, and the
// learning content and translations attach to them by unit ID. Pure: the data is passed in.
import { reviewableItems, unreviewedOf } from './reviewable.ts';
import type {
  DailySchedule,
  GlossaryEntry,
  Portion,
  Range,
  Reviewed,
  TranslationSpan,
  Unit,
  UnitContent,
  UnitId,
} from './types.ts';
import { chapterKey, sentenceOf, unitsIn } from './units.ts';

export type GlossaryMark = { entry: GlossaryEntry; match: string };

export type PortionUnit = Unit & {
  /** The exact text, without the spaces around it. */
  display: string;
  glossary: GlossaryMark[];
};

/** A sentence of the text: one unit, or consecutive units of a paragraph, and its ביאור. */
export type PortionSentence = {
  /** Its first unit's ID. */
  id: UnitId;
  units: PortionUnit[];
  /** The ביאור of the whole sentence, kept on its first unit. */
  biur?: Reviewed<string>;
};

export type PortionParagraph = {
  /** Unique across chapters, e.g. "LA.32.1". */
  key: string;
  paragraph: number;
  units: PortionUnit[];
  sentences: PortionSentence[];
};

/** A short section of the portion: its text, sentence by sentence, and its English. */
export type PortionSection = {
  /** Its first unit's ID. */
  id: UnitId;
  units: PortionUnit[];
  /** Its part of each paragraph it touches. */
  paragraphs: PortionParagraph[];
  sentences: PortionSentence[];
  /** The English of its units, in order; empty without a translation. */
  english: TranslationSpan[];
};

/** Everything a portion is assembled from. `units` and `translations` cover its chapters. */
export type PortionData = {
  /** The language of the ביאור to attach. */
  language: string;
  portion: Portion;
  schedule: DailySchedule;
  units: Unit[];
  translations: TranslationSpan[];
  unitContent: UnitContent[];
  glossary: GlossaryEntry[];
};

export type AssembledPortion = {
  portion: Portion;
  units: PortionUnit[];
  sentences: PortionSentence[];
  paragraphs: PortionParagraph[];
  sections: PortionSection[];
  unit: (id: UnitId) => PortionUnit | undefined;
  /** The sentence a unit belongs to. */
  sentenceOf: (id: UnitId) => PortionSentence | undefined;
  /** The portion's units within a range, in order. */
  unitsOf: (range: Range) => PortionUnit[];
  /** Items still waiting for approval (the טיוטה badge, SPEC §8.4). */
  unreviewed: number;
};

/** What separates a unit from the next one in its paragraph: a space, or nothing (after "—"). */
export const spaceAfter = (u: Unit) => (/\s$/.test(u.text) ? ' ' : '');

/** A sentence's text, exactly as in the resource. */
export const sentenceText = (s: PortionSentence) =>
  s.units
    .map((u) => u.text)
    .join('')
    .trim();

/** The key of a unit's paragraph, unique across chapters. */
export const paragraphKey = (u: Unit) => `${chapterKey(u)}.${u.paragraph}`;

/** The ranges of the portion's day in the schedule. */
export function portionRanges(portion: Portion, schedule: DailySchedule): Range[] {
  const ranges = schedule[portion.yearType][portion.dateKey];
  if (!ranges) throw new Error(`No schedule entry for ${portion.yearType}.${portion.dateKey}`);
  return ranges;
}

export function assemblePortion(data: PortionData): AssembledPortion {
  const { portion, units } = data;
  const contentById = new Map(data.unitContent.map((c) => [c.id, c]));
  const glossaryById = new Map(data.glossary.map((g) => [g.id, g]));
  const translationOf = new Map<UnitId, TranslationSpan>();
  for (const span of data.translations) {
    for (const u of unitsIn(units, span)) translationOf.set(u.id, span);
  }

  const portionUnits = portionRanges(portion, data.schedule)
    .flatMap((r) => unitsIn(units, r))
    .map((u): PortionUnit => {
      const c = contentById.get(u.id);
      return {
        ...u,
        display: u.text.trim(),
        glossary: (c?.glossary ?? []).flatMap((m) => {
          const entry = glossaryById.get(m.entryId);
          return entry ? [{ entry, match: m.match }] : [];
        }),
      };
    });

  const paragraphs: PortionParagraph[] = [];
  const sentences: PortionSentence[] = [];
  for (const u of portionUnits) {
    const key = paragraphKey(u);
    let p = paragraphs[paragraphs.length - 1];
    if (p?.key !== key) {
      p = { key, paragraph: u.paragraph, units: [], sentences: [] };
      paragraphs.push(p);
    }
    p.units.push(u);
    const id = sentenceOf(u);
    let s = p.sentences[p.sentences.length - 1];
    if (s?.id !== id) {
      s = { id, units: [], biur: contentById.get(id)?.biur?.[data.language]?.short };
      p.sentences.push(s);
      sentences.push(s);
    }
    s.units.push(u);
  }

  const sections = portion.sections.map((range): PortionSection => {
    const units = unitsIn(portionUnits, range);
    const inSection = new Set(units.map((u) => u.id));
    const parts = paragraphs
      .map((x) => ({
        ...x,
        units: x.units.filter((u) => inSection.has(u.id)),
        sentences: x.sentences.filter((s) => inSection.has(s.id)),
      }))
      .filter((x) => x.units.length > 0);
    const english = [...new Set(units.flatMap((u) => translationOf.get(u.id) ?? []))];
    return {
      id: units[0]!.id,
      units,
      paragraphs: parts,
      sentences: parts.flatMap((x) => x.sentences),
      english,
    };
  });

  const byId = new Map(portionUnits.map((u) => [u.id, u]));
  const sentenceById = new Map(sentences.flatMap((s) => s.units.map((u) => [u.id, s] as const)));
  return {
    portion,
    units: portionUnits,
    sentences,
    paragraphs,
    sections,
    unit: (id) => byId.get(id),
    sentenceOf: (id) => sentenceById.get(id),
    unitsOf: (range) => unitsIn(portionUnits, range),
    unreviewed: unreviewedOf(reviewableItems(data)).length,
  };
}
