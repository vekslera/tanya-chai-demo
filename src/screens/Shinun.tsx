import { useEffect, useState } from 'react';
import { TopBar } from '../components/TopBar';
import { usePortion } from '../content/PortionContext';
import { navigate } from '../router';
import { useStore } from '../store/store';
import { he } from '../strings/he';
import './Shinun.css';

/** The first letter of a word with its nikud, keeping any punctuation before it (״אַ...). */
function firstLetter(word: string): string {
  return word.match(/^[^א-ת]*[א-ת][֑-ׇ]*/)?.[0] ?? word;
}

/** A taste of Shinun (S6): one sentence, words hidden round by round. No microphone. */
export function ShinunScreen() {
  const { dispatch } = useStore();
  const portion = usePortion();
  const shinun = portion.portion.shinun;
  const [round, setRound] = useState(0);
  const [revealed, setRevealed] = useState<ReadonlySet<number>>(new Set());
  const unit = shinun ? portion.unit(shinun.unitId) : undefined;
  const rounds = shinun?.rounds ?? [];
  const finished = round >= rounds.length;

  useEffect(() => {
    if (finished) dispatch({ type: 'seenShinun' });
  }, [finished, dispatch]);

  if (!shinun || !unit) return null;
  const words = unit.display.split(/\s+/);
  const hidden = new Set(rounds[round] ?? []);
  const lastRound = round === rounds.length - 1;

  const advance = () => {
    setRevealed(new Set());
    setRound((r) => r + 1);
  };

  return (
    <main className="screen shinun">
      <TopBar back="/done" title={he.shinun.title} />
      {finished ? (
        <section className="shinun-end">
          <h1 className="screen-title">{he.shinun.finishedTitle}</h1>
          <p className="shinun-sentence">{unit.display}</p>
          <p className="shinun-note">{he.shinun.finishedNote}</p>
          <button type="button" className="btn btn-primary btn-block" onClick={() => navigate('/')}>
            {he.shinun.home}
          </button>
        </section>
      ) : (
        <>
          <p className="shinun-round">
            {round === 0 ? he.shinun.roundZero : he.shinun.round(round, rounds.length - 1)}
          </p>
          <h1 className="shinun-instruction">
            {round === 0 ? he.shinun.readAloud : he.shinun.roundHidden}
          </h1>
          <p className="shinun-sentence">
            {words.map((w, i) =>
              hidden.has(i) && !revealed.has(i) ? (
                <button
                  key={`${round}-${i}`}
                  type="button"
                  className="shinun-pill"
                  aria-label={he.shinun.hiddenWord}
                  onClick={() => setRevealed((s) => new Set(s).add(i))}
                >
                  <span aria-hidden="true" className={lastRound ? '' : 'shinun-pill-blank'}>
                    {lastRound ? firstLetter(w) : w}
                  </span>
                </button>
              ) : (
                <span key={`${round}-${i}`} className="shinun-word">
                  {w}
                </span>
              ),
            )}
          </p>
          <div className="shinun-actions">
            <button type="button" className="btn btn-gold btn-block" onClick={advance}>
              {he.shinun.success}
            </button>
            {round > 0 && (
              <button
                type="button"
                className="btn btn-secondary btn-block"
                onClick={() => setRevealed(new Set())}
              >
                {he.shinun.again}
              </button>
            )}
          </div>
        </>
      )}
    </main>
  );
}
