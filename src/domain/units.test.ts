import { describe, expect, it } from 'vitest';
import { units } from '../test/fixtures';
import { chapterKey, chapterOf, chaptersOf, unitsIn, UNIT_ID } from './units';

describe('unit IDs', () => {
  it('accepts IDs with an optional split letter', () => {
    expect(UNIT_ID.test('LA.32.007a')).toBe(true);
    expect(UNIT_ID.test('LA.32.7')).toBe(false);
  });

  it('reads the chapter of a unit', () => {
    expect(chapterOf('LA.32.007a')).toEqual({ part: 'LA', chapter: 32 });
    expect(() => chapterOf('bad')).toThrow('Malformed unit ID: bad');
  });

  it('keys a chapter', () => {
    expect(chapterKey({ part: 'LA', chapter: 32 })).toBe('LA.32');
  });

  it('lists the distinct chapters of ranges, in order', () => {
    const ranges = [
      { from: 'LA.32.001', to: 'LA.33.002' },
      { from: 'LA.33.003', to: 'LA.33.009' },
    ];
    expect(chaptersOf(ranges)).toEqual([
      { part: 'LA', chapter: 32 },
      { part: 'LA', chapter: 33 },
    ]);
  });
});

describe('ranges', () => {
  it('returns the units of a range, inclusive', () => {
    expect(unitsIn(units, { from: 'LA.1.002', to: 'LA.1.003' }).map((u) => u.id)).toEqual([
      'LA.1.002',
      'LA.1.003',
    ]);
  });

  it('throws on an unknown unit', () => {
    expect(() => unitsIn(units, { from: 'LA.1.001', to: 'LA.9.001' })).toThrow('Unknown range');
  });
});
