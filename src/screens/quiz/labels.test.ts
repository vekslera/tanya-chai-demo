import { describe, expect, it } from 'vitest';
import { questions } from '../../test/fixtures';
import { he } from '../../strings/he';
import { answerLabel, optionLabel } from './labels';

const byId = (id: string) => questions.find((q) => q.id === id)!;

describe('labels', () => {
  it('labels true/false options, and keeps an option’s own text', () => {
    expect(optionLabel({ id: 'true' })).toBe(he.quiz.true);
    expect(optionLabel({ id: 'false' })).toBe(he.quiz.false);
    expect(optionLabel({ id: 'a', text: 'x' })).toBe('x');
  });

  it('names the correct answer of each kind', () => {
    expect(answerLabel(byId('q-tf'))).toBe(he.quiz.false);
    expect(answerLabel(byId('q-choice'))).toBe('תשובה נכונה');
    expect(answerLabel(byId('q-find'))).toBeUndefined();
    expect(answerLabel({ ...byId('q-choice'), options: undefined })).toBeUndefined();
  });
});
