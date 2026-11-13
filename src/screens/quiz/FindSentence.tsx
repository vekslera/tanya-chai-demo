import { CompactText } from '../../components/PortionText';
import { usePortion } from '../../content/PortionProvider';
import { config } from '../../config';
import { answerState, canAnswer, sentenceChoices } from '../../domain/quiz';
import type { QuizStrings } from '../../strings/quiz';
import type { QuizSessionView } from './useQuizSession';

/**
 * A findSentence question: a few consecutive sentences already read, one button per sentence; with
 * a `language`, in their translation.
 */
export function FindSentence({
  session,
  onAnswer,
  t,
  language,
}: {
  session: QuizSessionView;
  onAnswer: (unitId: string) => void;
  t: QuizStrings;
  language?: string;
}) {
  const { sections } = usePortion();
  const { question: q, chosen, phase, quiz, section } = session;
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
  // The sentences offered, by the section they are in.
  const shown = sections
    .map((s) => ({ key: s.id, sentences: s.sentences.filter((x) => choices.has(x.id)) }))
    .filter((b) => b.sentences.length > 0);
  const open = canAnswer(phase);
  const marked = open ? chosen : [...chosen, q.answer];
  return (
    <>
      <p className="quiz-help">{t.findSentenceHelp}</p>
      <CompactText
        blocks={shown}
        highlightBlock={phase === 'retry' ? sections[section]!.id : undefined}
        states={Object.fromEntries(marked.map((id) => [id, answerState(id, q, chosen, !open)]))}
        onSelect={onAnswer}
        language={language}
      />
    </>
  );
}
