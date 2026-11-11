import { CompactText } from '../../components/PortionText';
import { usePortion } from '../../content/PortionProvider';
import { paragraphKey } from '../../domain/portion';
import { config } from '../../config';
import { answerState, canAnswer, sentenceChoices } from '../../domain/quiz';
import { he } from '../../strings/he';
import type { QuizSessionView } from './useQuizSession';

/** A findSentence question: a few consecutive sentences already read, one button per sentence. */
export function FindSentence({
  session,
  onAnswer,
}: {
  session: QuizSessionView;
  onAnswer: (unitId: string) => void;
}) {
  const { paragraphs, sections } = usePortion();
  const { question: q, chosen, phase, unit, quiz, section } = session;
  const choices = new Set(
    sentenceChoices(
      sections
        .slice(0, section + 1)
        .flatMap((s) => s.sentences)
        .map((s) => s.id),
      q,
      config.quiz.findSentence.choices,
      quiz.seed,
    ),
  );
  const shown = paragraphs
    .map((p) => ({ ...p, sentences: p.sentences.filter((s) => choices.has(s.id)) }))
    .filter((p) => p.sentences.length > 0);
  const open = canAnswer(phase);
  const marked = open ? chosen : [...chosen, q.answer];
  return (
    <>
      <p className="quiz-help">{he.quiz.findSentenceHelp}</p>
      <CompactText
        paragraphs={shown}
        highlightParagraph={phase === 'retry' ? paragraphKey(unit) : undefined}
        states={Object.fromEntries(marked.map((id) => [id, answerState(id, q, chosen, !open)]))}
        onSelect={onAnswer}
      />
    </>
  );
}
