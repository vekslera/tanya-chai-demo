import { useEffect, useRef, useState } from 'react';
import { Dedication } from '../../components/Dedication';
import { GlossarySheet } from '../../components/GlossarySheet';
import { LanguageToggle } from '../../components/LanguageToggle';
import { TopBar } from '../../components/TopBar';
import { config } from '../../config';
import { usePortion } from '../../content/PortionProvider';
import { hasEnglish, readingProgress, showsBiur } from '../../domain/reading';
import type { GlossaryEntry } from '../../domain/types';
import { ROUTES } from '../../routes';
import { useStore } from '../../store/StoreProvider';
import { he } from '../../strings/he';
import { useQuizSession } from '../quiz/useQuizSession';
import { FootnoteSheet, type Footnote } from './FootnoteSheet';
import { ReadQuestion } from './ReadQuestion';
import { ReadSection } from './ReadSection';
import { ReadProgress } from './ReadProgress';
import './Read.css';

/**
 * The portion in short sections, each followed by its question (S3, S4): the text so far, with the
 * ביאור on level 2, the English in English mode, and the next section once the question is done.
 */
export function ReadScreen() {
  const { state, dispatch } = useStore();
  const { portion, sections } = usePortion();
  const session = useQuizSession('solo', ROUTES.read, ROUTES.level);
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
        back={ROUTES.level}
        backLabel={he.read.backToLevel}
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
        {sections.slice(0, shown).map((s) => (
          <ReadSection
            key={s.id}
            section={s}
            showBiur={showsBiur(config.levels, state.level)}
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
