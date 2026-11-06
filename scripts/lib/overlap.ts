// The overlap check (SPEC §8.3): runs of words a draft shares with a reference text, on letters
// only. Runs that also occur in the Tanya text itself are quotations and are not flagged.
import { lettersOnly } from './units.ts';

export const toWords = (s: string) =>
  s
    .split(/[\s־]+/)
    .map(lettersOnly)
    .filter(Boolean);

/** Every run of `length` consecutive words. */
export function runs(words: string[], length: number): Set<string> {
  const set = new Set<string>();
  for (let i = 0; i + length <= words.length; i++) set.add(words.slice(i, i + length).join(' '));
  return set;
}

export type Draft = { id: string; text: string };

/** The drafts that share a run with the reference, with the shared runs of the draft. */
export function overlaps(
  drafts: Draft[],
  reference: Set<string>,
  quotations: Set<string>,
  length: number,
): { id: string; hits: string[] }[] {
  return drafts.flatMap((d) => {
    const hits = [...runs(toWords(d.text), length)].filter(
      (g) => reference.has(g) && !quotations.has(g),
    );
    return hits.length ? [{ id: d.id, hits }] : [];
  });
}
