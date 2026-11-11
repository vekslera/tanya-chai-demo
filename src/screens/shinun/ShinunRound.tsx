import { useState } from 'react';
import { firstLetter, roundWords } from '../../domain/shinun';
import { he } from '../../strings/he';

/**
 * One round: the sentence with this round's words hidden. A tap reveals a word; in the last round
 * only the first letter of each hidden word is shown as a cue.
 */
export function ShinunRound({
  sentence,
  round,
  rounds,
  onSuccess,
}: {
  sentence: string;
  round: number;
  rounds: readonly number[][];
  onSuccess: () => void;
}) {
  const [revealed, setRevealed] = useState<ReadonlySet<number>>(new Set());
  const lastRound = round === rounds.length - 1;
  return (
    <>
      <p className="shinun-round">
        {round === 0 ? he.shinun.roundZero : he.shinun.round(round, rounds.length - 1)}
      </p>
      <h1 className="shinun-instruction">
        {round === 0 ? he.shinun.readAloud : he.shinun.roundHidden}
      </h1>
      <p className="shinun-sentence">
        {roundWords(sentence, rounds[round]!, revealed).map((w) =>
          w.hidden ? (
            <button
              key={w.index}
              type="button"
              className="shinun-pill"
              aria-label={he.shinun.hiddenWord}
              onClick={() => setRevealed((s) => new Set(s).add(w.index))}
            >
              <span aria-hidden="true" className={lastRound ? '' : 'shinun-pill-blank'}>
                {lastRound ? firstLetter(w.text) : w.text}
              </span>
            </button>
          ) : (
            <span key={w.index} className="shinun-word">
              {w.text}
            </span>
          ),
        )}
      </p>
      <div className="shinun-actions">
        <button type="button" className="btn btn-gold btn-block" onClick={onSuccess}>
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
  );
}
