import { TRUE, type Option } from '../../domain/quiz';
import type { Question } from '../../domain/types';
import type { QuizStrings } from '../../strings/quiz';

/** The text of an option: its own, or true / false for a true/false question. */
export const optionLabel = (o: Option, t: QuizStrings) =>
  o.text ?? (o.id === TRUE ? t.true : t.false);

/** The text of a question's correct answer; a findSentence answer is shown in the text itself. */
export function answerLabel(q: Question, t: QuizStrings): string | undefined {
  if (q.kind === 'trueFalse') return optionLabel({ id: q.answer }, t);
  if (q.kind === 'choice') return q.options?.find((o) => o.id === q.answer)?.text;
  return undefined;
}
