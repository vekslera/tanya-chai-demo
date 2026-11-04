import type { ReactNode } from 'react';
import type { TranslationSpan } from '../content/types';
import { he } from '../strings/he';

/**
 * The English of one paragraph. Footnote marks "[n]" become superscript buttons; the footnote
 * itself opens on tap. Brackets that hold words, like "[transitory]", are translation text.
 */
export function EnglishText({
  span,
  onFootnote,
}: {
  span: TranslationSpan;
  onFootnote: (n: string) => void;
}) {
  const notes = span.footnotes ?? {};
  const parts: ReactNode[] = [];
  let pos = 0;
  for (const m of span.text.matchAll(/\[(\d+)\]/g)) {
    const n = m[1]!;
    if (!(n in notes)) continue;
    parts.push(span.text.slice(pos, m.index));
    parts.push(
      <sup key={m.index}>
        <button
          type="button"
          className="footnote-mark"
          onClick={() => onFootnote(n)}
          aria-label={he.read.footnote(n)}
          aria-haspopup="dialog"
        >
          {n}
        </button>
      </sup>,
    );
    pos = m.index + m[0].length;
  }
  parts.push(span.text.slice(pos));
  return <>{parts}</>;
}
