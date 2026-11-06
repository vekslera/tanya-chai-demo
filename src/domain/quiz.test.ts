import { describe, expect, it } from 'vitest';
import { questions } from '../test/fixtures';
import {
  answerState,
  canAnswer,
  FALSE,
  maxAttemptsFor,
  optionsOf,
  phaseOf,
  questionIdsFor,
  TRUE,
} from './quiz';
import type { Question } from './types';

const byId = (id: string) => questions.find((q) => q.id === id)!;
const rules = { solo: { maxAttempts: 2 }, together: { retryUntilCorrect: true } };

describe('optionsOf', () => {
  it('gives true and false, in that order, for a true/false question', () => {
    expect(optionsOf(byId('q-tf'), 3)).toEqual([{ id: TRUE }, { id: FALSE }]);
  });

  it('keeps a fixed order, and shuffles the others by seed', () => {
    expect(optionsOf(byId('q-choice'), 3).map((o) => o.id)).toEqual(['a', 'b', 'c']);
    const loose: Question = { ...byId('q-choice'), fixedOrder: false };
    const orders = new Set(
      Array.from({ length: 10 }, (_, s) =>
        optionsOf(loose, s)
          .map((o) => o.id)
          .join(''),
      ),
    );
    expect(orders.size).toBeGreaterThan(1);
  });

  it('has no options for a question without them', () => {
    expect(optionsOf(byId('q-find'), 1)).toEqual([]);
  });
});

describe('questionIdsFor', () => {
  it('selects by track, and by level on the solo track', () => {
    expect(questionIdsFor(questions, 'solo', 1)).toEqual(['q-choice', 'q-find', 'q-tf']);
    expect(questionIdsFor(questions, 'solo', 2)).toEqual(['q-l2']);
    expect(questionIdsFor(questions, 'together')).toEqual(['q-child', 'q-child-tf']);
  });
});

describe('maxAttemptsFor', () => {
  it('uses the solo limit, or every option on the together track', () => {
    expect(maxAttemptsFor(byId('q-choice'), rules)).toBe(2);
    expect(maxAttemptsFor(byId('q-child'), rules)).toBe(2);
    expect(maxAttemptsFor(byId('q-child-tf'), rules)).toBe(2);
  });

  it('uses a fixed together limit when retrying is off', () => {
    const strict = { ...rules, together: { retryUntilCorrect: false, maxAttempts: 1 } };
    expect(maxAttemptsFor(byId('q-child'), strict)).toBe(1);
    const unset = { ...rules, together: { retryUntilCorrect: false } };
    expect(maxAttemptsFor(byId('q-child'), unset)).toBe(1);
  });
});

describe('phaseOf', () => {
  it('follows the answers', () => {
    expect(phaseOf([], false, 2)).toBe('answering');
    expect(phaseOf(['b'], false, 2)).toBe('retry');
    expect(phaseOf(['b', 'c'], false, 2)).toBe('revealed');
    expect(phaseOf(['a'], true, 2)).toBe('correct');
  });

  it('takes answers only while answering or retrying', () => {
    expect(['answering', 'retry', 'correct', 'revealed'].map((p) => canAnswer(p as never))).toEqual(
      [true, true, false, false],
    );
  });
});

describe('answerState', () => {
  const q = byId('q-choice');
  it('marks wrong choices, and the answer once done', () => {
    expect(answerState('b', q, ['b'], false)).toBe('wrong');
    expect(answerState('a', q, ['b'], false)).toBeUndefined();
    expect(answerState('a', q, ['b'], true)).toBe('correct');
    expect(answerState('c', q, ['b'], true)).toBeUndefined();
  });
});
