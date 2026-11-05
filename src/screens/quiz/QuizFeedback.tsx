import { QuoteCard } from '../../components/PortionText';
import { config } from '../../config';
import { pointsFor } from '../../domain/scoring';
import { he } from '../../strings/he';
import { answerLabel } from './labels';
import type { QuizSessionView } from './useQuizSession';

/** What follows an answer: a hint to try again, praise, or the correct answer. */
export function QuizFeedback({ session }: { session: QuizSessionView }) {
  const { question: q, quiz, chosen, phase, unit } = session;
  const quote = <QuoteCard unit={unit} label={he.quiz.fromText} />;
  return (
    <div className="feedback" aria-live="polite">
      {phase === 'retry' && (
        <>
          <p className="feedback-line feedback-line--hint">{he.quiz.tryAgain}</p>
          <p className="feedback-hint">{q.hint.value}</p>
          {q.kind !== 'findSentence' && quote}
        </>
      )}
      {phase === 'correct' && (
        <>
          <p className="feedback-line feedback-line--praise">
            <span>{he.quiz.praise[quiz.index % he.quiz.praise.length]}</span>
            <bdi className="points-badge" dir="ltr">
              {he.quiz.points(pointsFor(chosen.length, config.scoring))}
            </bdi>
          </p>
          <p className="feedback-explanation">{q.explanation.value}</p>
          {quote}
        </>
      )}
      {phase === 'revealed' && (
        <>
          <p className="feedback-reveal">
            {he.quiz.revealed} <strong>{answerLabel(q)}</strong>
          </p>
          <p className="feedback-explanation">{q.explanation.value}</p>
          {quote}
        </>
      )}
    </div>
  );
}
