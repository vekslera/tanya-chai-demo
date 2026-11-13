import { describe, expect, it } from 'vitest';
import { factorFor, pointsFor } from './scoring';

const levelFactor = { 1: 1, 2: 2 };

describe('pointsFor', () => {
  it('follows the configured points by attempt, then 0', () => {
    const rules = { pointsByAttempt: [10, 5], levelFactor };
    expect([1, 2, 3].map((a) => pointsFor(a, rules))).toEqual([10, 5, 0]);
  });

  it('works with any number of rewarded attempts', () => {
    expect(pointsFor(3, { pointsByAttempt: [3, 2, 1], levelFactor })).toBe(1);
    expect(pointsFor(1, { pointsByAttempt: [], levelFactor })).toBe(0);
  });

  it('multiplies by the level factor', () => {
    const rules = { pointsByAttempt: [10, 5], levelFactor };
    expect([1, 2, 3].map((a) => pointsFor(a, rules, 2))).toEqual([20, 10, 0]);
    expect(pointsFor(1, rules, 1)).toBe(10);
  });
});

describe('factorFor', () => {
  it('is 1 without a level, or for a level not listed', () => {
    expect(factorFor(undefined, { levelFactor })).toBe(1);
    expect(factorFor(2, { levelFactor })).toBe(2);
    expect(factorFor(3, { levelFactor })).toBe(1);
  });
});
