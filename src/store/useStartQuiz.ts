import { usePortion } from '../content/PortionProvider';
import { questionIdsFor } from '../domain/quiz';
import { isResumable } from '../domain/quizSession';
import { newSeed } from '../domain/shuffle';
import type { Level, Track } from '../domain/types';
import { navigate } from '../router';
import { quizRoute } from '../routes';
import { useStore } from './StoreProvider';

/** Starts a quiz, or resumes the one in progress for the same track and level. */
export function useStartQuiz() {
  const { state, dispatch } = useStore();
  const { portion } = usePortion();
  return (track: Track, level?: Level) => {
    if (!isResumable(state.quiz, track, level)) {
      const questionIds = questionIdsFor(portion.questions, track, level);
      dispatch({ type: 'startQuiz', track, level, questionIds, seed: newSeed() });
    }
    navigate(quizRoute(track));
  };
}
