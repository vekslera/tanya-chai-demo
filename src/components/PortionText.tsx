import {
  sentenceText,
  sentenceTranslation,
  type PortionParagraph,
  type PortionSentence,
} from '../domain/portion';
import type { AnswerState } from '../domain/quiz';
import './PortionText.css';

/**
 * A sentence's text: its translation in `language` when asked for and it has one, with the
 * language's attributes; else the text itself.
 */
function textOf(s: PortionSentence, language?: string) {
  const translated = language ? sentenceTranslation(s) : '';
  return translated
    ? { text: translated, attrs: { dir: 'ltr', lang: language } }
    : { text: sentenceText(s), attrs: {} };
}

/** One sentence in a gold-highlighted quote card (SPEC §3.1, S4 feedback). */
export function QuoteCard({
  sentence,
  label,
  language,
}: {
  sentence: PortionSentence;
  label?: string;
  /** Quote the sentence's translation in this language. */
  language?: string;
}) {
  const { text, attrs } = textOf(sentence, language);
  return (
    <figure className="quote-card">
      {label && <figcaption className="quote-card-label">{label}</figcaption>}
      <blockquote className="quote-card-text" {...attrs}>
        <mark>{text}</mark>
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
  language,
}: {
  paragraphs: PortionParagraph[];
  /** The ID of a sentence to mark. */
  highlight?: string;
  /** The key of a paragraph to mark as a hint. */
  highlightParagraph?: string;
  states?: Record<string, AnswerState>;
  onSelect?: (sentenceId: string) => void;
  /** Show each sentence's translation in this language. */
  language?: string;
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
            const { text, attrs } = textOf(s, language);
            return onSelect ? (
              <button
                key={s.id}
                type="button"
                className={cls}
                data-unit={s.id}
                onClick={() => onSelect(s.id)}
                aria-pressed={states[s.id] !== undefined}
                {...attrs}
              >
                {text}
              </button>
            ) : (
              <span key={s.id} className={cls} data-unit={s.id} {...attrs}>
                {text}{' '}
              </span>
            );
          })}
        </p>
      ))}
    </div>
  );
}
