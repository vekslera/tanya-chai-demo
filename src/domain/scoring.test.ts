import { describe, expect, it } from 'vitest';
import { pointsFor } from './scoring';

describe('pointsFor', () => {
  it('follows the configured points by attempt, then 0', () => {
    const rules = { pointsByAttempt: [10, 5] };
    expect([1, 2, 3].map((a) => pointsFor(a, rules))).toEqual([10, 5, 0]);
  });

  it('works with any number of rewarded attempts', () => {
    expect(pointsFor(3, { pointsByAttempt: [3, 2, 1] })).toBe(1);
    expect(pointsFor(1, { pointsByAttempt: [] })).toBe(0);
  });
});
