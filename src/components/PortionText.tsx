import type { PortionParagraph, PortionUnit } from '../domain/portion';
import type { AnswerState } from '../domain/quiz';
import './PortionText.css';

/** One sentence in a gold-highlighted quote card (SPEC §3.1, S4 feedback). */
export function QuoteCard({ unit, label }: { unit: PortionUnit; label?: string }) {
  return (
    <figure className="quote-card">
      {label && <figcaption className="quote-card-label">{label}</figcaption>}
      <blockquote className="quote-card-text">
        <mark>{unit.display}</mark>
      </blockquote>
    </figure>
  );
}

/**
 * The portion's text in compact form: used in the back-to-text sheet, and as the answer surface
 * of findSentence questions (each sentence is then a button).
 */
export function CompactText({
  paragraphs,
  highlight,
  highlightParagraph,
  states = {},
  onSelect,
}: {
  paragraphs: PortionParagraph[];
  highlight?: string;
  /** The key of a paragraph to mark as a hint. */
  highlightParagraph?: string;
  states?: Record<string, AnswerState>;
  onSelect?: (unitId: string) => void;
}) {
  return (
    <div className="compact-text">
      {paragraphs.map((p) => (
        <p
          key={p.key}
          className={`compact-paragraph${p.key === highlightParagraph ? ' compact-paragraph--hint' : ''}`}
        >
          {p.units.map((u) => {
            const cls = [
              'compact-sentence',
              u.id === highlight ? 'compact-sentence--highlight' : '',
              states[u.id] ? `compact-sentence--${states[u.id]}` : '',
            ]
              .filter(Boolean)
              .join(' ');
            return onSelect ? (
              <button
                key={u.id}
                type="button"
                className={cls}
                data-unit={u.id}
                onClick={() => onSelect(u.id)}
                aria-pressed={states[u.id] !== undefined}
              >
                {u.display}
              </button>
            ) : (
              <span key={u.id} className={cls} data-unit={u.id}>
                {u.display}{' '}
              </span>
            );
          })}
        </p>
      ))}
    </div>
  );
}
