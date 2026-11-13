import { describe, expect, it } from 'vitest';
import { complete, type Progress } from './progress';
import type { ScoringRules } from './scoring';

const rules: ScoringRules = {
  pointsByAttempt: [10, 5],
  levelFactor: { 2: 2 },
  completionBonus: 20,
  heartStep: 3,
  heartMax: 100,
};

const seed: Progress = {
  streak: 12,
  points: 340,
  heartProgress: 62,
  completedSolo: false,
  completedTogether: false,
  familyStreak: 5,
};

describe('complete', () => {
  it('awards points, bonus, heart and streak on the first completion', () => {
    const { progress, completion } = complete(seed, 'solo', 25, rules);
    expect(progress).toMatchObject({
      streak: 13,
      points: 385,
      heartProgress: 65,
      completedSolo: true,
      completedTogether: false,
    });
    expect(completion).toMatchObject({ awarded: true, earned: 25, bonus: 20, before: seed });
  });

  it('increments the streak once per session, not per track', () => {
    const first = complete(seed, 'solo', 30, rules).progress;
    const second = complete(first, 'together', 30, rules).progress;
    expect(second).toMatchObject({ streak: 13, heartProgress: 68, completedSolo: true });
  });

  it('never awards the lesson twice', () => {
    const first = complete(seed, 'solo', 30, rules).progress;
    const again = complete(first, 'solo', 30, rules);
    expect(again.progress).toBe(first);
    expect(again.completion).toMatchObject({ awarded: false, bonus: 0 });
  });

  it('never awards Avos uBanim twice', () => {
    const first = complete(seed, 'together', 30, rules).progress;
    expect(complete(first, 'together', 30, rules).completion.awarded).toBe(false);
  });

  it('Avos uBanim increments the family streak', () => {
    const { progress } = complete(seed, 'together', 30, rules);
    expect(progress).toMatchObject({ familyStreak: 6, completedTogether: true, streak: 13 });
  });

  it('caps the heart at the configured maximum', () => {
    const near = { ...seed, heartProgress: 99 };
    expect(complete(near, 'solo', 0, rules).progress.heartProgress).toBe(100);
    expect(complete(near, 'solo', 0, { ...rules, heartMax: 99 }).progress.heartProgress).toBe(99);
  });

  it('takes the bonus and the heart step from the rules', () => {
    const custom = { ...rules, completionBonus: 7, heartStep: 10 };
    expect(complete(seed, 'solo', 0, custom).progress).toMatchObject({
      points: 347,
      heartProgress: 72,
    });
  });
});
