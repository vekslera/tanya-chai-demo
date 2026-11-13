import { config } from '../../config';
import { usePortion } from '../../content/PortionProvider';
import { switchLevel } from '../../domain/quiz';
import { levelFor, showsBiur } from '../../domain/reading';
import { useStore } from '../../store/StoreProvider';
import type { QuizSessionView } from '../quiz/useQuizSession';

/**
 * The ביאור of each section shown so far, and its switch (S2), in the lesson's `session` (used
 * only while there is one). A section shows the ביאור of the level its question is asked at,
 * unless its switch was turned. The current section's switch also sets the level from now on:
 * its question follows, unless it was already tried.
 */
export function useSectionBiur(session: QuizSessionView | null) {
  const { dispatch } = useStore();
  const { portion, sections, questionSection } = usePortion();

  // The level of the question asked after a section.
  const levelOf = (s: QuizSessionView, i: number) =>
    s.quiz.questionIds
      .map((id) => portion.questions.find((q) => q.id === id)!)
      .find((q) => questionSection(q) === i)?.level;

  const shownIn = (s: QuizSessionView, i: number) =>
    s.quiz.biur?.[sections[i]!.id] ?? showsBiur(config.levels, levelOf(s, i));

  return {
    shown: (i: number) => shownIn(session!, i),
    toggle(i: number) {
      const s = session!;
      const on = !shownIn(s, i);
      dispatch({ type: 'showBiur', section: sections[i]!.id, shown: on });
      if (i !== s.section) return;
      // The question waiting after this section stays once it was tried.
      const asked = s.quiz.questionIds.slice(0, s.quiz.index + (s.chosen.length > 0 ? 1 : 0));
      const level = levelFor(config.levels, on);
      const questionIds = switchLevel(portion.questions, questionSection, asked, level);
      dispatch({ type: 'setLevel', level, questionIds });
    },
  };
}
