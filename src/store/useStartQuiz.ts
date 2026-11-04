import { usePortion } from '../content/PortionContext';
import { navigate } from '../router';
import type { Level, Track } from './logic';
import { useStore } from './store';

/** Starts a quiz, or resumes the one in progress for the same track and level. */
export function useStartQuiz() {
  const { state, dispatch } = useStore();
  const { portion } = usePortion();
  return (track: Track, level?: Level) => {
    const q = state.quiz;
    const resumable = q && q.track === track && q.level === level && q.index < q.questionIds.length;
    if (!resumable) {
      const questionIds = portion.questions
        .filter((x) => x.track === track && (track === 'together' || x.level === level))
        .map((x) => x.id);
      const seed = Math.floor(Math.random() * 2 ** 31);
      dispatch({ type: 'startQuiz', track, level, questionIds, seed });
    }
    navigate(track === 'solo' ? '/quiz' : '/together/quiz');
  };
}
