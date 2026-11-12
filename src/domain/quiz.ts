// Questions and answers (SPEC §3.1, S4 and S9). Pure: the view supplies the labels.
import { seededShuffle } from './shuffle.ts';
import type { Level, Question, Track } from './types.ts';

export type QuizRules = {
  solo: { maxAttempts: number };
  /** How many sentences a findSentence question offers. */
  findSentence: { choices: number };
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
/** A question in a language: its translation's texts when it has them, else as written. */
export function questionIn(q: Question, language?: string): Question {
  const t = language ? q.translations?.[language] : undefined;
  return t
    ? { ...q, prompt: t.prompt, hint: t.hint, explanation: t.explanation, options: t.options }
    : q;
}

export function optionsOf(q: Question, seed: number): Option[] {
  if (q.kind === 'trueFalse') return [{ id: TRUE }, { id: FALSE }];
  const options = q.options ?? [];
  return q.fixedOrder ? options : seededShuffle(options, seed, q.id);
}

/**
 * The sentences a findSentence question offers: `count` consecutive units of the portion that
 * include the answer, in text order. Where the answer falls among them is chosen per session.
 */
export function sentenceChoices(
  unitIds: readonly string[],
  q: Question,
  count: number,
  seed: number,
): string[] {
  const at = unitIds.indexOf(q.answer);
  const size = Math.min(count, unitIds.length);
  const first = Math.max(0, at - size + 1);
  const last = Math.min(at, unitIds.length - size);
  const starts = Array.from({ length: last - first + 1 }, (_, i) => first + i);
  const start = seededShuffle(starts, seed, q.id)[0]!;
  return unitIds.slice(start, start + size);
}

/**
 * The questions of a track, and of a level on the solo track, in the order they are asked: after
 * their section (`sectionOf`), the summary question last.
 */
export function questionIdsFor(
  questions: readonly Question[],
  sectionOf: (q: Question) => number,
  track: Track,
  level?: Level,
) {
  const rank = (q: Question) => [sectionOf(q), q.summary ? 1 : 0] as const;
  return questions
    .filter((q) => q.track === track && (track === 'together' || q.level === level))
    .map((q) => ({ q, r: rank(q) }))
    .sort((a, b) => a.r[0] - b.r[0] || a.r[1] - b.r[1])
    .map(({ q }) => q.id);
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
