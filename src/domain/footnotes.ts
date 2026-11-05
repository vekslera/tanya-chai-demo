// Footnote marks in the English: "[n]" with digits only. Brackets that hold words, like
// "[transitory]", are translation text.

export const FOOTNOTE_MARK = /\[(\d+)\]/g;

/** The footnote numbers marked in a text, in order. */
export function footnoteMarks(text: string): string[] {
  return [...text.matchAll(FOOTNOTE_MARK)].map((m) => m[1]!);
}

export type FootnoteSegment = { kind: 'text'; text: string } | { kind: 'note'; n: string };

/** Splits a text at the marks of the footnotes it has; other marks stay as text. */
export function footnoteSegments(text: string, notes: Record<string, string>): FootnoteSegment[] {
  const out: FootnoteSegment[] = [];
  let pos = 0;
  for (const m of text.matchAll(FOOTNOTE_MARK)) {
    const n = m[1]!;
    if (!(n in notes)) continue;
    out.push({ kind: 'text', text: text.slice(pos, m.index) });
    out.push({ kind: 'note', n });
    pos = m.index + m[0].length;
  }
  out.push({ kind: 'text', text: text.slice(pos) });
  return out.filter((s) => s.kind === 'note' || s.text !== '');
}
