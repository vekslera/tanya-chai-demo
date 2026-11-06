// Loads every layer of one chapter from the files named in texts.config.json.
import type {
  DailySchedule,
  GlossaryEntry,
  Portion,
  TranslationSpan,
  UnitContent,
} from '../../src/domain/types.ts';
import { config, pathOf, type ChapterRef } from './config.ts';
import { parseEnglish, type ParsedEnglish } from './english.ts';
import type { Files } from './env.ts';
import { buildUnits, type Split } from './units.ts';

export type ChapterLayers = ChapterRef &
  ReturnType<typeof buildUnits> & {
    splits: Split[];
    schedule: DailySchedule;
    translations: TranslationSpan[] | null;
    enResource: ParsedEnglish | null;
    unitContent: UnitContent[];
    glossary: GlossaryEntry[];
    portion: Portion | null;
  };

/** Every layer of a chapter (by default the demo chapter, the first in texts.config.json). */
export function loadChapter(files: Files, ch: ChapterRef = config.chapters[0]!): ChapterLayers {
  const at = (key: string) => pathOf(key, ch);
  const json = (key: string) => JSON.parse(files.read(at(key)));
  const optional = <T>(key: string, fallback: T, parse: (rel: string) => T): T =>
    files.exists(at(key)) ? parse(at(key)) : fallback;
  const splits: Split[] = json('splits');
  return {
    ...ch,
    splits,
    ...buildUnits({ raw: files.read(at('text.he')), splits, ...ch }),
    schedule: json('schedule'),
    translations: optional('translations', null, (rel) => JSON.parse(files.read(rel))),
    enResource: optional('text.en', null, (rel) => parseEnglish(files.read(rel))),
    unitContent: optional('unitContent', [], (rel) => JSON.parse(files.read(rel))),
    glossary: optional('glossary', [], (rel) => JSON.parse(files.read(rel))),
    portion: optional('portion', null, (rel) => JSON.parse(files.read(rel))),
  };
}
