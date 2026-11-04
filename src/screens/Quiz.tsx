import { useEffect, useState } from 'react';
import { BottomSheet } from '../components/BottomSheet';
import { CheckIcon, CloseIcon } from '../components/Icons';
import { CompactText, QuoteCard, type SentenceState } from '../components/PortionText';
import { ProgressDots } from '../components/ProgressDots';
import { TopBar } from '../components/TopBar';
import { usePortion } from '../content/PortionContext';
import type { Question } from '../content/types';
import { navigate, redirectFrom } from '../router';
import { pointsFor, seededShuffle } from '../store/logic';
import type { QuizState } from '../store/state';
import { useStore } from '../store/store';
import { he } from '../strings/he';
import './Quiz.css';

const MAX_ATTEMPTS = 2;

type Phase = 'answering' | 'retry' | 'correct' | 'revealed';

export function phaseOf(quiz: QuizState, q: Question, maxAttempts: number): Phase {
  const chosen = quiz.chosen[q.id] ?? [];
  if (quiz.solved[q.id]) return 'correct';
  if (chosen.length >= maxAttempts) return 'revealed';
  return chosen.length > 0 ? 'retry' : 'answering';
}

export function QuizScreen() {
  const { state, dispatch } = useStore();
  const portion = usePortion();
  const quiz = state.quiz?.track === 'solo' ? state.quiz : null;
  const [sheetOpen, setSheetOpen] = useState(false);
  const [shake, setShake] = useState<string | null>(null);

  useEffect(() => {
    if (!quiz) redirectFrom('/quiz', '/level');
  }, [quiz]);
  if (!quiz) return null;

  const q = portion.portion.questions.find((x) => x.id === quiz.questionIds[quiz.index]);
  if (!q) return null;
  const chosen = quiz.chosen[q.id] ?? [];
  const phase = phaseOf(quiz, q, MAX_ATTEMPTS);
  const canAnswer = phase === 'answering' || phase === 'retry';
  const done = !canAnswer;
  const isLast = quiz.index === quiz.questionIds.length - 1;
  const refUnit = portion.unit(q.unitRef)!;

  const answer = (choice: string) => {
    if (!canAnswer || chosen.includes(choice)) return;
    const correct = choice === q.answer;
    dispatch({ type: 'answer', questionId: q.id, choice, correct, maxAttempts: MAX_ATTEMPTS });
    setShake(correct ? null : choice);
  };

  const next = () => {
    setShake(null);
    if (isLast) {
      dispatch({ type: 'completeQuiz' });
      navigate('/done');
    } else {
      dispatch({ type: 'nextQuestion' });
      window.scrollTo(0, 0);
    }
  };

  const optionState = (id: string) => {
    if (id === q.answer && done) return 'correct';
    if (chosen.includes(id)) return 'wrong';
    return undefined;
  };

  // During a findSentence question the sheet must not point at the answer.
  const sheetHighlight = q.kind === 'findSentence' && canAnswer ? undefined : q.unitRef;

  return (
    <main className="screen quiz">
      <TopBar
        back="/read"
        backLabel={he.quiz.backToText}
        title={<ProgressDots count={quiz.questionIds.length} current={quiz.index} />}
      />

      <p className="quiz-count">{he.quiz.progress(quiz.index + 1, quiz.questionIds.length)}</p>
      <h1 className="quiz-prompt">{q.prompt.value}</h1>

      {q.kind === 'findSentence' ? (
        <>
          <p className="quiz-help">{he.quiz.findSentenceHelp}</p>
          <CompactText
            paragraphs={portion.paragraphs}
            highlightParagraph={phase === 'retry' ? refUnit.paragraph : undefined}
            states={Object.fromEntries(
              [...chosen, ...(done ? [q.answer] : [])].map((id) => [
                id,
                optionState(id) as SentenceState,
              ]),
            )}
            onSelect={canAnswer ? answer : () => {}}
          />
        </>
      ) : (
        <div className="options" role="group" aria-label={q.prompt.value}>
          {optionsOf(q, quiz.seed).map((o) => {
            const s = optionState(o.id);
            return (
              <button
                key={o.id}
                type="button"
                className={`option${s ? ` option--${s}` : ''}${shake === o.id ? ' option--shake' : ''}`}
                onClick={() => answer(o.id)}
                disabled={!canAnswer || chosen.includes(o.id)}
                aria-label={s === 'wrong' ? `${o.text} (${he.quiz.chosenWrong})` : undefined}
              >
                <span className="option-text">{o.text}</span>
                {s === 'correct' && <CheckIcon />}
                {s === 'wrong' && (
                  <span className="option-x">
                    <CloseIcon size={18} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      <div className="feedback" aria-live="polite">
        {phase === 'retry' && (
          <>
            <p className="feedback-line feedback-line--hint">{he.quiz.tryAgain}</p>
            <p className="feedback-hint">{q.hint.value}</p>
            {q.kind !== 'findSentence' && <QuoteCard unit={refUnit} label={he.quiz.fromText} />}
          </>
        )}
        {phase === 'correct' && (
          <>
            <p className="feedback-line feedback-line--praise">
              <span>{he.quiz.praise[quiz.index % he.quiz.praise.length]}</span>
              <bdi className="points-badge" dir="ltr">
                {he.quiz.points(pointsFor(chosen.length))}
              </bdi>
            </p>
            <p className="feedback-explanation">{q.explanation.value}</p>
            <QuoteCard unit={refUnit} label={he.quiz.fromText} />
          </>
        )}
        {phase === 'revealed' && (
          <>
            <p className="feedback-reveal">
              {he.quiz.revealed} <strong>{answerText(q)}</strong>
            </p>
            <p className="feedback-explanation">{q.explanation.value}</p>
            <QuoteCard unit={refUnit} label={he.quiz.fromText} />
          </>
        )}
      </div>

      <div className="quiz-footer">
        <button type="button" className="link-btn" onClick={() => setSheetOpen(true)}>
          {he.quiz.backToText}
        </button>
        {done && (
          <button type="button" className="btn btn-primary btn-block" onClick={next}>
            {isLast ? he.quiz.finish : he.quiz.next}
          </button>
        )}
      </div>

      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={he.quiz.textSheetTitle}
        tall
        onOpened={(body) => {
          if (!sheetHighlight) return;
          body
            .querySelector(`[data-unit="${sheetHighlight}"]`)
            ?.scrollIntoView({ block: 'center' });
        }}
      >
        <CompactText paragraphs={portion.paragraphs} highlight={sheetHighlight} />
      </BottomSheet>
    </main>
  );

  function answerText(question: Question) {
    if (question.kind === 'trueFalse')
      return question.answer === 'true' ? he.quiz.true : he.quiz.false;
    if (question.kind === 'choice')
      return question.options?.find((o) => o.id === question.answer)?.text;
    return null;
  }
}

function optionsOf(q: Question, seed: number) {
  if (q.kind === 'trueFalse') {
    return [
      { id: 'true', text: he.quiz.true },
      { id: 'false', text: he.quiz.false },
    ];
  }
  const options = q.options ?? [];
  return q.fixedOrder ? options : seededShuffle(options, seed, q.id);
}
