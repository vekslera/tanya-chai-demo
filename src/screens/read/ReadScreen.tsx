import { useEffect, useRef, useState } from 'react';
import { Dedication } from '../../components/Dedication';
import { GlossarySheet } from '../../components/GlossarySheet';
import { LanguageToggle } from '../../components/LanguageToggle';
import { TopBar } from '../../components/TopBar';
import { usePortion } from '../../content/PortionProvider';
import { hasEnglish, readingProgress } from '../../domain/reading';
import type { GlossaryEntry } from '../../domain/types';
import { ROUTES } from '../../routes';
import { useStore } from '../../store/StoreProvider';
import { he } from '../../strings/he';
import { useQuizSession } from '../quiz/useQuizSession';
import { FootnoteSheet, type Footnote } from './FootnoteSheet';
import { ReadQuestion } from './ReadQuestion';
import { ReadSection } from './ReadSection';
import { ReadProgress } from './ReadProgress';
import { useSectionBiur } from './useSectionBiur';
import './Read.css';

/**
 * The portion in short sections, each followed by its question (S3, S4): the text so far, each
 * section with its ביאור switch (S2), the English in English mode, and the next section once the
 * question is done.
 */
export function ReadScreen() {
  const { state, dispatch } = useStore();
  const { portion, sections } = usePortion();
  const session = useQuizSession('solo', ROUTES.read, ROUTES.home);
  const biur = useSectionBiur(session);
  const [term, setTerm] = useState<GlossaryEntry | null>(null);
  const [footnote, setFootnote] = useState<Footnote | null>(null);
  const body = useRef<HTMLDivElement>(null);

  // The sections read so far: up to the one the current question follows.
  const shown = session ? session.section + 1 : 0;
  const before = useRef(shown);
  useEffect(() => {
    // Bring the first section a question has just opened into view.
    if (shown > before.current) {
      const opened = sections[before.current]!.id;
      body.current?.querySelector(`[data-section="${opened}"]`)?.scrollIntoView({ block: 'start' });
    }
    before.current = shown;
  }, [shown, sections]);

  if (!session) return null;
  const { quiz } = session;

  return (
    <main className="screen read">
      <TopBar
        back={ROUTES.home}
        backLabel={he.read.backToHome}
        title={portion.label.he}
        end={
          hasEnglish(sections) && (
            <LanguageToggle
              english={state.english}
              onToggle={() => dispatch({ type: 'toggleEnglish' })}
            />
          )
        }
      >
        <ReadProgress percent={readingProgress(quiz.index, quiz.questionIds.length)} />
      </TopBar>

      <p className="read-location">{portion.location.he}</p>

      <div ref={body} className="read-body">
        {sections.slice(0, shown).map((s, i) => (
          <ReadSection
            key={s.id}
            section={s}
            n={i + 1}
            total={sections.length}
            showBiur={biur.shown(i)}
            onToggleBiur={() => biur.toggle(i)}
            tip={i === 0 && !state.seenBiurTip}
            english={state.english}
            onTerm={setTerm}
            onFootnote={(span, n) => setFootnote({ span, n })}
          />
        ))}
        <ReadQuestion key={session.question.id} session={session} />
      </div>

      <div className="bottom-bar">
        <Dedication />
      </div>

      <GlossarySheet entry={term} onClose={() => setTerm(null)} />
      <FootnoteSheet footnote={footnote} onClose={() => setFootnote(null)} />
    </main>
  );
}
