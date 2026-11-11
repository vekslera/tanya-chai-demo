import { useState } from 'react';
import { canAnswer } from '../../domain/quiz';
import { he } from '../../strings/he';
import { FindSentence } from '../quiz/FindSentence';
import { QuizFeedback } from '../quiz/QuizFeedback';
import { QuizOptions } from '../quiz/QuizOptions';
import type { QuizSessionView } from '../quiz/useQuizSession';
import '../quiz/Quiz.css';

/**
 * The question that follows a section (S4): two attempts, then the answer; then on to the next
 * section, or, after the summary question, to the finish.
 */
export function ReadQuestion({ session }: { session: QuizSessionView }) {
  // The option to shake after a wrong answer.
  const [shake, setShake] = useState<string | null>(null);
  const { quiz, question: q, phase, isLast } = session;

  const answer = (choice: string) => {
    const result = session.answer(choice);
    if (result) setShake(result === 'wrong' ? choice : null);
  };

  return (
    <section className="read-question">
      <p className="quiz-count">
        {q.summary ? he.quiz.summary : he.quiz.progress(quiz.index + 1, quiz.questionIds.length)}
      </p>
      <h2 className="quiz-prompt">{q.prompt.value}</h2>

      {q.kind === 'findSentence' ? (
        <FindSentence session={session} onAnswer={answer} />
      ) : (
        <QuizOptions session={session} shake={shake} onAnswer={answer} />
      )}

      <QuizFeedback session={session} />
      {!canAnswer(phase) && (
        <button type="button" className="btn btn-primary btn-block" onClick={session.next}>
          {isLast ? he.quiz.finish : he.quiz.next}
        </button>
      )}
    </section>
  );
}
