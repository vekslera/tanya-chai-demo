import { useEffect } from 'react';
import { CheckIcon } from '../components/Icons';
import { QuoteCard } from '../components/PortionText';
import { ProgressDots } from '../components/ProgressDots';
import { TopBar } from '../components/TopBar';
import { usePortion } from '../content/PortionContext';
import { optionsOf } from '../content/options';
import { navigate, redirectFrom } from '../router';
import { pointsFor } from '../store/logic';
import { useStore } from '../store/store';
import { he } from '../strings/he';
import './Together.css';
import './TogetherQuiz.css';

/** The son's questions (S9): large buttons, no red, try again as often as needed. */
export function TogetherQuizScreen() {
  const { state, dispatch } = useStore();
  const portion = usePortion();
  const quiz = state.quiz?.track === 'together' ? state.quiz : null;

  useEffect(() => {
    if (!quiz) redirectFrom('/together/quiz', '/together');
  }, [quiz]);
  if (!quiz) return null;

  const q = portion.portion.questions.find((x) => x.id === quiz.questionIds[quiz.index]);
  if (!q) return null;
  const options = optionsOf(q, quiz.seed);
  const chosen = quiz.chosen[q.id] ?? [];
  const solved = !!quiz.solved[q.id];
  const wrongLast = chosen.length > 0 && !solved;
  const isLast = quiz.index === quiz.questionIds.length - 1;
  const unit = portion.unit(q.unitRef)!;
  const card = portion.portion.together.find((c) => {
    const seq = unit.seq;
    return seq >= portion.unit(c.from)!.seq && seq <= portion.unit(c.to)!.seq;
  });

  const answer = (id: string) => {
    if (solved || chosen.includes(id)) return;
    dispatch({
      type: 'answer',
      questionId: q.id,
      choice: id,
      correct: id === q.answer,
      maxAttempts: options.length,
    });
  };

  const next = () => {
    if (isLast) {
      dispatch({ type: 'completeQuiz' });
      navigate('/done');
    } else {
      dispatch({ type: 'nextQuestion' });
      window.scrollTo(0, 0);
    }
  };

  return (
    <main className="screen together child-quiz">
      <TopBar
        back="/together"
        title={<ProgressDots count={quiz.questionIds.length} current={quiz.index} />}
      />
      <p className="child-quiz-count">{he.togetherQuiz.title}</p>
      <h1 className="child-prompt">{q.prompt.value}</h1>

      <div className="child-options" role="group" aria-label={q.prompt.value}>
        {options.map((o) => {
          const isCorrect = solved && o.id === q.answer;
          const tried = chosen.includes(o.id) && o.id !== q.answer;
          return (
            <button
              key={o.id}
              type="button"
              className={`child-option${isCorrect ? ' child-option--correct' : ''}${tried ? ' child-option--tried' : ''}`}
              onClick={() => answer(o.id)}
              disabled={solved || tried}
            >
              <span>{o.text}</span>
              {isCorrect && <CheckIcon size={26} />}
            </button>
          );
        })}
      </div>

      <div className="child-feedback" aria-live="polite">
        {solved && (
          <div className="child-correct">
            <p className="child-correct-line">
              {he.togetherQuiz.correct[quiz.index % he.togetherQuiz.correct.length]}
            </p>
            <bdi className="child-points" dir="ltr">
              {he.togetherQuiz.points(pointsFor(chosen.length))}
            </bdi>
          </div>
        )}
        {wrongLast && (
          <>
            <p className="child-try-again">{he.togetherQuiz.tryAgain}</p>
            <QuoteCard unit={unit} label={he.togetherQuiz.fromText} />
            {card && (
              <section className="together-section together-child">
                <h2 className="together-label">{he.togetherQuiz.fatherSaid}</h2>
                <p>{card.toChild.value}</p>
              </section>
            )}
          </>
        )}
      </div>

      {solved && (
        <div className="together-nav together-nav--single">
          <button type="button" className="btn btn-primary btn-big btn-block" onClick={next}>
            {isLast ? he.togetherQuiz.finish : he.togetherQuiz.next}
          </button>
        </div>
      )}
    </main>
  );
}
