import { describe, expect, it } from 'vitest';
import { mulberry32, newSeed, seededShuffle } from './shuffle';

describe('mulberry32', () => {
  it('is deterministic and stays in [0, 1)', () => {
    const a = mulberry32(5);
    const b = mulberry32(5);
    const values = Array.from({ length: 50 }, () => a());
    expect(values).toEqual(Array.from({ length: 50 }, () => b()));
    expect(values.every((v) => v >= 0 && v < 1)).toBe(true);
  });
});

describe('seededShuffle', () => {
  const items = ['a', 'b', 'c', 'd'];

  it('is stable for the same seed and key', () => {
    expect(seededShuffle(items, 42, 'q1')).toEqual(seededShuffle(items, 42, 'q1'));
  });

  it('keeps every item and leaves the input alone', () => {
    const input = [...items];
    expect([...seededShuffle(input, 7, 'q2')].sort()).toEqual(items);
    expect(input).toEqual(items);
  });

  it('varies across seeds', () => {
    const orders = new Set(
      Array.from({ length: 20 }, (_, s) => seededShuffle(items, s, 'q').join('')),
    );
    expect(orders.size).toBeGreaterThan(1);
  });
});

describe('newSeed', () => {
  it('scales the random source to a 31-bit integer', () => {
    expect(newSeed(() => 0)).toBe(0);
    expect(newSeed(() => 0.5)).toBe(2 ** 30);
    expect(Number.isInteger(newSeed())).toBe(true);
  });
});
