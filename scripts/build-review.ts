// Writes the review document (SPEC §8.4) for the demo chapter's portion.
import { pathOf } from './lib/config.ts';
import { runMain, type ScriptEnv } from './lib/env.ts';
import { loadChapter } from './lib/load.ts';
import { reviewDocument } from './lib/review/index.ts';

export function run({ files, log }: ScriptEnv): number {
  const all = loadChapter(files);
  if (!all.portion) {
    log.error(`review: ${pathOf('portion', all)} is missing`);
    return 1;
  }
  const { text, unreviewed } = reviewDocument(all, all.portion);
  files.write(pathOf('review', all), text);
  log.info(`review: wrote ${pathOf('review', all)} (${unreviewed} to review)`);
  return 0;
}

await runMain(import.meta.url, run);
