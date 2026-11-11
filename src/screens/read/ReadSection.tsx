import { Fragment } from 'react';
import { EnglishText } from '../../components/EnglishText';
import { SentenceText } from '../../components/Sentence';
import { spaceAfter, type PortionSection } from '../../domain/portion';
import type { GlossaryEntry, TranslationSpan } from '../../domain/types';
import { he } from '../../strings/he';

type Props = {
  section: PortionSection;
  showBiur: boolean;
  englishOpen: boolean;
  onToggleEnglish: (sectionId: string) => void;
  onTerm: (entry: GlossaryEntry) => void;
  onFootnote: (span: TranslationSpan, n: string) => void;
};

/** One short section: its sentences, each with its ביאור when shown, and its English on demand. */
export function ReadSection({
  section,
  showBiur,
  englishOpen,
  onToggleEnglish,
  onTerm,
  onFootnote,
}: Props) {
  const hasEnglish = section.english.length > 0;
  const paragraphOf = new Map(section.units.map((u) => [u.id, u.paragraph]));
  // A unit's English keeps its own spaces; only a new paragraph needs one added.
  const gapBefore = (i: number) =>
    i > 0 &&
    paragraphOf.get(section.english[i]!.from) !== paragraphOf.get(section.english[i - 1]!.from)
      ? ' '
      : '';
  return (
    <section className="read-section" data-section={section.id}>
      {hasEnglish && (
        <div className="section-tools">
          <button
            type="button"
            className={`en-chip${englishOpen ? ' en-chip--open' : ''}`}
            aria-pressed={englishOpen}
            aria-label={englishOpen ? he.read.englishHide : he.read.englishShow}
            onClick={() => onToggleEnglish(section.id)}
          >
            <bdi>{he.read.englishChip}</bdi>
          </button>
        </div>
      )}
      {section.paragraphs.map((p) => (
        <div key={p.key} className="section-paragraph">
          {p.sentences.map((s) => (
            <div key={s.id} className="sentence-block" data-unit={s.id}>
              <p className="sentence">
                {s.units.map((u, i) => (
                  <Fragment key={u.id}>
                    {i > 0 && spaceAfter(s.units[i - 1]!)}
                    <SentenceText unit={u} onTerm={onTerm} />
                  </Fragment>
                ))}
              </p>
              {showBiur && s.biur && <p className="biur">{s.biur.value}</p>}
            </div>
          ))}
        </div>
      ))}
      {hasEnglish && englishOpen && (
        <p className="english" dir="ltr" lang="en">
          {section.english.map((span, i) => (
            <Fragment key={span.from}>
              {gapBefore(i)}
              <EnglishText span={span} onFootnote={(n) => onFootnote(span, n)} />
            </Fragment>
          ))}
        </p>
      )}
    </section>
  );
}
