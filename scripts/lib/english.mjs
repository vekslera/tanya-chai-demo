// The English resource file (SPEC §8.1), as Alex supplies it:
//   one paragraph per line, footnote marks written "[n]" where they apply;
//   then a blank line, then one footnote per line: "[n] text".

const FOOTNOTE_LINE = /^\[(\d+)\]\s*(.+)$/;

export function parseEnglish(raw) {
  const text = raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw;
  const lines = text.split(/\r?\n/).map((l) => l.trim());
  const blank = lines.findIndex((l, i) => l === '' && lines.slice(i).some((x) => x !== ''));
  const body = (blank === -1 ? lines : lines.slice(0, blank)).filter(Boolean);
  const tail = blank === -1 ? [] : lines.slice(blank).filter(Boolean);
  const footnotes = {};
  const errors = [];
  for (const line of tail) {
    const m = line.match(FOOTNOTE_LINE);
    if (!m) errors.push(`footnote line without "[n]": ${line.slice(0, 40)}`);
    else if (m[1] in footnotes) errors.push(`footnote [${m[1]}] appears twice`);
    else footnotes[m[1]] = m[2];
  }
  return { paragraphs: body, footnotes, errors };
}

/** Footnote numbers marked in a text: "[n]" with digits only. */
export function footnoteMarks(text) {
  return [...text.matchAll(/\[(\d+)\]/g)].map((m) => m[1]);
}
