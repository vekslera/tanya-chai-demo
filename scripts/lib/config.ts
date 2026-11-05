// Reads the two config files: texts.config.json (the texts and every file path) and
// app.config.json (the app's parameters). This is the only place that names them. Used by the
// scripts, and by vite.config.ts to serve both to the app.
import fs from 'node:fs';
import path from 'node:path';

export type ChapterRef = { part: string; chapter: number };

export const root = path.resolve(import.meta.dirname, '../..');

/** The config files, relative to the repo root. */
export const CONFIG_FILES = { texts: 'texts.config.json', app: 'app.config.json' } as const;

/** Reads a JSON file given relative to the repo root. */
export const readJson = (file: string) =>
  JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));

export const config = readJson(CONFIG_FILES.texts);
export const appConfig = readJson(CONFIG_FILES.app);

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
