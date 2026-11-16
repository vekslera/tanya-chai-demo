import { useEffect } from 'react';
import { config } from '../../config';
import { usePortion } from '../../content/PortionProvider';
import { canAnswer, maxAttemptsFor, phaseOf } from '../../domain/quiz';
import { currentQuestionId, isLastQuestion } from '../../domain/quizSession';
import type { Track } from '../../domain/types';
import { navigate, redirectFrom } from '../../router';
import { ROUTES, type Route } from '../../routes';
import { useStore } from '../../store/StoreProvider';

/**
 * The current question of the quiz in progress on `track`, and the actions on it. Returns null
 * while there is nothing to show; without a quiz, it leaves `route` for `fallback`, if given.
 */
export function useQuizSession(track: Track, route: Route, fallback?: Route) {
  const { state, dispatch } = useStore();
  const portion = usePortion();
  const quiz = state.quiz?.track === track ? state.quiz : null;

  useEffect(() => {
    if (!quiz && fallback) redirectFrom(route, fallback);
  }, [quiz, route, fallback]);

  const question = quiz && portion.portion.questions.find((x) => x.id === currentQuestionId(quiz));
  if (!quiz || !question) return null;

  const chosen = quiz.chosen[question.id] ?? [];
  const maxAttempts = maxAttemptsFor(question, config.quiz);
  const phase = phaseOf(chosen, !!quiz.solved[question.id], maxAttempts);
  const isLast = isLastQuestion(quiz);

  return {
    quiz,
    question,
    chosen,
    phase,
    isLast,
    /** After which section the question is asked. */
    section: portion.questionSection(question),
    /** The unit the question relies on, and its whole sentence. */
    unit: portion.unit(question.unitRef)!,
    sentence: portion.sentenceOf(question.unitRef)!,
    /** Records an answer; null when the question takes no answer now, or this one was tried. */
    answer(choice: string): AnswerResult | null {
      if (!canAnswer(phase) || chosen.includes(choice)) return null;
      const correct = choice === question.answer;
      dispatch({
        type: 'answer',
        questionId: question.id,
        choice,
        correct,
        maxAttempts,
        level: question.level,
      });
      return correct ? 'correct' : 'wrong';
    },
    next() {
      if (isLast) {
        dispatch({ type: 'completeQuiz' });
        navigate(ROUTES.done);
      } else {
        dispatch({ type: 'nextQuestion' });
      }
    },
  };
}

export type AnswerResult = 'correct' | 'wrong';

export type QuizSessionView = NonNullable<ReturnType<typeof useQuizSession>>;
