import { usePortion } from '../content/PortionProvider';
import { questionIdsFor } from '../domain/quiz';
import { isResumable } from '../domain/quizSession';
import { newSeed } from '../domain/shuffle';
import type { Level, Track } from '../domain/types';
import { navigate } from '../router';
import { trackRoute } from '../routes';
import { useStore } from './StoreProvider';

/** Starts a track's questions, or resumes those in progress for the same track and level. */
export function useStartQuiz() {
  const { state, dispatch } = useStore();
  const { portion, questionSection } = usePortion();
  return (track: Track, level?: Level) => {
    if (!isResumable(state.quiz, track, level)) {
      const questionIds = questionIdsFor(portion.questions, questionSection, track, level);
      dispatch({ type: 'startQuiz', track, level, questionIds, seed: newSeed() });
    }
    navigate(trackRoute(track));
  };
}
