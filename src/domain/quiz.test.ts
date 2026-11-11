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
  sentenceChoices,
  TRUE,
} from './quiz';
import type { Question } from './types';

const byId = (id: string) => questions.find((q) => q.id === id)!;
const rules = {
  solo: { maxAttempts: 2 },
  findSentence: { choices: 3 },
  together: { retryUntilCorrect: true },
};

describe('sentenceChoices', () => {
  const ids = ['u1', 'u2', 'u3', 'u4', 'u5', 'u6'];
  const at = (answer: string) => ({ ...byId('q-find'), answer });
  const windows = (answer: string, count = 3, units = ids) =>
    new Set(
      Array.from({ length: 40 }, (_, s) => sentenceChoices(units, at(answer), count, s).join(' ')),
    );

  it('offers consecutive sentences around the answer, placing it anywhere among them', () => {
    expect(windows('u4')).toEqual(new Set(['u2 u3 u4', 'u3 u4 u5', 'u4 u5 u6']));
    expect(sentenceChoices(ids, at('u4'), 3, 7)).toEqual(sentenceChoices(ids, at('u4'), 3, 7));
  });

  it('stays within the portion at its edges, and offers all of a short one', () => {
    expect(windows('u1')).toEqual(new Set(['u1 u2 u3']));
    expect(windows('u6')).toEqual(new Set(['u4 u5 u6']));
    expect(windows('u2', 3, ['u1', 'u2'])).toEqual(new Set(['u1 u2']));
  });
});

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
  // The fixture's two sections: LA.1.001–002 and LA.1.003–004; the summary follows the last.
  const sectionOf = (q: Question) => (q.summary || q.unitRef > 'LA.1.002' ? 1 : 0);

  it('selects by track, and by level on the solo track, in the order they are asked', () => {
    const reversed = [...questions].reverse();
    expect(questionIdsFor(reversed, sectionOf, 'solo', 1)).toEqual(['q-choice', 'q-find', 'q-tf']);
    expect(questionIdsFor(reversed, sectionOf, 'solo', 2)).toEqual(['q-l2']);
    expect(questionIdsFor(questions, sectionOf, 'together')).toEqual(['q-child-tf', 'q-child']);
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
