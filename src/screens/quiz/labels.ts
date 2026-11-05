import { TRUE, type Option } from '../../domain/quiz';
import type { Question } from '../../domain/types';
import { he } from '../../strings/he';

/** The text of an option: its own, or נכון / לא נכון for a true/false question. */
export const optionLabel = (o: Option) => o.text ?? (o.id === TRUE ? he.quiz.true : he.quiz.false);

/** The text of a question's correct answer; a findSentence answer is shown in the text itself. */
export function answerLabel(q: Question): string | undefined {
  if (q.kind === 'trueFalse') return optionLabel({ id: q.answer });
  if (q.kind === 'choice') return q.options?.find((o) => o.id === q.answer)?.text;
  return undefined;
}
