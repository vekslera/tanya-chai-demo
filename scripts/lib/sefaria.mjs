// Turns Sefaria's v3 text segments into the plain resource files (SPEC §8.1). The words are kept
// exactly; only HTML is removed.

const collapse = (s) => s.replace(/\s+/g, ' ').trim();

/** Daily-portion markers Sefaria embeds in the Hebrew, e.g. "[פ: ט אדר]", by paragraph. */
export function portionMarkers(segments) {
  return segments.map((s) => [...s.matchAll(/data-value="(\[[^"]*\])"/g)].map((m) => m[1]));
}

/** Hebrew: one paragraph per segment, all tags (and the empty marker tags) removed. */
export function hebrewText(segments) {
  return segments.map((s) => collapse(s.replace(/<[^>]*>/g, ''))).join('\n') + '\n';
}

/**
 * English: one paragraph per segment. Each footnote becomes a mark "[n]" where it applies, and the
 * footnotes follow after a blank line as "[n] text".
 */
export function englishText(segments) {
  const notes = [];
  const paragraphs = segments.map((s) => {
    let t = s;
    // Plain <i>…</i> (titles inside the text or inside a footnote) is only formatting.
    while (/<i>[^<]*<\/i>/.test(t)) t = t.replace(/<i>([^<]*)<\/i>/g, '$1');
    t = t.replace(
      /<sup class="footnote-marker">(\d+)<\/sup><i class="footnote">([\s\S]*?)<\/i>/g,
      (_, n, body) => {
        notes.push(`[${n}] ${collapse(body.replace(/<[^>]*>/g, ''))}`);
        return `[${n}]`;
      },
    );
    return collapse(t.replace(/<[^>]*>/g, ''));
  });
  return paragraphs.join('\n') + '\n' + (notes.length ? '\n' + notes.join('\n') + '\n' : '');
}
