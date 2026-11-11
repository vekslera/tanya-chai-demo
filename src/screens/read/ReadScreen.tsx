import { useMemo, useRef, useState } from 'react';
import { Dedication } from '../../components/Dedication';
import { GlossarySheet } from '../../components/GlossarySheet';
import { TopBar } from '../../components/TopBar';
import { config } from '../../config';
import { usePortion } from '../../content/PortionProvider';
import { englishSectionIds, isUnlocked, readingProgress, showsBiur } from '../../domain/reading';
import type { GlossaryEntry } from '../../domain/types';
import { useElapsed } from '../../hooks/useElapsed';
import { useSeen } from '../../hooks/useSeen';
import { ROUTES } from '../../routes';
import { useStore } from '../../store/StoreProvider';
import { useStartQuiz } from '../../store/useStartQuiz';
import { he } from '../../strings/he';
import { EnglishMenu } from './EnglishMenu';
import { FootnoteSheet, type Footnote } from './FootnoteSheet';
import { ReadSection } from './ReadSection';
import { ReadProgress } from './ReadProgress';
import './Read.css';

/** The portion's text in short sections, with the ביאור on level 2 and the English on demand (S3). */
export function ReadScreen() {
  const { state, dispatch } = useStore();
  const { portion, sections, sentences } = usePortion();
  const startQuiz = useStartQuiz();
  const [term, setTerm] = useState<GlossaryEntry | null>(null);
  const [footnote, setFootnote] = useState<Footnote | null>(null);
  const body = useRef<HTMLDivElement>(null);

  const sentenceIds = useMemo(() => sentences.map((s) => s.id), [sentences]);
  const seen = useSeen(body, sentenceIds, config.read.seenMargin, [sentences, state.level]);
  const timeUp = useElapsed(config.read.unlockAfterMs);
  const unlocked = isUnlocked(timeUp, seen, sentenceIds[sentenceIds.length - 1]!);
  const sectionIds = englishSectionIds(sections);
  const allEnglishOpen = sectionIds.length > 0 && sectionIds.every((id) => state.englishOpen[id]);

  return (
    <main className="screen read">
      <TopBar
        back={ROUTES.level}
        backLabel={he.read.backToLevel}
        title={portion.label.he}
        end={
          <EnglishMenu
            hasEnglish={sectionIds.length > 0}
            allOpen={allEnglishOpen}
            onSetAll={(open) => dispatch({ type: 'setAllEnglish', sectionIds, open })}
          />
        }
      >
        <ReadProgress percent={readingProgress(seen.size, sentences.length)} />
      </TopBar>

      <p className="read-location">{portion.location.he}</p>

      <div ref={body} className="read-body">
        {sections.map((s) => (
          <ReadSection
            key={s.id}
            section={s}
            showBiur={showsBiur(config.levels, state.level)}
            englishOpen={!!state.englishOpen[s.id]}
            onToggleEnglish={(sectionId) => dispatch({ type: 'toggleEnglish', sectionId })}
            onTerm={setTerm}
            onFootnote={(span, n) => setFootnote({ span, n })}
          />
        ))}
      </div>

      <div className="bottom-bar">
        <button
          type="button"
          className="btn btn-primary btn-block"
          disabled={!unlocked}
          onClick={() => startQuiz('solo', state.level)}
        >
          {he.read.toQuestions}
        </button>
        <Dedication />
      </div>

      <GlossarySheet entry={term} onClose={() => setTerm(null)} />
      <FootnoteSheet footnote={footnote} onClose={() => setFootnote(null)} />
    </main>
  );
}
