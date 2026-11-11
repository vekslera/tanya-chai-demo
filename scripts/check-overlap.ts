// Overlap check (SPEC §8.3): flags any run of words (contentRules.overlapRunWords) that a draft item
// shares with the local Shiurim file. The Shiurim file exists only on Alex's machine; it is never
// committed, and this never runs in CI. The output names the item and the draft's words only.
import { reviewableItems } from '../src/domain/reviewable.ts';
import { contentRules, pathOf } from './lib/config.ts';
import { runMain, type ScriptEnv } from './lib/env.ts';
import { loadChapter } from './lib/load.ts';
import { overlaps, runs, toWords, type Draft } from './lib/overlap.ts';

export function run({ files, log }: ScriptEnv, length = contentRules.overlapRunWords): number {
  const dir = pathOf('shiurim');
  if (!files.exists(dir)) {
    log.info('check-overlap: no local Shiurim file, skipped');
    return 0;
  }
  const reference = new Set<string>();
  const sources = files.list(dir);
  for (const f of sources) for (const g of runs(toWords(files.read(f)), length)) reference.add(g);
  log.info(
    `check-overlap: ${sources.length} reference file(s), ${reference.size} ${length}-word runs`,
  );

  const all = loadChapter(files);
  const drafts: Draft[] = all.portion
    ? reviewableItems({ ...all, portion: all.portion }).map((r) => ({
        id: r.id,
        text: r.item.value,
      }))
    : [];
  for (const q of all.portion?.questions ?? []) {
    for (const o of q.options ?? []) drafts.push({ id: `${q.id}/option-${o.id}`, text: o.text });
  }
  const flagged = overlaps(drafts, reference, runs(toWords(all.lines.join('\n')), length), length);
  for (const f of flagged) log.info(`FLAG ${f.id}: ${f.hits.join(' | ')}`);
  log.info(`check-overlap: ${drafts.length} items checked, ${flagged.length} flagged`);
  return flagged.length ? 1 : 0;
}

await runMain(import.meta.url, run);
