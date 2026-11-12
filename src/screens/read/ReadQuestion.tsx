import { useState } from 'react';
import { config } from '../../config';
import { canAnswer, questionIn } from '../../domain/quiz';
import { useStore } from '../../store/StoreProvider';
import { quizStrings } from '../../strings/quiz';
import { FindSentence } from '../quiz/FindSentence';
import { QuizFeedback } from '../quiz/QuizFeedback';
import { QuizOptions } from '../quiz/QuizOptions';
import type { QuizSessionView } from '../quiz/useQuizSession';
import '../quiz/Quiz.css';

/**
 * The question that follows a section (S4): two attempts, then the answer; then on to the next
 * section, or, after the summary question, to the finish. In English mode it is asked in English,
 * quoting the English translation.
 */
export function ReadQuestion({ session }: { session: QuizSessionView }) {
  const { state } = useStore();
  // The option to shake after a wrong answer.
  const [shake, setShake] = useState<string | null>(null);
  const translation = state.english ? config.translationLanguage : undefined;
  const t = quizStrings(translation ?? config.language);
  const view = { ...session, question: questionIn(session.question, translation) };
  const { quiz, question: q, phase, isLast } = view;

  const answer = (choice: string) => {
    const result = session.answer(choice);
    if (result) setShake(result === 'wrong' ? choice : null);
  };

  return (
    <section className="read-question" {...(translation ? { dir: 'ltr', lang: translation } : {})}>
      <p className="quiz-count">
        {q.summary ? t.summary : t.progress(quiz.index + 1, quiz.questionIds.length)}
      </p>
      <h2 className="quiz-prompt">{q.prompt.value}</h2>

      {q.kind === 'findSentence' ? (
        <FindSentence session={view} onAnswer={answer} t={t} language={translation} />
      ) : (
        <QuizOptions session={view} shake={shake} onAnswer={answer} t={t} />
      )}

      <QuizFeedback session={view} t={t} language={translation} />
      {!canAnswer(phase) && (
        <button type="button" className="btn btn-primary btn-block" onClick={session.next}>
          {isLast ? t.finish : t.next}
        </button>
      )}
    </section>
  );
}
