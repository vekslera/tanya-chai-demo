import { describe, expect, it } from 'vitest';
import { questions } from '../../test/fixtures';
import { en } from '../../strings/en';
import { he } from '../../strings/he';
import { quizStrings } from '../../strings/quiz';
import { answerLabel, optionLabel } from './labels';

const byId = (id: string) => questions.find((q) => q.id === id)!;
const t = he.quiz;

describe('labels', () => {
  it('labels true/false options, and keeps an option’s own text', () => {
    expect(optionLabel({ id: 'true' }, t)).toBe(he.quiz.true);
    expect(optionLabel({ id: 'false' }, en.quiz)).toBe(en.quiz.false);
    expect(optionLabel({ id: 'a', text: 'x' }, t)).toBe('x');
  });

  it('names the correct answer of each kind', () => {
    expect(answerLabel(byId('q-tf'), t)).toBe(he.quiz.false);
    expect(answerLabel(byId('q-choice'), t)).toBe('תשובה נכונה');
    expect(answerLabel(byId('q-find'), t)).toBeUndefined();
    expect(answerLabel({ ...byId('q-choice'), options: undefined }, t)).toBeUndefined();
  });
});

describe('quizStrings', () => {
  it('gives the strings of a language, or the app’s for a language without its own', () => {
    expect(quizStrings('en')).toBe(en.quiz);
    expect(quizStrings('he')).toBe(he.quiz);
    expect(quizStrings('fr')).toBe(he.quiz);
  });
});
