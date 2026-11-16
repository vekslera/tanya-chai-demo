import { Fragment } from 'react';
import { EnglishText } from '../../components/EnglishText';
import { SentenceText } from '../../components/Sentence';
import { config } from '../../config';
import { spaceAfter, type PortionSection } from '../../domain/portion';
import type { GlossaryEntry, TranslationSpan } from '../../domain/types';
import { SectionHead } from './SectionHead';

type Props = {
  section: PortionSection;
  /** The section's number, from 1, and how many there are. */
  n: number;
  total: number;
  showBiur: boolean;
  onToggleBiur: () => void;
  /** The first-time line under the ביאור switch (S2). */
  tip?: boolean;
  /** The lesson is read with its English: each sentence's translation, and its ביאור. */
  english: boolean;
  onTerm: (entry: GlossaryEntry) => void;
  onFootnote: (span: TranslationSpan, n: string) => void;
};

/**
 * One short section: its head with the ביאור switch, then sentence by sentence: the text, its
 * English in English mode, and its ביאור when shown, in English in English mode.
 */
export function ReadSection(props: Props) {
  const { section, n, total, showBiur, onToggleBiur, tip, english, onTerm, onFootnote } = props;
  const lang = config.translationLanguage;
  return (
    <section className="read-section" data-section={section.id}>
      <SectionHead n={n} total={total} biur={showBiur} onToggle={onToggleBiur} tip={tip} />
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
