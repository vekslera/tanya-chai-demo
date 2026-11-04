// Overlap check (SPEC §8.3): flags any run of 5+ words that a draft item shares with the local
// Shiurim file (letters only, nikud ignored). Runs that also occur in the Tanya text itself are
// quotations of the text and are not flagged.
// The Shiurim file exists only on Alex's machine; it is never committed, and this never runs in CI.
// Output names the item and the overlapping words of the draft only.
import fs from 'node:fs';
import path from 'node:path';
import { lettersOnly } from './lib/units.mjs';
import { loadAll, reviewables, root } from './lib/content.mjs';

const RUN = 5;
const shiurimDir = path.join(root, 'resources/texts/HE/shiurim');
if (!fs.existsSync(shiurimDir)) {
  console.log('check-overlap: no local Shiurim file, skipped');
  process.exit(0);
}

const toWords = (s) =>
  s
    .split(/[\s־]+/)
    .map(lettersOnly)
    .filter(Boolean);
const grams = (ws) => {
  const set = new Set();
  for (let i = 0; i + RUN <= ws.length; i++) set.add(ws.slice(i, i + RUN).join(' '));
  return set;
};

const files = fs
  .readdirSync(shiurimDir, { recursive: true, withFileTypes: true })
  .filter((d) => d.isFile());
const reference = new Set();
for (const f of files) {
  for (const g of grams(toWords(fs.readFileSync(path.join(f.parentPath, f.name), 'utf8'))))
    reference.add(g);
}
console.log(`check-overlap: ${files.length} reference file(s), ${reference.size} ${RUN}-word runs`);
const all = loadAll();
const tanya = grams(toWords(all.lines.join('\n')));

const drafts = reviewables(all).map((r) => ({ id: r.id, text: r.item.value }));
for (const q of all.portion?.questions ?? []) {
  for (const o of q.options ?? []) drafts.push({ id: `${q.id}/option-${o.id}`, text: o.text });
}

let flagged = 0;
for (const d of drafts) {
  const ws = toWords(d.text);
  const hits = [];
  for (let i = 0; i + RUN <= ws.length; i++) {
    const g = ws.slice(i, i + RUN).join(' ');
    if (reference.has(g) && !tanya.has(g)) hits.push(g);
  }
  if (hits.length) {
    flagged++;
    console.log(`FLAG ${d.id}: ${hits.join(' | ')}`);
  }
}
console.log(`check-overlap: ${drafts.length} items checked, ${flagged} flagged`);
process.exit(flagged ? 1 : 0);
