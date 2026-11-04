// Authoring helper: glossary matches may be written without nikud. This rewrites each one to the
// exact vocalized substring of its unit (SPEC §7: matching works on the text as it is).
import fs from 'node:fs';
import path from 'node:path';
import { lettersOnly, words } from './lib/units.mjs';
import { loadAll, root } from './lib/content.mjs';

const NOT_LETTER_OR_MARK = /^[^ְ-ת]+|[^ְ-ת]+$/g;

export function resolveMatch(text, match) {
  if (text.includes(match)) return match;
  const target = words(match).map((w) => w.letters);
  const ws = words(text);
  for (let i = 0; i + target.length <= ws.length; i++) {
    // The first word may carry prefix letters (ו, ה, ב, כ, ל, מ, ש, ד) that the term leaves out.
    const first = ws[i].letters;
    const prefix = first.slice(0, first.length - target[0].length);
    const firstOk = first.endsWith(target[0]) && /^[והבכלמשד]{0,2}$/.test(prefix);
    if (firstOk && target.every((t, k) => k === 0 || ws[i + k].letters === t)) {
      const last = ws[i + target.length - 1];
      const end = last.start + text.slice(last.start).search(/[\s־]|$/);
      return skipLetters(text.slice(ws[i].start, end), prefix.length).replace(
        NOT_LETTER_OR_MARK,
        '',
      );
    }
  }
  return null;
}

/** Drops the first `n` Hebrew letters of `s`, with their nikud. */
function skipLetters(s, n) {
  let seen = 0;
  for (let i = 0; i < s.length; i++) {
    if (/[א-ת]/.test(s[i])) {
      if (seen === n) return s.slice(i);
      seen++;
    }
  }
  return '';
}

const all = loadAll();
const byId = new Map(all.units.map((u) => [u.id, u]));
const file = path.join(root, 'content/LA/32.json');
let failed = false;
for (const c of all.unitContent) {
  for (const m of c.glossary ?? []) {
    const resolved = resolveMatch(byId.get(c.id).text, m.match);
    if (!resolved || lettersOnly(resolved) !== lettersOnly(m.match)) {
      console.error(`${c.id}: "${m.match}" not found`);
      failed = true;
    } else {
      m.match = resolved;
    }
  }
}
fs.writeFileSync(file, JSON.stringify(all.unitContent, null, 2) + '\n');
if (failed) process.exit(1);
console.log('resolve-matches: done');
