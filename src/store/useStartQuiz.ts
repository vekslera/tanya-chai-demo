import { usePortion } from '../content/PortionProvider';
import { questionIdsFor } from '../domain/quiz';
import { isResumable } from '../domain/quizSession';
import { newSeed } from '../domain/shuffle';
import type { Track } from '../domain/types';
import { navigate } from '../router';
import { trackRoute } from '../routes';
import { useStore } from './StoreProvider';

/** Starts a track's questions, at the current level on the solo track (S2), or resumes those in
 * progress on the same track. Either way, the lesson gets a new dedication (S3). */
export function useStartQuiz() {
  const { state, dispatch } = useStore();
  const { portion, questionSection } = usePortion();
  return (track: Track) => {
    dispatch({ type: 'pickDedication', seed: newSeed() });
    if (!isResumable(state.quiz, track)) {
      const questionIds = questionIdsFor(portion.questions, questionSection, track, state.level);
      dispatch({ type: 'startQuiz', track, questionIds, seed: newSeed() });
    }
    navigate(trackRoute(track));
  };
}
