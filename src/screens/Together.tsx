import { useState } from 'react';
import { GlossarySheet } from '../components/GlossarySheet';
import { HeartMark } from '../components/HeartMark';
import { ProgressDots } from '../components/ProgressDots';
import { SentenceText } from '../components/Sentence';
import { TopBar } from '../components/TopBar';
import { usePortion } from '../content/PortionContext';
import type { GlossaryEntry } from '../content/types';
import { useStore } from '../store/store';
import { useStartQuiz } from '../store/useStartQuiz';
import { he } from '../strings/he';
import './Together.css';

/** Avos uBanim (S8): one thought per card; the father reads, explains and asks. */
export function TogetherScreen() {
  const { state, dispatch } = useStore();
  const portion = usePortion();
  const startQuiz = useStartQuiz();
  const [term, setTerm] = useState<GlossaryEntry | null>(null);
  const cards = portion.portion.together;
  const n = cards.length;
  // -1: intro; 0..n-1: cards; n: the child's turn.
  const index = Math.max(-1, Math.min(n, state.togetherIndex));
  const go = (i: number) => {
    dispatch({ type: 'setTogetherIndex', index: i });
    window.scrollTo(0, 0);
  };

  if (index === -1) {
    return (
      <main className="screen together together--center">
        <TopBar back="/" />
        <div className="together-intro">
          <HeartMark progress={state.heartProgress} beating size={120} />
          <h1 className="together-title">{he.together.title}</h1>
          <p className="together-intro-text">{he.together.intro}</p>
          <button type="button" className="btn btn-gold btn-big btn-block" onClick={() => go(0)}>
            {he.together.start}
          </button>
        </div>
      </main>
    );
  }

  if (index === n) {
    return (
      <main className="screen together together--center">
        <TopBar back="/" />
        <div className="together-intro">
          <h1 className="together-title">{he.together.childTurn}</h1>
          <p className="together-intro-text">{he.together.childTurnText}</p>
          <button
            type="button"
            className="btn btn-gold btn-big btn-block"
            onClick={() => startQuiz('together')}
          >
            {he.together.toChildQuestions}
          </button>
          <button type="button" className="link-btn" onClick={() => go(n - 1)}>
            {he.together.backToCards}
          </button>
        </div>
      </main>
    );
  }

  const card = cards[index]!;
  const units = portion.units.filter((u) => {
    const lo = portion.unit(card.from)!.seq;
    const hi = portion.unit(card.to)!.seq;
    return u.seq >= lo && u.seq <= hi;
  });

  return (
    <main className="screen together">
      <TopBar back="/" title={he.together.title} />
      <p className="together-progress">
        <span>{he.together.cardOf(index + 1, n)}</span>
        <ProgressDots count={n} current={index} />
      </p>

      <article className="together-card" key={card.id}>
        <p className="together-text">
          {units.map((u) => (
            <span key={u.id}>
              <SentenceText unit={u} onTerm={setTerm} />{' '}
            </span>
          ))}
        </p>

        <section className="together-section">
          <h2 className="together-label">{he.together.forParent}</h2>
          <p className="together-parent">{card.forParent.value}</p>
        </section>

        <section className="together-section together-child">
          <h2 className="together-label">{he.together.toChild}</h2>
          <p>{card.toChild.value}</p>
        </section>

        {card.talk && (
          <section className="together-section together-talk">
            <h2 className="together-label">{he.together.talk}</h2>
            <p>{card.talk.value}</p>
          </section>
        )}
      </article>

      <nav className="together-nav">
        <button type="button" className="btn btn-secondary btn-big" onClick={() => go(index - 1)}>
          {he.common.prev}
        </button>
        <button type="button" className="btn btn-primary btn-big" onClick={() => go(index + 1)}>
          {he.common.next}
        </button>
      </nav>

      <GlossarySheet entry={term} onClose={() => setTerm(null)} />
    </main>
  );
}
