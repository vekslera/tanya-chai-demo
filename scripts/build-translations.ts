// English text → translation spans, one per unit (SPEC §6.4, §8.1), for every chapter in
// texts.config.json.
// Run when the English file is added or changed; the output is committed.
import { config, pathOf } from './lib/config.ts';
import { runMain, type ScriptEnv } from './lib/env.ts';
import { loadChapter } from './lib/load.ts';
import { translationSpans } from './lib/translations.ts';

export function run({ files, log }: ScriptEnv): number {
  let failed = false;
  const fail = (message: string) => {
    log.error(`build-translations: ${message}`);
    failed = true;
  };
  for (const ch of config.chapters) {
    if (!files.exists(pathOf('text.en', ch))) {
      fail(`${pathOf('text.en', ch)} not found`);
      continue;
    }
    const { units, errors, enResource, texts } = loadChapter(files, ch);
    const english = texts.en;
    if (!english) {
      fail(`${pathOf('splits.en', ch)} not found`);
      continue;
    }
    const problems = [...errors, ...enResource!.errors, ...english.errors];
    if (problems.length) {
      problems.forEach(fail);
      continue;
    }
    const result = translationSpans(units, english);
    if ('error' in result) {
      fail(result.error);
      continue;
    }
    files.write(pathOf('translations', ch), JSON.stringify(result.spans, null, 2) + '\n');
    log.info(`build-translations: ${result.spans.length} spans → ${pathOf('translations', ch)}`);
  }
  return failed ? 1 : 0;
}

await runMain(import.meta.url, run);
