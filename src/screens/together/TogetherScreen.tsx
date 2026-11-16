import { usePortion } from '../../content/PortionProvider';
import { togetherStep } from '../../domain/together';
import { ROUTES } from '../../routes';
import { useStore } from '../../store/StoreProvider';
import { useStartQuiz } from '../../store/useStartQuiz';
import { useQuizSession } from '../quiz/useQuizSession';
import { ChildQuestion } from './ChildQuestion';
import { TogetherCardView } from './TogetherCardView';
import { TogetherIntro } from './TogetherIntro';
import './Together.css';

/** Avos uBanim (S8, S9): the intro, then one card per thought, each followed by the son's question. */
export function TogetherScreen() {
  const { state, dispatch } = useStore();
  const { portion } = usePortion();
  const startQuiz = useStartQuiz();
  const session = useQuizSession('together', ROUTES.together);
  const cards = portion.together;
  const go = (index: number) => {
    dispatch({ type: 'setTogetherIndex', index });
    window.scrollTo(0, 0);
  };

  const step = togetherStep(state.togetherIndex, cards.length, session?.section);
  switch (step.kind) {
    case 'intro':
      return (
        <TogetherIntro
          heartProgress={state.heartProgress}
          onStart={() => {
            startQuiz('together');
            go(0);
          }}
        />
      );
    case 'question':
      return (
        <ChildQuestion
          session={session!}
          onBack={() => go(session!.section)}
          onNext={() => {
            session!.next();
            window.scrollTo(0, 0);
          }}
        />
      );
    case 'card':
      return (
        <TogetherCardView
          card={cards[step.index]!}
          index={step.index}
          count={cards.length}
          onGo={go}
        />
      );
  }
}
