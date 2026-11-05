import { glossarySegments } from '../domain/glossaryMarks';
import type { PortionUnit } from '../domain/portion';
import type { GlossaryEntry } from '../domain/types';
import './Sentence.css';

/**
 * A unit's text exactly as in the resource, with its glossary terms marked (SPEC §7). With
 * `onTerm`, each term is a button that opens its entry.
 */
export function SentenceText({
  unit,
  onTerm,
}: {
  unit: PortionUnit;
  onTerm?: (entry: GlossaryEntry) => void;
}) {
  return (
    <>
      {glossarySegments(unit.display, unit.glossary).map((s, i) =>
        s.kind === 'text' ? (
          s.text
        ) : (
          <span key={i} className="term-group">
            {s.before}
            {onTerm ? (
              <button
                type="button"
                className="term"
                onClick={() => onTerm(s.mark.entry)}
                aria-haspopup="dialog"
              >
                {s.term}
              </button>
            ) : (
              s.term
            )}
            {s.after}
          </span>
        ),
      )}
    </>
  );
}
