import { CompactText } from '../../components/PortionText';
import { usePortion } from '../../content/PortionProvider';
import { paragraphKey } from '../../domain/portion';
import { answerState, canAnswer } from '../../domain/quiz';
import { he } from '../../strings/he';
import type { QuizSessionView } from './useQuizSession';

/** A findSentence question: the text itself is the answer surface, one button per sentence. */
export function FindSentence({
  session,
  onAnswer,
}: {
  session: QuizSessionView;
  onAnswer: (unitId: string) => void;
}) {
  const { paragraphs } = usePortion();
  const { question: q, chosen, phase, unit } = session;
  const open = canAnswer(phase);
  const marked = open ? chosen : [...chosen, q.answer];
  return (
    <>
      <p className="quiz-help">{he.quiz.findSentenceHelp}</p>
      <CompactText
        paragraphs={paragraphs}
        highlightParagraph={phase === 'retry' ? paragraphKey(unit) : undefined}
        states={Object.fromEntries(marked.map((id) => [id, answerState(id, q, chosen, !open)]))}
        onSelect={onAnswer}
      />
    </>
  );
}
