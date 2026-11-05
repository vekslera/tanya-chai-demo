import { useMemo, useRef, useState } from 'react';
import { GlossarySheet } from '../../components/GlossarySheet';
import { TopBar } from '../../components/TopBar';
import { config } from '../../config';
import { usePortion } from '../../content/PortionProvider';
import { englishSpanIds, isUnlocked, readingProgress, showsBiur } from '../../domain/reading';
import type { GlossaryEntry } from '../../domain/types';
import { useElapsed } from '../../hooks/useElapsed';
import { useSeen } from '../../hooks/useSeen';
import { ROUTES } from '../../routes';
import { useStore } from '../../store/StoreProvider';
import { useStartQuiz } from '../../store/useStartQuiz';
import { he } from '../../strings/he';
import { EnglishMenu } from './EnglishMenu';
import { FootnoteSheet, type Footnote } from './FootnoteSheet';
import { ReadParagraph } from './ReadParagraph';
import { ReadProgress } from './ReadProgress';
import './Read.css';

/** The portion's text, with the ביאור on level 2 and the English on demand (S3). */
export function ReadScreen() {
  const { state, dispatch } = useStore();
  const { portion, paragraphs, units } = usePortion();
  const startQuiz = useStartQuiz();
  const [term, setTerm] = useState<GlossaryEntry | null>(null);
  const [footnote, setFootnote] = useState<Footnote | null>(null);
  const body = useRef<HTMLDivElement>(null);

  const unitIds = useMemo(() => units.map((u) => u.id), [units]);
  const seen = useSeen(body, unitIds, config.read.seenMargin, [units, state.level]);
  const timeUp = useElapsed(config.read.unlockAfterMs);
  const unlocked = isUnlocked(timeUp, seen, unitIds[unitIds.length - 1]!);
  const spanIds = englishSpanIds(paragraphs);
  const allEnglishOpen = spanIds.length > 0 && spanIds.every((id) => state.englishOpen[id]);

  return (
    <main className="screen read">
      <TopBar
        back={ROUTES.level}
        backLabel={he.read.backToLevel}
        title={portion.label.he}
        end={
          <EnglishMenu
            hasEnglish={spanIds.length > 0}
            allOpen={allEnglishOpen}
            onSetAll={(open) => dispatch({ type: 'setAllEnglish', spanIds, open })}
          />
        }
      >
        <ReadProgress percent={readingProgress(seen.size, units.length)} />
      </TopBar>

      <p className="read-location">{portion.location.he}</p>

      <div ref={body} className="read-body">
        {paragraphs.map((p) => (
          <ReadParagraph
            key={p.key}
            paragraph={p}
            showBiur={showsBiur(config.levels, state.level)}
            englishOpen={!!p.translation && !!state.englishOpen[p.translation.from]}
            onToggleEnglish={(spanId) => dispatch({ type: 'toggleEnglish', spanId })}
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
      </div>

      <GlossarySheet entry={term} onClose={() => setTerm(null)} />
      <FootnoteSheet footnote={footnote} onClose={() => setFootnote(null)} />
    </main>
  );
}
