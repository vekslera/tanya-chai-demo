// Turns Sefaria's v3 text segments into the plain resource files (SPEC §8.1). The words are kept
// exactly; only HTML is removed.

const collapse = (s: string) => s.replace(/\s+/g, ' ').trim();
const untag = (s: string) => s.replace(/<[^>]*>/g, '');

/** Daily-portion markers Sefaria embeds in the Hebrew, e.g. "[פ: ט אדר]", by paragraph. */
export function portionMarkers(segments: string[]): string[][] {
  return segments.map((s) => [...s.matchAll(/data-value="(\[[^"]*\])"/g)].map((m) => m[1]!));
}

/** Hebrew: one paragraph per segment, all tags (and the empty marker tags) removed. */
export function hebrewText(segments: string[]): string {
  return segments.map((s) => collapse(untag(s))).join('\n') + '\n';
}

/**
 * English: one paragraph per segment. Each footnote becomes a mark "[n]" where it applies, and the
 * footnotes follow after a blank line as "[n] text".
 */
export function englishText(segments: string[]): string {
  const notes: string[] = [];
  const paragraphs = segments.map((s) => {
    let t = s;
    // Plain <i>…</i> (titles inside the text or inside a footnote) is only formatting.
    while (/<i>[^<]*<\/i>/.test(t)) t = t.replace(/<i>([^<]*)<\/i>/g, '$1');
    t = t.replace(
      /<sup class="footnote-marker">(\d+)<\/sup><i class="footnote">([\s\S]*?)<\/i>/g,
      (_, n: string, body: string) => {
        notes.push(`[${n}] ${collapse(untag(body))}`);
        return `[${n}]`;
      },
    );
    return collapse(untag(t));
  });
  return paragraphs.join('\n') + '\n' + (notes.length ? '\n' + notes.join('\n') + '\n' : '');
}
