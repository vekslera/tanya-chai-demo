// The text and content files bundled at build time (texts.vite.ts serves them as `virtual:texts`,
// at the paths named in texts.config.json). Nothing is fetched at runtime.
import * as bundle from 'virtual:texts';
import { chapterKey } from '../domain/units';
import type {
  ChapterRef,
  DailySchedule,
  GlossaryEntry,
  Portion,
  TranslationSpan,
  Unit,
  UnitContent,
} from '../domain/types';
import type { LearningContentSource, TextSource } from '../ports';

/** The shape of `virtual:texts`: per-chapter files are keyed by chapterKey ("LA.32"). */
export type Bundle = {
  units: Record<string, unknown>;
  translations: Record<string, unknown>;
  unitContent: Record<string, unknown>;
  schedule: unknown;
  glossary: unknown;
  portion: unknown;
};

function chapterFile<T>(files: Record<string, unknown>, ch: ChapterRef, what: string): T {
  const file = files[chapterKey(ch)];
  if (file === undefined) throw new Error(`No ${what} bundled for ${chapterKey(ch)}`);
  return file as T;
}

export function bundledTextSource(b: Bundle = bundle): TextSource {
  return {
    units: async (ch) => chapterFile<Unit[]>(b.units, ch, 'units'),
    // A chapter without an English translation shows the Hebrew alone.
    translations: async (ch) => (b.translations[chapterKey(ch)] ?? []) as TranslationSpan[],
  };
}

export function bundledContentSource(b: Bundle = bundle): LearningContentSource {
  return {
    schedule: async () => b.schedule as DailySchedule,
    portion: async () => b.portion as Portion,
    unitContent: async (ch) => (b.unitContent[chapterKey(ch)] ?? []) as UnitContent[],
    glossary: async () => b.glossary as GlossaryEntry[],
  };
}
