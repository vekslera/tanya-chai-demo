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
  biurMaxWords: number;
  /** Runs of this many words shared with a reference text are flagged (SPEC §8.3). */
  overlapRunWords: number;
  /** By level: how many questions of each category. */
  levelQuestions: Record<string, Record<string, number>>;
  togetherQuestions: { count: number; category: string; kinds: string[] };
  optionCount: Record<string, Range>;
  cards: { count: Range; talks: Range; maxWords: Record<string, number> };
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
