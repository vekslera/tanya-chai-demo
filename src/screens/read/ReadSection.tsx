import { Fragment } from 'react';
import { EnglishText } from '../../components/EnglishText';
import { SentenceText } from '../../components/Sentence';
import { config } from '../../config';
import { spaceAfter, type PortionSection } from '../../domain/portion';
import type { GlossaryEntry, TranslationSpan } from '../../domain/types';

type Props = {
  section: PortionSection;
  showBiur: boolean;
  /** The lesson is read with its English: each sentence's translation, and its ביאור. */
  english: boolean;
  onTerm: (entry: GlossaryEntry) => void;
  onFootnote: (span: TranslationSpan, n: string) => void;
};

/**
 * One short section, sentence by sentence: the text, its English in English mode, and its ביאור
 * when shown, in English in English mode.
 */
export function ReadSection({ section, showBiur, english, onTerm, onFootnote }: Props) {
  const lang = config.translationLanguage;
  return (
    <section className="read-section" data-section={section.id}>
      {section.paragraphs.map((p) => (
        <div key={p.key} className="section-paragraph">
          {p.sentences.map((s) => {
            const translated = english && s.translationBiur;
            const biur = translated || s.biur;
            return (
              <div key={s.id} className="sentence-block" data-unit={s.id}>
                <p className="sentence">
                  {s.units.map((u, i) => (
                    <Fragment key={u.id}>
                      {i > 0 && spaceAfter(s.units[i - 1]!)}
                      <SentenceText unit={u} onTerm={onTerm} />
                    </Fragment>
                  ))}
                </p>
                {/* The spans of a sentence are in one paragraph: they join as written. */}
                {english && s.english.length > 0 && (
                  <p className="english" dir="ltr" lang={lang}>
                    {s.english.map((span) => (
                      <EnglishText
                        key={span.from}
                        span={span}
                        onFootnote={(n) => onFootnote(span, n)}
                      />
                    ))}
                  </p>
                )}
                {showBiur && biur && (
                  <p className="biur" {...(translated ? { dir: 'ltr', lang } : {})}>
                    {biur.value}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </section>
  );
}
