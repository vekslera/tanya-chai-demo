// Reads the two config files: texts.config.json (the texts and every file path) and
// app.config.json (the app's parameters). This is the only place that names them. Used by the
// scripts, and by vite.config.ts to serve both to the app.
import fs from 'node:fs';
import path from 'node:path';

export type ChapterRef = { part: string; chapter: number };
type Range = [min: number, max: number];

export type TextsConfig = {
  chapters: ChapterRef[];
  paths: Record<string, unknown>;
  sefaria: {
    api: string;
    refs: Record<string, string>;
    versions: Record<string, string>;
    allowedLicenses: string[];
  };
};

/** The content rules of app.config.json, checked by the validator (SPEC §6.5). */
export type ContentRules = {
  /** By language: English needs more words than Hebrew for the same ביאור. */
  biurMaxWords: Record<string, number>;
  /** Runs of this many words shared with a reference text are flagged (SPEC §8.3). */
  overlapRunWords: number;
  questions: {
    /** Questions after each section but the last; a summary question follows the last. */
    perSection: number;
    /** By level: the categories its questions may have. */
    levelCategories: Record<string, string[]>;
    together: { category: string; kinds: string[] };
    /** The tracks whose questions are also written in the translation's language. */
    translatedTracks: string[];
  };
  optionCount: Record<string, Range>;
  cards: { count: Range; talks: Range; maxWords: Record<string, number> };
};

/** How one language is printed. */
export type PrintLanguage = {
  /** The language tag Word checks spelling with, e.g. "he-IL". */
  tag: string;
  rtl: boolean;
  /** For each run style, one family of its font stack in tokens.css. */
  fonts: { text: string; biur: string };
};

/** The print section of app.config.json: the printable ביאור משולב. */
export type PrintConfig = {
  /** The ביאור's size; the other sizes keep the tokens' proportions to it. */
  biurPt: number;
  lineSpacing: number;
  paragraphSpacingPt: number;
  /** The languages printed, one document each. */
  languages: Record<string, PrintLanguage>;
};

export const root = path.resolve(import.meta.dirname, '../..');

/** The config files, relative to the repo root. */
export const CONFIG_FILES = { texts: 'texts.config.json', app: 'app.config.json' } as const;

/** Reads a JSON file given relative to the repo root. */
export const readJson = (file: string) =>
  JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));

export const config: TextsConfig = readJson(CONFIG_FILES.texts);
export const appConfig = readJson(CONFIG_FILES.app);
export const contentRules: ContentRules = appConfig.contentRules;
export const printConfig: PrintConfig = appConfig.print;
/** The app's language: its text, its ביאור and its UI. */
export const appLanguage: string = appConfig.language;
/** The translation's language: the learner may switch to it, with its ביאור and questions. */
export const translationLanguage: string = appConfig.translationLanguage;
/** The languages whose text is split into units: the keys of paths.splits. */
export const textLanguages = Object.keys(config.paths.splits as Record<string, string>);

/** Fills {part} and {chapter} in a path template. */
export function fill(template: string, ch?: ChapterRef): string {
  return template
    .replaceAll('{part}', String(ch?.part))
    .replaceAll('{chapter}', String(ch?.chapter));
}

/**
 * The configured path for `key` ("splits", "text.he", ...), relative to the repo root, or
 * absolute with { absolute: true }.
 */
export function pathOf(key: string, ch?: ChapterRef, { absolute = false } = {}): string {
  const template = key
    .split('.')
    .reduce<unknown>((o, k) => (o as Record<string, unknown> | undefined)?.[k], config.paths);
  if (typeof template !== 'string') throw new Error(`texts.config.json: no path "${key}"`);
  const rel = fill(template, ch);
  return absolute ? path.join(root, rel) : rel;
}
