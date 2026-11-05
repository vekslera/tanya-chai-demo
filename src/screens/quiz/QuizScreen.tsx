import { useState } from 'react';
import { ProgressDots } from '../../components/ProgressDots';
import { TopBar } from '../../components/TopBar';
import { ROUTES } from '../../routes';
import { he } from '../../strings/he';
import { FindSentence } from './FindSentence';
import { QuizFeedback } from './QuizFeedback';
import { QuizFooter } from './QuizFooter';
import { QuizOptions } from './QuizOptions';
import { useQuizSession } from './useQuizSession';
import './Quiz.css';

/** The Matmid questions (S4): two attempts, then the answer with its source in the text. */
export function QuizScreen() {
  const session = useQuizSession('solo', ROUTES.quiz, ROUTES.level);
  // The option to shake after a wrong answer.
  const [shake, setShake] = useState<string | null>(null);
  if (!session) return null;
  const { quiz, question: q } = session;

  const answer = (choice: string) => {
    const result = session.answer(choice);
    if (result) setShake(result === 'wrong' ? choice : null);
  };

  return (
    <main className="screen quiz">
      <TopBar
        back={ROUTES.read}
        backLabel={he.quiz.backToText}
        title={<ProgressDots count={quiz.questionIds.length} current={quiz.index} />}
      />

      <p className="quiz-count">{he.quiz.progress(quiz.index + 1, quiz.questionIds.length)}</p>
      <h1 className="quiz-prompt">{q.prompt.value}</h1>

      {q.kind === 'findSentence' ? (
        <FindSentence session={session} onAnswer={answer} />
      ) : (
        <QuizOptions session={session} shake={shake} onAnswer={answer} />
      )}

      <QuizFeedback session={session} />
      <QuizFooter
        session={session}
        onNext={() => {
          setShake(null);
          session.next();
        }}
      />
    </main>
  );
}
