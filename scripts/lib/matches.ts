// Glossary matches may be written without nikud; this finds the exact vocalized text in the unit
// (SPEC §7: matching works on the text as it is).
import { lettersOnly, words } from './units.ts';

const NOT_LETTER_OR_MARK = /^[^ְ-ת]+|[^ְ-ת]+$/g;
/** Prefix letters a term may leave out (ו, ה, ב, כ, ל, מ, ש, ד), up to two. */
const PREFIX = /^[והבכלמשד]{0,2}$/;

/** Drops the first `n` Hebrew letters of `s`, with their nikud. */
export function skipLetters(s: string, n: number): string {
  let seen = 0;
  for (let i = 0; i < s.length; i++) {
    if (/[א-ת]/.test(s[i]!)) {
      if (seen === n) return s.slice(i);
      seen++;
    }
  }
  return '';
}

/** The exact substring of `text` that `match` stands for, or null. */
export function resolveMatch(text: string, match: string): string | null {
  if (text.includes(match)) return match;
  const target = words(match).map((w) => w.letters);
  const ws = words(text);
  for (let i = 0; i + target.length <= ws.length; i++) {
    const first = ws[i]!.letters;
    const prefix = first.slice(0, first.length - target[0]!.length);
    const firstOk = first.endsWith(target[0]!) && PREFIX.test(prefix);
    if (firstOk && target.every((t, k) => k === 0 || ws[i + k]!.letters === t)) {
      const last = ws[i + target.length - 1]!;
      const end = last.start + text.slice(last.start).search(/[\s־]|$/);
      const found = skipLetters(text.slice(ws[i]!.start, end), prefix.length);
      return found.replace(NOT_LETTER_OR_MARK, '');
    }
  }
  return null;
}

/** Whether a resolved match spells the same letters as the one written. */
export const sameLetters = (a: string, b: string) => lettersOnly(a) === lettersOnly(b);
