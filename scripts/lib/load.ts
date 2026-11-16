// Loads every layer of one chapter from the files named in texts.config.json.
import type {
  DailySchedule,
  GlossaryEntry,
  Portion,
  TranslationSpan,
  UnitContent,
} from '../../src/domain/types.ts';
import { appLanguage, config, pathOf, textLanguages, type ChapterRef } from './config.ts';
import type { Files } from './env.ts';
import { parseResource, type ParsedResource } from './resource.ts';
import { buildUnits, type Split } from './units.ts';

/** One language's text: its splits, its units, and the footnotes of its resource. */
export type TextLayer = ReturnType<typeof buildUnits> & {
  splits: Split[];
  footnotes: Record<string, string>;
};

/** The units of a chapter in one language, or null when it has no text or no splits. */
export function loadText(files: Files, ch: ChapterRef, language: string): TextLayer | null {
  const text = pathOf(`text.${language}`, ch);
  const splitsFile = pathOf(`splits.${language}`, ch);
  if (!files.exists(text) || !files.exists(splitsFile)) return null;
  const splits: Split[] = JSON.parse(files.read(splitsFile));
  const resource = parseResource(files.read(text));
  const raw = resource.paragraphs.join('\n');
  return { splits, footnotes: resource.footnotes, ...buildUnits({ raw, splits, ...ch, language }) };
}

/**
 * Every language's text of a chapter, by language. The sentences are the app language's (SPEC
 * §6.2): the other languages share its unit IDs, so their units are joined the same way.
 */
export function loadTexts(files: Files, ch: ChapterRef): Record<string, TextLayer> {
  const texts = Object.fromEntries(
    textLanguages.flatMap((l) => {
      const layer = loadText(files, ch, l);
      return layer ? [[l, layer]] : [];
    }),
  );
  const sentenceOf = new Map(
    (texts[appLanguage]?.units ?? []).flatMap((u) => (u.sentence ? [[u.id, u.sentence]] : [])),
  );
  for (const [language, layer] of Object.entries(texts)) {
    if (language === appLanguage) continue;
    layer.units = layer.units.map((u) => {
      const sentence = sentenceOf.get(u.id);
      return sentence ? { ...u, sentence } : u;
    });
  }
  return texts;
}

/** The app's language is at the top level: its units are the ones every layer points into. */
export type ChapterLayers = ChapterRef &
  TextLayer & {
    /** Every language with a text and splits, the app's language included. */
    texts: Record<string, TextLayer>;
    schedule: DailySchedule;
    translations: TranslationSpan[] | null;
    enResource: ParsedResource | null;
    unitContent: UnitContent[];
    glossary: GlossaryEntry[];
    portion: Portion | null;
  };

/** Every layer of a chapter (by default the demo chapter, the first in texts.config.json). */
export function loadChapter(files: Files, ch: ChapterRef = config.chapters[0]!): ChapterLayers {
  const at = (key: string) => pathOf(key, ch);
  const optional = <T>(key: string, fallback: T, parse: (rel: string) => T): T =>
    files.exists(at(key)) ? parse(at(key)) : fallback;
  const texts = loadTexts(files, ch);
  const primary = texts[appLanguage];
  if (!primary) throw new Error(`${ch.part} ${ch.chapter}: no ${appLanguage} text or splits`);
  return {
    ...ch,
    ...primary,
    texts,
    schedule: JSON.parse(files.read(at('schedule'))),
    translations: optional('translations', null, (rel) => JSON.parse(files.read(rel))),
    enResource: optional('text.en', null, (rel) => parseResource(files.read(rel))),
    unitContent: optional('unitContent', [], (rel) => JSON.parse(files.read(rel))),
    glossary: optional('glossary', [], (rel) => JSON.parse(files.read(rel))),
    portion: optional('portion', null, (rel) => JSON.parse(files.read(rel))),
  };
}
