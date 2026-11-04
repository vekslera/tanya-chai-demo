// Reads texts.config.json: the only place that names the texts and their files.
import fs from 'node:fs';
import path from 'node:path';

export const root = path.resolve(import.meta.dirname, '../..');
export const config = JSON.parse(fs.readFileSync(path.join(root, 'texts.config.json'), 'utf8'));

/** Fills {part} and {chapter} in a template. */
export function fill(template, { part, chapter } = {}) {
  return template.replaceAll('{part}', part).replaceAll('{chapter}', String(chapter));
}

/**
 * The configured path for `key` ("splits", "text.he", ...), relative to the repo root, or
 * absolute with { absolute: true }.
 */
export function pathOf(key, chapter, { absolute = false } = {}) {
  const template = key.split('.').reduce((o, k) => o?.[k], config.paths);
  if (typeof template !== 'string') throw new Error(`texts.config.json: no path "${key}"`);
  const rel = fill(template, chapter);
  return absolute ? path.join(root, rel) : rel;
}
