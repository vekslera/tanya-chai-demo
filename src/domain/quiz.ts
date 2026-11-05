// Questions and answers (SPEC §3.1, S4 and S9). Pure: the view supplies the labels.
import { seededShuffle } from './shuffle.ts';
import type { Level, Question, Track } from './types.ts';

export type QuizRules = {
  solo: { maxAttempts: number };
  /** The son may try every option until he finds the answer. */
  together: { retryUntilCorrect: boolean; maxAttempts?: number };
};

/** Where a question stands: not yet answered, answered wrongly with attempts left, or done. */
export type Phase = 'answering' | 'retry' | 'correct' | 'revealed';
export type AnswerState = 'correct' | 'wrong' | undefined;

export const TRUE = 'true';
export const FALSE = 'false';

/** An answer option. True/false options carry no text: the view labels them. */
export type Option = { id: string; text?: string };

/** The options as shown: true/false fixed; choice options shuffled per session unless fixed. */
export function optionsOf(q: Question, seed: number): Option[] {
  if (q.kind === 'trueFalse') return [{ id: TRUE }, { id: FALSE }];
  const options = q.options ?? [];
  return q.fixedOrder ? options : seededShuffle(options, seed, q.id);
}

/** The questions of a track, and of a level on the solo track, in their order. */
export function questionIdsFor(questions: readonly Question[], track: Track, level?: Level) {
  return questions
    .filter((q) => q.track === track && (track === 'together' || q.level === level))
    .map((q) => q.id);
}

/** How many answers a question accepts before the correct one is revealed. */
export function maxAttemptsFor(q: Question, rules: QuizRules): number {
  if (q.track === 'solo') return rules.solo.maxAttempts;
  return rules.together.retryUntilCorrect
    ? optionsOf(q, 0).length
    : (rules.together.maxAttempts ?? 1);
}

export function phaseOf(chosen: readonly string[], solved: boolean, maxAttempts: number): Phase {
  if (solved) return 'correct';
  if (chosen.length >= maxAttempts) return 'revealed';
  return chosen.length > 0 ? 'retry' : 'answering';
}

export const canAnswer = (phase: Phase) => phase === 'answering' || phase === 'retry';

/** How an option is marked: the answer once the question is done, and every wrong choice. */
export function answerState(
  id: string,
  q: Question,
  chosen: readonly string[],
  done: boolean,
): AnswerState {
  if (id === q.answer && done) return 'correct';
  if (chosen.includes(id)) return 'wrong';
  return undefined;
}
