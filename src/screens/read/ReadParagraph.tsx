import { Fragment } from 'react';
import { EnglishText } from '../../components/EnglishText';
import { SentenceText } from '../../components/Sentence';
import type { PortionParagraph } from '../../domain/portion';
import type { GlossaryEntry, TranslationSpan } from '../../domain/types';
import { he } from '../../strings/he';

type Props = {
  paragraph: PortionParagraph;
  showBiur: boolean;
  englishOpen: boolean;
  onToggleEnglish: (spanId: string) => void;
  onTerm: (entry: GlossaryEntry) => void;
  onFootnote: (span: TranslationSpan, n: string) => void;
};

/** One paragraph: its sentences, each with its ביאור when shown, and its English on demand. */
export function ReadParagraph({
  paragraph,
  showBiur,
  englishOpen,
  onToggleEnglish,
  onTerm,
  onFootnote,
}: Props) {
  const span = paragraph.translation;
  return (
    <section className="paragraph">
      {span && (
        <div className="paragraph-tools">
          <button
            type="button"
            className={`en-chip${englishOpen ? ' en-chip--open' : ''}`}
            aria-pressed={englishOpen}
            aria-label={englishOpen ? he.read.englishHide : he.read.englishShow}
            onClick={() => onToggleEnglish(span.from)}
          >
            <bdi>{he.read.englishChip}</bdi>
          </button>
        </div>
      )}
      {paragraph.sentences.map((s) => (
        <div key={s.id} className="sentence-block" data-unit={s.id}>
          <p className="sentence">
            {s.units.map((u, i) => (
              <Fragment key={u.id}>
                {i > 0 && ' '}
                <SentenceText unit={u} onTerm={onTerm} />
              </Fragment>
            ))}
          </p>
          {showBiur && s.biur && <p className="biur">{s.biur.value}</p>}
        </div>
      ))}
      {span && englishOpen && (
        <p className="english" dir="ltr" lang="en">
          <EnglishText span={span} onFootnote={(n) => onFootnote(span, n)} />
        </p>
      )}
    </section>
  );
}
