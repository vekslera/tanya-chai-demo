import { describe, expect, it } from 'vitest';
import { portionData } from '../test/fixtures';
import { reviewableItems, unreviewedOf } from './reviewable';

describe('reviewableItems', () => {
  const items = reviewableItems(portionData());

  it('lists every reviewable field in reading order, with stable IDs', () => {
    const ids = items.map((r) => r.id);
    expect(ids.slice(0, 5)).toEqual([
      'LA.1.001/biur.he',
      'LA.1.001/biur.en',
      'LA.1.002/biur.he',
      'glossary/ahava',
      'glossary/plain',
    ]);
    expect(ids).toContain('q-choice/hint');
    expect(ids).toContain('q-choice/hint.en');
    expect(ids).toContain('card-1/talk');
    // card-2 has no talk question.
    expect(ids).not.toContain('card-2/talk');
  });

  it('finds the items still waiting for approval', () => {
    expect(items.length - unreviewedOf(items).length).toBe(1);
  });
});
