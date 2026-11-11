import { BottomSheet } from '../../components/BottomSheet';
import type { TranslationSpan } from '../../domain/types';
import { he } from '../../strings/he';

export type Footnote = { span: TranslationSpan; n: string };

/** A footnote of the English, opened from its mark. */
export function FootnoteSheet({
  footnote,
  onClose,
}: {
  footnote: Footnote | null;
  onClose: () => void;
}) {
  return (
    <BottomSheet
      open={footnote !== null}
      onClose={onClose}
      title={footnote ? he.read.footnote(footnote.n) : ''}
    >
      {footnote && (
        <p className="english english--note" dir="ltr" lang="en">
          {footnote.span.footnotes?.[footnote.n]}
        </p>
      )}
    </BottomSheet>
  );
}
