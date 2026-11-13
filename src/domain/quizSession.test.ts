import { describe, expect, it } from 'vitest';
import {
  answer,
  currentQuestionId,
  isLastQuestion,
  isResumable,
  nextQuestion,
  showBiur,
  startSession,
  withQuestions,
} from './quizSession';

const rules = {
  pointsByAttempt: [10, 5],
  levelFactor: { 2: 2 },
  completionBonus: 20,
  heartStep: 3,
  heartMax: 100,
};
const start = () => startSession('solo', ['q1', 'q2'], 9);

describe('quiz session', () => {
  it('starts at the first question with nothing answered', () => {
    const s = start();
    expect(s).toMatchObject({ index: 0, earned: 0, seed: 9, chosen: {}, solved: {} });
    expect(currentQuestionId(s)).toBe('q1');
    expect(isLastQuestion(s)).toBe(false);
  });

  it('scores by attempt and stops after the allowed number', () => {
    let s = start();
    s = answer(s, { questionId: 'q1', choice: 'b', correct: false, maxAttempts: 2 }, rules);
    s = answer(s, { questionId: 'q1', choice: 'a', correct: true, maxAttempts: 2 }, rules);
    expect(s).toMatchObject({ earned: 5, chosen: { q1: ['b', 'a'] }, attempts: { q1: 2 } });
    const after = answer(
      s,
      { questionId: 'q1', choice: 'c', correct: true, maxAttempts: 9 },
      rules,
    );
    expect(after).toBe(s);
  });

  it('takes no answer once all attempts are used', () => {
    let s = start();
    s = answer(s, { questionId: 'q1', choice: 'b', correct: false, maxAttempts: 1 }, rules);
    expect(answer(s, { questionId: 'q1', choice: 'a', correct: true, maxAttempts: 1 }, rules)).toBe(
      s,
    );
  });

  it('moves to the next question', () => {
    const s = nextQuestion(start());
    expect(currentQuestionId(s)).toBe('q2');
    expect(isLastQuestion(s)).toBe(true);
  });

  it('doubles the points of a level-2 question', () => {
    const s = answer(
      start(),
      { questionId: 'q1', choice: 'a', correct: true, maxAttempts: 2, level: 2 },
      rules,
    );
    expect(s.earned).toBe(20);
  });

  it('shows or hides the ביאור of a section, and takes other questions to come', () => {
    const s = showBiur(showBiur(start(), 's1', true), 's2', false);
    expect(s.biur).toEqual({ s1: true, s2: false });
    expect(withQuestions(s, ['q1', 'q3']).questionIds).toEqual(['q1', 'q3']);
  });

  it('is resumable only for the same track, with questions left', () => {
    const s = start();
    expect(isResumable(s, 'solo')).toBe(true);
    expect(isResumable(s, 'together')).toBe(false);
    expect(isResumable(null, 'solo')).toBe(false);
    expect(isResumable(nextQuestion(nextQuestion(s)), 'solo')).toBe(false);
  });
});
