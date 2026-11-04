// Assembles a portion from the schedule, units, translations and learning content (SPEC §6.5).
// Everything is bundled at build time; nothing is fetched at runtime.
import unitsJson from '../../data/units/he/LA/32.json';
import scheduleJson from '../../data/schedules/daily.json';
import unitContentJson from '../../content/LA/32.json';
import glossaryJson from '../../content/glossary.json';
import portionJson from '../../content/portions/adar-09.json';
import type {
  DailySchedule,
  GlossaryEntry,
  Portion,
  Reviewed,
  TranslationSpan,
  Unit,
  UnitContent,
  UnitId,
} from './types';

// The English is optional until Alex adds it: a glob over a missing file yields nothing.
const translationModules = import.meta.glob<TranslationSpan[]>(
  '../../data/translations/en/LA/*.json',
  { eager: true, import: 'default' },
);

export type GlossaryMark = { entry: GlossaryEntry; match: string };

export type PortionUnit = Unit & {
  display: string;
  biur?: Reviewed<string>;
  glossary: GlossaryMark[];
};

export type PortionParagraph = {
  paragraph: number;
  units: PortionUnit[];
  translation?: TranslationSpan;
};

export type AssembledPortion = {
  portion: Portion;
  units: PortionUnit[];
  paragraphs: PortionParagraph[];
  unit: (id: UnitId) => PortionUnit | undefined;
  glossary: GlossaryEntry[];
};

/** Reviewable items still marked reviewed: false (SPEC §8.4: the טיוטה badge in About). */
export function unreviewedCount(): number {
  const portion = portionJson as Portion;
  const items: (Reviewed<string> | undefined)[] = [
    ...(unitContentJson as UnitContent[]).map((c) => c.biur?.short),
    ...(glossaryJson as GlossaryEntry[]).map((g) => g.body),
    ...portion.questions.flatMap((q) => [q.prompt, q.hint, q.explanation]),
    ...portion.together.flatMap((c) => [c.forParent, c.toChild, c.talk]),
  ];
  return items.filter((r) => r && !r.reviewed).length;
}

export function assemblePortion(): AssembledPortion {
  const portion = portionJson as Portion;
  const schedule = scheduleJson as DailySchedule;
  const units = unitsJson as Unit[];
  const glossary = glossaryJson as GlossaryEntry[];
  const contentById = new Map((unitContentJson as UnitContent[]).map((c) => [c.id, c]));
  const glossaryById = new Map(glossary.map((g) => [g.id, g]));
  const seqOf = new Map(units.map((u) => [u.id, u.seq]));
  const translations = Object.values(translationModules).flat();

  const ranges = schedule[portion.yearType][portion.dateKey];
  if (!ranges) throw new Error(`No schedule entry for ${portion.dateKey}`);

  const portionUnits: PortionUnit[] = ranges.flatMap(({ from, to }) => {
    const lo = seqOf.get(from);
    const hi = seqOf.get(to);
    if (lo === undefined || hi === undefined) throw new Error(`Unknown range ${from}–${to}`);
    return units
      .filter((u) => u.seq >= lo && u.seq <= hi)
      .map((u) => {
        const c = contentById.get(u.id);
        return {
          ...u,
          display: u.text.trim(),
          biur: c?.biur?.short,
          glossary: (c?.glossary ?? []).flatMap((m) => {
            const entry = glossaryById.get(m.entryId);
            return entry ? [{ entry, match: m.match }] : [];
          }),
        };
      });
  });

  const paragraphs: PortionParagraph[] = [];
  for (const u of portionUnits) {
    let p = paragraphs[paragraphs.length - 1];
    if (!p || p.paragraph !== u.paragraph) {
      const translation = translations.find((t) => {
        const lo = seqOf.get(t.from) ?? Infinity;
        const hi = seqOf.get(t.to) ?? -Infinity;
        return u.seq >= lo && u.seq <= hi;
      });
      p = { paragraph: u.paragraph, units: [], translation };
      paragraphs.push(p);
    }
    p.units.push(u);
  }

  const byId = new Map(portionUnits.map((u) => [u.id, u]));
  return { portion, units: portionUnits, paragraphs, unit: (id) => byId.get(id), glossary };
}
