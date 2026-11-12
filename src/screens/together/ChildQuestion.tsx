import { CheckIcon } from '../../components/Icons';
import { QuoteCard } from '../../components/PortionText';
import { ProgressDots } from '../../components/ProgressDots';
import { LanguageToggle } from '../../components/LanguageToggle';
import { TopBar } from '../../components/TopBar';
import { config } from '../../config';
import { usePortion } from '../../content/PortionProvider';
import { optionsOf } from '../../domain/quiz';
import { pointsFor } from '../../domain/scoring';
import { cardOfUnit } from '../../domain/together';
import { ROUTES } from '../../routes';
import { he } from '../../strings/he';
import { optionLabel } from '../quiz/labels';
import type { QuizSessionView } from '../quiz/useQuizSession';
import { CardSection } from './CardSection';
import './Together.css';
import './TogetherQuiz.css';

/**
 * The son's question after a card (S9): large buttons, no red, try again as often as needed. Back
 * to the card, or on to the next one.
 */
export function ChildQuestion({
  session,
  onBack,
  onNext,
}: {
  session: QuizSessionView;
  onBack: () => void;
  onNext: () => void;
}) {
  const portion = usePortion();
  const { quiz, question: q, chosen, phase, unit, sentence } = session;
  const solved = phase === 'correct';
  const card = cardOfUnit(portion.portion.together, portion.sections, unit.id);

  return (
    <main className="screen together child-quiz">
      <TopBar
        back={ROUTES.home}
        title={<ProgressDots count={quiz.questionIds.length} current={quiz.index} />}
        end={<LanguageToggle comingSoon />}
      />
      <p className="child-quiz-count">
        {q.summary ? he.togetherQuiz.summary : he.together.childTurn}
      </p>
      <h1 className="child-prompt">{q.prompt.value}</h1>

      <div className="child-options" role="group" aria-label={q.prompt.value}>
        {optionsOf(q, quiz.seed).map((o) => {
          const isCorrect = solved && o.id === q.answer;
          const tried = chosen.includes(o.id) && o.id !== q.answer;
          return (
            <button
              key={o.id}
              type="button"
              className={`child-option${isCorrect ? ' child-option--correct' : ''}${tried ? ' child-option--tried' : ''}`}
              onClick={() => session.answer(o.id)}
              disabled={solved || tried}
            >
              <span>{optionLabel(o)}</span>
              {isCorrect && <CheckIcon />}
            </button>
          );
        })}
      </div>

      <div className="child-feedback" aria-live="polite">
        {solved && (
          <div className="child-correct">
            <p className="child-correct-line">
              {he.togetherQuiz.correct[quiz.index % he.togetherQuiz.correct.length]}
            </p>
            <bdi className="child-points" dir="ltr">
              {he.togetherQuiz.points(pointsFor(chosen.length, config.scoring))}
            </bdi>
          </div>
        )}
        {phase === 'retry' && (
          <>
            <p className="child-try-again">{he.togetherQuiz.tryAgain}</p>
            <QuoteCard sentence={sentence} label={he.togetherQuiz.fromText} />
            {card && (
              <CardSection label={he.togetherQuiz.fatherSaid} className="together-child">
                <p>{card.toChild.value}</p>
              </CardSection>
            )}
          </>
        )}
      </div>

      {solved && (
        <div className="together-nav together-nav--single">
          <button type="button" className="btn btn-primary btn-big btn-block" onClick={onNext}>
            {session.isLast ? he.togetherQuiz.finish : he.togetherQuiz.next}
          </button>
        </div>
      )}
      {!solved && (
        <button type="button" className="link-btn" onClick={onBack}>
          {he.together.backToCard}
        </button>
      )}
    </main>
  );
}
