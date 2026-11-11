import { usePortion } from '../../content/PortionProvider';
import { togetherStep } from '../../domain/together';
import { useStore } from '../../store/StoreProvider';
import { useStartQuiz } from '../../store/useStartQuiz';
import { ChildTurn } from './ChildTurn';
import { TogetherCardView } from './TogetherCardView';
import { TogetherIntro } from './TogetherIntro';
import './Together.css';

/** Avos uBanim (S8): the intro, one thought per card, then the son's turn. */
export function TogetherScreen() {
  const { state, dispatch } = useStore();
  const { portion } = usePortion();
  const startQuiz = useStartQuiz();
  const cards = portion.together;
  const go = (index: number) => {
    dispatch({ type: 'setTogetherIndex', index });
    window.scrollTo(0, 0);
  };

  const step = togetherStep(state.togetherIndex, cards.length);
  switch (step.kind) {
    case 'intro':
      return <TogetherIntro heartProgress={state.heartProgress} onStart={() => go(0)} />;
    case 'childTurn':
      return (
        <ChildTurn onQuestions={() => startQuiz('together')} onBack={() => go(cards.length - 1)} />
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
