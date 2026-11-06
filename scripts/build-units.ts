// Raw text + splits → units (SPEC §8.2), for every chapter in texts.config.json.
// The output is generated: never edit it, and it is not committed.
import { config, pathOf } from './lib/config.ts';
import { runMain, type ScriptEnv } from './lib/env.ts';
import { buildUnits } from './lib/units.ts';

export function run({ files, log }: ScriptEnv): number {
  let failed = false;
  for (const ch of config.chapters) {
    const splits = JSON.parse(files.read(pathOf('splits', ch)));
    const { units, errors } = buildUnits({ raw: files.read(pathOf('text.he', ch)), splits, ...ch });
    if (errors.length) {
      failed = true;
      for (const e of errors) log.error(`${ch.part} ${ch.chapter}: ${e}`);
      continue;
    }
    files.write(pathOf('units', ch), JSON.stringify(units, null, 2) + '\n');
    log.info(`build-units: ${ch.part} ${ch.chapter}, ${units.length} units`);
  }
  return failed ? 1 : 0;
}

await runMain(import.meta.url, run);
