import { QuoteCard } from '../../components/PortionText';
import { config } from '../../config';
import { pointsFor } from '../../domain/scoring';
import type { QuizStrings } from '../../strings/quiz';
import { answerLabel } from './labels';
import type { QuizSessionView } from './useQuizSession';

/**
 * What follows an answer: a hint to try again, praise, or the correct answer. With a `language`,
 * the sentence is quoted in its translation.
 */
export function QuizFeedback({
  session,
  t,
  language,
}: {
  session: QuizSessionView;
  t: QuizStrings;
  language?: string;
}) {
  const { question: q, quiz, chosen, phase, sentence } = session;
  const quote = <QuoteCard sentence={sentence} label={t.fromText} language={language} />;
  return (
    <div className="feedback" aria-live="polite">
      {phase === 'retry' && (
        <>
          <p className="feedback-line feedback-line--hint">{t.tryAgain}</p>
          <p className="feedback-hint">{q.hint.value}</p>
          {q.kind !== 'findSentence' && quote}
        </>
      )}
      {phase === 'correct' && (
        <>
          <p className="feedback-line feedback-line--praise">
            <span>{t.praise[quiz.index % t.praise.length]}</span>
            <bdi className="points-badge" dir="ltr">
              {t.points(pointsFor(chosen.length, config.scoring, q.level))}
            </bdi>
          </p>
          <p className="feedback-explanation">{q.explanation.value}</p>
          {quote}
        </>
      )}
      {phase === 'revealed' && (
        <>
          <p className="feedback-reveal">
            {t.revealed} <strong>{answerLabel(q, t)}</strong>
          </p>
          <p className="feedback-explanation">{q.explanation.value}</p>
          {quote}
        </>
      )}
    </div>
  );
}
