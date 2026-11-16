// Raw text + splits → units (SPEC §8.2), for every chapter in texts.config.json and every
// language with splits. The output is generated: never edit it, and it is not committed.
import { config, pathOf, textLanguages } from './lib/config.ts';
import { runMain, type ScriptEnv } from './lib/env.ts';
import { loadTexts } from './lib/load.ts';

export function run({ files, log }: ScriptEnv): number {
  let failed = false;
  for (const ch of config.chapters) {
    const texts = loadTexts(files, ch);
    for (const language of textLanguages) {
      const where = `${ch.part} ${ch.chapter} (${language})`;
      const text = texts[language];
      if (!text) {
        log.warn(`build-units: ${where} has no text or no splits yet`);
        continue;
      }
      if (text.errors.length) {
        failed = true;
        for (const e of text.errors) log.error(`${where}: ${e}`);
        continue;
      }
      const out = pathOf(`units.${language}`, ch);
      files.write(out, JSON.stringify(text.units, null, 2) + '\n');
      log.info(`build-units: ${where}, ${text.units.length} units`);
    }
  }
  return failed ? 1 : 0;
}

await runMain(import.meta.url, run);
