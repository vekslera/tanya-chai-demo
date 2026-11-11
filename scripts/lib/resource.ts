// A text resource file, in any language (SPEC §8.1):
//   one paragraph per line, footnote marks written "[n]" where they apply;
//   then, if it has footnotes, a blank line and one footnote per line: "[n] text".
import { withoutBom } from './units.ts';

const FOOTNOTE_LINE = /^\[(\d+)\]\s*(.+)$/;

export type ParsedResource = {
  paragraphs: string[];
  footnotes: Record<string, string>;
  errors: string[];
};

export function parseResource(raw: string): ParsedResource {
  const lines = withoutBom(raw)
    .split(/\r?\n/)
    .map((l) => l.trim());
  // The footnotes start after the first blank line that has text after it.
  const blank = lines.findIndex((l, i) => l === '' && lines.slice(i).some((x) => x !== ''));
  const body = (blank === -1 ? lines : lines.slice(0, blank)).filter(Boolean);
  const tail = blank === -1 ? [] : lines.slice(blank).filter(Boolean);
  const footnotes: Record<string, string> = {};
  const errors: string[] = [];
  for (const line of tail) {
    const m = line.match(FOOTNOTE_LINE);
    if (!m) errors.push(`footnote line without "[n]": ${line.slice(0, 40)}`);
    else if (m[1]! in footnotes) errors.push(`footnote [${m[1]}] appears twice`);
    else footnotes[m[1]!] = m[2]!;
  }
  return { paragraphs: body, footnotes, errors };
}
