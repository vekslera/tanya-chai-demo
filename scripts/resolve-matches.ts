// Authoring helper: rewrites each glossary match of the demo chapter to the exact vocalized text of
// its unit, so matches may be written without nikud.
import { pathOf } from './lib/config.ts';
import { runMain, type ScriptEnv } from './lib/env.ts';
import { loadChapter } from './lib/load.ts';
import { resolveMatch, sameLetters } from './lib/matches.ts';

export function run({ files, log }: ScriptEnv): number {
  const all = loadChapter(files);
  const text = new Map(all.units.map((u) => [u.id, u.text]));
  let failed = false;
  for (const c of all.unitContent) {
    for (const m of c.glossary ?? []) {
      const resolved = resolveMatch(text.get(c.id) ?? '', m.match);
      if (resolved && sameLetters(resolved, m.match)) {
        m.match = resolved;
      } else {
        log.error(`${c.id}: "${m.match}" not found`);
        failed = true;
      }
    }
  }
  files.write(pathOf('unitContent', all), JSON.stringify(all.unitContent, null, 2) + '\n');
  if (failed) return 1;
  log.info('resolve-matches: done');
  return 0;
}

await runMain(import.meta.url, run);
