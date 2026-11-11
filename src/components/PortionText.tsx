import { sentenceText, type PortionParagraph, type PortionSentence } from '../domain/portion';
import type { AnswerState } from '../domain/quiz';
import './PortionText.css';

/** One sentence in a gold-highlighted quote card (SPEC §3.1, S4 feedback). */
export function QuoteCard({ sentence, label }: { sentence: PortionSentence; label?: string }) {
  return (
    <figure className="quote-card">
      {label && <figcaption className="quote-card-label">{label}</figcaption>}
      <blockquote className="quote-card-text">
        <mark>{sentenceText(sentence)}</mark>
      </blockquote>
    </figure>
  );
}

/**
 * The portion's text in compact form, sentence by sentence: used in the back-to-text sheet, and
 * as the answer surface of findSentence questions (each sentence is then a button).
 */
export function CompactText({
  paragraphs,
  highlight,
  highlightParagraph,
  states = {},
  onSelect,
}: {
  paragraphs: PortionParagraph[];
  /** The ID of a sentence to mark. */
  highlight?: string;
  /** The key of a paragraph to mark as a hint. */
  highlightParagraph?: string;
  states?: Record<string, AnswerState>;
  onSelect?: (sentenceId: string) => void;
}) {
  return (
    <div className="compact-text">
      {paragraphs.map((p) => (
        <p
          key={p.key}
          className={`compact-paragraph${p.key === highlightParagraph ? ' compact-paragraph--hint' : ''}`}
        >
          {p.sentences.map((s) => {
            const cls = [
              'compact-sentence',
              s.id === highlight ? 'compact-sentence--highlight' : '',
              states[s.id] ? `compact-sentence--${states[s.id]}` : '',
            ]
              .filter(Boolean)
              .join(' ');
            return onSelect ? (
              <button
                key={s.id}
                type="button"
                className={cls}
                data-unit={s.id}
                onClick={() => onSelect(s.id)}
                aria-pressed={states[s.id] !== undefined}
              >
                {sentenceText(s)}
              </button>
            ) : (
              <span key={s.id} className={cls} data-unit={s.id}>
                {sentenceText(s)}{' '}
              </span>
            );
          })}
        </p>
      ))}
    </div>
  );
}
