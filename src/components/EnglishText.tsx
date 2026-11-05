import { footnoteSegments } from '../domain/footnotes';
import type { TranslationSpan } from '../domain/types';
import { he } from '../strings/he';

/** The English of one paragraph. Footnote marks become superscript buttons that open the note. */
export function EnglishText({
  span,
  onFootnote,
}: {
  span: TranslationSpan;
  onFootnote: (n: string) => void;
}) {
  return (
    <>
      {footnoteSegments(span.text, span.footnotes ?? {}).map((s, i) =>
        s.kind === 'text' ? (
          s.text
        ) : (
          <sup key={i}>
            <button
              type="button"
              className="footnote-mark"
              onClick={() => onFootnote(s.n)}
              aria-label={he.read.footnote(s.n)}
              aria-haspopup="dialog"
            >
              {s.n}
            </button>
          </sup>
        ),
      )}
    </>
  );
}
