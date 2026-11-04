import { describe, expect, it } from 'vitest';
import { complete, pointsFor, seededShuffle, type Progress } from './logic';
import { initialState, reducer } from './state';

const seed: Progress = {
  streak: 12,
  points: 340,
  heartProgress: 62,
  completedLevels: [],
  completedTogether: false,
  familyStreak: 5,
};

describe('pointsFor', () => {
  it('gives 10, then 5, then 0', () => {
    expect([1, 2, 3].map(pointsFor)).toEqual([10, 5, 0]);
  });
});

describe('complete', () => {
  it('awards points, bonus, heart and streak on the first completion', () => {
    const { progress, completion } = complete(seed, 'solo', 2, 25);
    expect(progress).toMatchObject({
      streak: 13,
      points: 385,
      heartProgress: 65,
      completedLevels: [2],
    });
    expect(completion).toMatchObject({ awarded: true, earned: 25, bonus: 20 });
  });

  it('increments the streak once per session, not per level', () => {
    const first = complete(seed, 'solo', 2, 30).progress;
    const second = complete(first, 'solo', 1, 30).progress;
    expect(second.streak).toBe(13);
    expect(second.heartProgress).toBe(68);
  });

  it('never awards the same level twice', () => {
    const first = complete(seed, 'solo', 1, 30).progress;
    const again = complete(first, 'solo', 1, 30);
    expect(again.progress).toBe(first);
    expect(again.completion.awarded).toBe(false);
  });

  it('Avos uBanim increments the family streak', () => {
    const { progress } = complete(seed, 'together', undefined, 30);
    expect(progress).toMatchObject({ familyStreak: 6, completedTogether: true, streak: 13 });
  });

  it('caps the heart at 100', () => {
    expect(complete({ ...seed, heartProgress: 99 }, 'solo', 1, 0).progress.heartProgress).toBe(100);
  });
});

describe('seededShuffle', () => {
  const items = ['a', 'b', 'c', 'd'];
  it('is stable for the same seed and key', () => {
    expect(seededShuffle(items, 42, 'q1')).toEqual(seededShuffle(items, 42, 'q1'));
  });
  it('keeps every item', () => {
    expect([...seededShuffle(items, 7, 'q2')].sort()).toEqual(items);
  });
  it('varies across seeds', () => {
    const orders = new Set(
      Array.from({ length: 20 }, (_, s) => seededShuffle(items, s, 'q').join('')),
    );
    expect(orders.size).toBeGreaterThan(1);
  });
});

describe('reducer', () => {
  it('scores attempts and stops after the allowed number', () => {
    let s = reducer(initialState, {
      type: 'startQuiz',
      track: 'solo',
      level: 1,
      questionIds: ['q'],
      seed: 1,
    });
    s = reducer(s, {
      type: 'answer',
      questionId: 'q',
      choice: 'b',
      correct: false,
      maxAttempts: 2,
    });
    s = reducer(s, { type: 'answer', questionId: 'q', choice: 'a', correct: true, maxAttempts: 2 });
    s = reducer(s, { type: 'answer', questionId: 'q', choice: 'a', correct: true, maxAttempts: 2 });
    expect(s.quiz).toMatchObject({ earned: 5, chosen: { q: ['b', 'a'] }, attempts: { q: 2 } });
  });
});
