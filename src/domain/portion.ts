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
import { chapterKey, unitsIn } from './units.ts';

export type GlossaryMark = { entry: GlossaryEntry; match: string };

export type PortionUnit = Unit & {
  /** The exact text, without the spaces around it. */
  display: string;
  biur?: Reviewed<string>;
  glossary: GlossaryMark[];
};

export type PortionParagraph = {
  /** Unique across chapters, e.g. "LA.32.1". */
  key: string;
  paragraph: number;
  units: PortionUnit[];
  translation?: TranslationSpan;
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
  paragraphs: PortionParagraph[];
  unit: (id: UnitId) => PortionUnit | undefined;
  /** The portion's units within a range, in order. */
  unitsOf: (range: Range) => PortionUnit[];
  /** Items still waiting for approval (the טיוטה badge, SPEC §8.4). */
  unreviewed: number;
};

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
        biur: c?.biur?.[data.language]?.short,
        glossary: (c?.glossary ?? []).flatMap((m) => {
          const entry = glossaryById.get(m.entryId);
          return entry ? [{ entry, match: m.match }] : [];
        }),
      };
    });

  const paragraphs: PortionParagraph[] = [];
  for (const u of portionUnits) {
    const key = paragraphKey(u);
    let p = paragraphs[paragraphs.length - 1];
    if (p?.key !== key) {
      p = { key, paragraph: u.paragraph, units: [], translation: translationOf.get(u.id) };
      paragraphs.push(p);
    }
    p.units.push(u);
  }

  const byId = new Map(portionUnits.map((u) => [u.id, u]));
  return {
    portion,
    units: portionUnits,
    paragraphs,
    unit: (id) => byId.get(id),
    unitsOf: (range) => unitsIn(portionUnits, range),
    unreviewed: unreviewedOf(reviewableItems(data)).length,
  };
}
