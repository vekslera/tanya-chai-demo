// What the app needs from the outside world. The app depends on these interfaces only; the
// adapters in src/adapters/ implement them, and src/composition.ts chooses which ones to use.
import type {
  ChapterRef,
  DailySchedule,
  GlossaryEntry,
  Portion,
  TranslationSpan,
  Unit,
  UnitContent,
} from './domain/types';

/** The Tanya text: today bundled files, later possibly the Sefaria API. */
export interface TextSource {
  units(chapter: ChapterRef): Promise<Unit[]>;
  translations(chapter: ChapterRef): Promise<TranslationSpan[]>;
}

/** The schedule and the learning content written for Tanya Chai. */
export interface LearningContentSource {
  schedule(): Promise<DailySchedule>;
  /** The portion to learn now. */
  portion(): Promise<Portion>;
  unitContent(chapter: ChapterRef): Promise<UnitContent[]>;
  glossary(): Promise<GlossaryEntry[]>;
}

/** String storage that may be missing or full: implementations never throw. */
export interface KeyValueStorage {
  get(key: string): string | null;
  set(key: string, value: string): void;
}
