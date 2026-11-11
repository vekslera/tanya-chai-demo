// Latin stretches inside Hebrew text (names, licenses, numbers), to be isolated as LTR runs so the
// neutral characters around them stay in place (SPEC §3.2).

// From an (optionally parenthesized) Latin letter or digit to the last Latin letter, digit or
// closing parenthesis before the Hebrew resumes, with the spaces and punctuation between (commas,
// ©, hyphens, inner parentheses) kept inside.
const LATIN_STRETCH = /\(?[A-Za-z0-9][A-Za-z0-9 .,:;()©&'’/\-–]*[A-Za-z0-9)]|\(?[A-Za-z0-9]\)?/g;

const count = (s: string, c: string) => [...s].filter((x) => x === c).length;

/** Drops a parenthesis at either end that has no partner inside the stretch. */
export function balance(run: string): { text: string; lead: number } {
  let text = run;
  let lead = 0;
  if (text.startsWith('(') && count(text, '(') > count(text, ')')) {
    text = text.slice(1);
    lead = 1;
  }
  if (text.endsWith(')') && count(text, ')') > count(text, '(')) text = text.slice(0, -1);
  return { text, lead };
}

export type BidiSegment = { text: string; latin: boolean; nowrap: boolean };

/** Splits text into Hebrew and Latin runs. Latin runs up to `nowrapMaxChars` do not wrap. */
export function bidiSegments(text: string, nowrapMaxChars: number): BidiSegment[] {
  const out: BidiSegment[] = [];
  const hebrew = (s: string) => s && out.push({ text: s, latin: false, nowrap: false });
  let pos = 0;
  for (const m of text.matchAll(LATIN_STRETCH)) {
    const { text: run, lead } = balance(m[0]);
    const start = m.index + lead;
    hebrew(text.slice(pos, start));
    out.push({ text: run, latin: true, nowrap: run.length <= nowrapMaxChars });
    pos = start + run.length;
  }
  hebrew(text.slice(pos));
  return out;
}
