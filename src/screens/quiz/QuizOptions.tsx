import { CheckIcon, CloseIcon } from '../../components/Icons';
import { answerState, canAnswer, optionsOf } from '../../domain/quiz';
import type { QuizStrings } from '../../strings/quiz';
import { optionLabel } from './labels';
import type { QuizSessionView } from './useQuizSession';

/** The answer options of a choice or true/false question. */
export function QuizOptions({
  session,
  shake,
  onAnswer,
  t,
}: {
  session: QuizSessionView;
  t: QuizStrings;
  shake: string | null;
  onAnswer: (id: string) => void;
}) {
  const { question: q, quiz, chosen, phase } = session;
  const open = canAnswer(phase);
  return (
    <div className="options" role="group" aria-label={q.prompt.value}>
      {optionsOf(q, quiz.seed).map((o) => {
        const s = answerState(o.id, q, chosen, !open);
        const text = optionLabel(o, t);
        return (
          <button
            key={o.id}
            type="button"
            className={`option${s ? ` option--${s}` : ''}${shake === o.id ? ' option--shake' : ''}`}
            onClick={() => onAnswer(o.id)}
            disabled={!open || chosen.includes(o.id)}
            aria-label={s === 'wrong' ? `${text} (${t.chosenWrong})` : undefined}
          >
            <span className="option-text">{text}</span>
            {s === 'correct' && <CheckIcon />}
            {s === 'wrong' && (
              <span className="option-x">
                <CloseIcon />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
