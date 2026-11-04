import type { GlossaryEntry } from '../content/types';
import { he } from '../strings/he';
import { BottomSheet } from './BottomSheet';

export function GlossarySheet({
  entry,
  onClose,
}: {
  entry: GlossaryEntry | null;
  onClose: () => void;
}) {
  return (
    <BottomSheet open={entry !== null} onClose={onClose} title={entry?.term ?? ''}>
      {entry && (
        <>
          <p className="glossary-body">{entry.body.value}</p>
          {entry.source && (
            <p className="glossary-source">
              {he.glossary.source}: {entry.source}
            </p>
          )}
        </>
      )}
    </BottomSheet>
  );
}
