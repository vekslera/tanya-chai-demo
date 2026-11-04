// The text layer (SPEC §6.1–6.2): split a raw chapter into units by their opening words.
// Shared by build-units.mjs, validate-content.mjs and the tests. The raw text is never changed.

const HEBREW_LETTER = /[א-ת]/g;
const MAQAF = '־';

/** Hebrew letters only: nikud, cantillation, punctuation and gershayim are dropped. */
export function lettersOnly(s) {
  return (s.match(HEBREW_LETTER) ?? []).join('');
}

/**
 * Words of a string with their offsets. A maqaf counts as a space. Words with no Hebrew letters
 * (such as a lone dash) are skipped, so they never take part in matching.
 */
export function words(s) {
  const out = [];
  const re = new RegExp(`[^\\s${MAQAF}]+`, 'g');
  for (const m of s.matchAll(re)) {
    const letters = lettersOnly(m[0]);
    if (letters) out.push({ start: m.index, letters });
  }
  return out;
}

export const UNIT_ID = /^([A-Z]{2})\.(\d+)\.(\d{3})([a-z]?)$/;

/** Splits a raw file into paragraphs: one per line, line endings removed, empty lines dropped. */
export function paragraphs(raw) {
  return (raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw)
    .split(/\r?\n/)
    .filter((line) => line.trim() !== '');
}

/**
 * Builds the units of one chapter. Each anchor is searched from the end of the previous one, on
 * Hebrew letters only. A paragraph's first unit must start at its first word. Returns
 * `{ units, errors }`; with errors, `units` holds what could be built.
 */
export function buildUnits({ raw, splits, part, chapter }) {
  const lines = paragraphs(raw);
  const lineWords = lines.map(words);
  const errors = [];
  const starts = []; // { split, line, wordIndex }
  let line = 0;
  let from = 0; // first word index to search in `line`

  for (const split of splits) {
    const anchor = words(split.startsWith).map((w) => w.letters);
    if (anchor.length === 0) {
      errors.push(`${split.id}: anchor "${split.startsWith}" has no Hebrew letters`);
      continue;
    }
    let found = null;
    for (let l = line; l < lines.length && !found; l++) {
      const ws = lineWords[l];
      const begin = l === line ? from : 0;
      for (let i = begin; i + anchor.length <= ws.length; i++) {
        if (anchor.every((a, k) => ws[i + k].letters === a)) {
          found = { line: l, wordIndex: i };
          break;
        }
      }
    }
    if (!found) {
      errors.push(`${split.id}: anchor "${split.startsWith}" not found after the previous unit`);
      continue;
    }
    if (found.line !== line && found.wordIndex !== 0) {
      errors.push(
        `${split.id}: first unit of paragraph ${found.line + 1} does not start at the beginning of the line`,
      );
    }
    starts.push({ split, line: found.line, wordIndex: found.wordIndex });
    line = found.line;
    from = found.wordIndex + anchor.length;
  }
  lines.forEach((_, l) => {
    if (!starts.some((s) => s.line === l)) errors.push(`paragraph ${l + 1} has no unit`);
  });

  const units = starts.map((s, n) => {
    const text = lines[s.line];
    const next = starts[n + 1];
    // The first unit of a paragraph starts at the line start, so leading spaces stay with it and
    // the units of a paragraph join back to the exact line.
    const begin = s.wordIndex === 0 ? 0 : lineWords[s.line][s.wordIndex].start;
    const end =
      next && next.line === s.line ? lineWords[s.line][next.wordIndex].start : text.length;
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
export function checkUnits({ units, lines, splits }) {
  const errors = [];
  const ids = new Set();
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

/** Display form of a unit: the exact text, without the spaces around it. */
export function displayText(text) {
  return text.trim();
}
