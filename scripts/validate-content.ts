// Schema and integrity checks (SPEC §6.5, §8.4). Fails on any integrity error; unreviewed items
// fail only with CONTENT_STRICT=1.
import { reviewableItems, unreviewedOf } from '../src/domain/reviewable.ts';
import { runMain, type ScriptEnv } from './lib/env.ts';
import { loadChapter } from './lib/load.ts';
import { validate } from './lib/validate/index.ts';

/** The group of a reviewable item, for the summary: a chapter, "glossary", "q" or "card". */
export const groupOf = (id: string) =>
  id
    .split('/')[0]!
    .replace(/\.\d+$/, '')
    .replace(/^(q|card)-.*/, '$1');

export function run({ files, log, vars }: ScriptEnv): number {
  const strict = vars.CONTENT_STRICT === '1';
  const all = loadChapter(files);
  const { errors, warnings } = validate(all, { strict });
  for (const w of warnings) log.warn(`warning: ${w}`);
  for (const e of errors) log.error(`error: ${e}`);

  const items = all.portion ? reviewableItems({ ...all, portion: all.portion }) : [];
  const unreviewed = unreviewedOf(items);
  log.info(
    `\nunits: ${all.units.length}; reviewable items: ${items.length}; unreviewed: ${unreviewed.length}`,
  );
  if (unreviewed.length) {
    const groups = new Map<string, number>();
    for (const r of unreviewed) groups.set(groupOf(r.id), (groups.get(groupOf(r.id)) ?? 0) + 1);
    log.info(`unreviewed by group: ${[...groups].map(([k, v]) => `${k} ${v}`).join(', ')}`);
  }

  if (errors.length) {
    log.error(`\nvalidate-content: ${errors.length} error(s)`);
    return 1;
  }
  if (strict && unreviewed.length) {
    log.error(
      `\nvalidate-content: CONTENT_STRICT=1 and ${unreviewed.length} item(s) are unreviewed`,
    );
    return 1;
  }
  log.info('validate-content: OK');
  return 0;
}

await runMain(import.meta.url, run);
