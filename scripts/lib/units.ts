// The text layer (SPEC §6.1–6.2): split a raw chapter into units by their opening words.
// The raw text is never changed.
import type { Unit } from '../../src/domain/types.ts';
import { UNIT_ID } from '../../src/domain/units.ts';

export type Split = { id: string; startsWith: string };
type Word = { start: number; letters: string };

const HEBREW_LETTER = /[א-ת]/g;
const MAQAF = '־';
const BOM = 0xfeff;

/** Hebrew letters only: nikud, cantillation, punctuation and gershayim are dropped. */
export function lettersOnly(s: string): string {
  return (s.match(HEBREW_LETTER) ?? []).join('');
}

/**
 * Words of a string with their offsets. A maqaf counts as a space. Words with no Hebrew letters
 * (such as a lone dash) are skipped, so they never take part in matching.
 */
export function words(s: string): Word[] {
  const out: Word[] = [];
  for (const m of s.matchAll(new RegExp(`[^\\s${MAQAF}]+`, 'g'))) {
    const letters = lettersOnly(m[0]);
    if (letters) out.push({ start: m.index, letters });
  }
  return out;
}

/** Drops a byte-order mark at the start of a file. */
export const withoutBom = (raw: string) => (raw.charCodeAt(0) === BOM ? raw.slice(1) : raw);

/** Splits a raw file into paragraphs: one per line, line endings removed, empty lines dropped. */
export function paragraphs(raw: string): string[] {
  return withoutBom(raw)
    .split(/\r?\n/)
    .filter((line) => line.trim() !== '');
}

type Start = { split: Split; line: number; wordIndex: number };

/** Finds an anchor's words from `line`, word `from`, onward. */
function findAnchor(lineWords: Word[][], anchor: string[], line: number, from: number) {
  for (let l = line; l < lineWords.length; l++) {
    const ws = lineWords[l]!;
    for (let i = l === line ? from : 0; i + anchor.length <= ws.length; i++) {
      if (anchor.every((a, k) => ws[i + k]!.letters === a)) return { line: l, wordIndex: i };
    }
  }
  return null;
}

/**
 * Builds the units of one chapter. Each anchor is searched from the end of the previous one, on
 * Hebrew letters only. A paragraph's first unit must start at its first word. With errors, `units`
 * holds what could be built.
 */
export function buildUnits({
  raw,
  splits,
  part,
  chapter,
}: {
  raw: string;
  splits: Split[];
  part: string;
  chapter: number;
}) {
  const lines = paragraphs(raw);
  const lineWords = lines.map(words);
  const errors: string[] = [];
  const starts: Start[] = [];
  let line = 0;
  let from = 0;

  for (const split of splits) {
    const anchor = words(split.startsWith).map((w) => w.letters);
    if (anchor.length === 0) {
      errors.push(`${split.id}: anchor "${split.startsWith}" has no Hebrew letters`);
      continue;
    }
    const found = findAnchor(lineWords, anchor, line, from);
    if (!found) {
      errors.push(`${split.id}: anchor "${split.startsWith}" not found after the previous unit`);
      continue;
    }
    if (found.line !== line && found.wordIndex !== 0) {
      errors.push(
        `${split.id}: first unit of paragraph ${found.line + 1} does not start at the beginning of the line`,
      );
    }
    starts.push({ split, ...found });
    line = found.line;
    from = found.wordIndex + anchor.length;
  }
  lines.forEach((_, l) => {
    if (!starts.some((s) => s.line === l)) errors.push(`paragraph ${l + 1} has no unit`);
  });

  const units: Unit[] = starts.map((s, n) => {
    const text = lines[s.line]!;
    const next = starts[n + 1];
    // The first unit of a paragraph starts at the line start, so leading spaces stay with it and
    // the units of a paragraph join back to the exact line.
    const begin = s.wordIndex === 0 ? 0 : lineWords[s.line]![s.wordIndex]!.start;
    const end =
      next && next.line === s.line ? lineWords[s.line]![next.wordIndex]!.start : text.length;
    return {
      id: s.split.id,
      seq: chapter * 1000 + n + 1,
      part,
      chapter,
      paragraph: s.line + 1,
      text: text.slice(begin, end),
    };
  });
  return { units, lines, errors };
}

/** Integrity checks of SPEC §6.5 that concern the units alone. */
export function checkUnits({
  units,
  lines,
  splits,
}: {
  units: Unit[];
  lines: string[];
  splits: Split[];
}): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const s of splits) {
    if (!UNIT_ID.test(s.id)) errors.push(`${s.id}: malformed unit ID`);
    if (ids.has(s.id)) errors.push(`${s.id}: duplicate unit ID`);
    ids.add(s.id);
  }
  lines.forEach((line, i) => {
    const joined = units
      .filter((u) => u.paragraph === i + 1)
      .map((u) => u.text)
      .join('');
    if (joined.trimEnd() !== line.trimEnd()) {
      errors.push(`paragraph ${i + 1}: units do not join back to the raw line`);
    }
  });
  return errors;
}
