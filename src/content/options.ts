import { seededShuffle } from '../store/logic';
import { he } from '../strings/he';
import type { Question } from './types';

/** The answer options as shown: true/false fixed, choice options shuffled per session by seed. */
export function optionsOf(q: Question, seed: number) {
  if (q.kind === 'trueFalse') {
    return [
      { id: 'true', text: he.quiz.true },
      { id: 'false', text: he.quiz.false },
    ];
  }
  const options = q.options ?? [];
  return q.fixedOrder ? options : seededShuffle(options, seed, q.id);
}
