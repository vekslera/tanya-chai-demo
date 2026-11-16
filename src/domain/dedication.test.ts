import { describe, expect, it } from 'vitest';
import { dedicationFor } from './dedication';
import type { Dedication } from './types';

const all: Dedication[] = [
  { kind: 'lizchus', name: 'א' },
  { kind: 'leiluiNishmas', name: 'ב' },
  { kind: 'leiluiNishmas', name: 'ג' },
  { kind: 'partner', name: 'ד' },
];

describe('dedicationFor', () => {
  it('chooses one dedication per lesson, the same for the same seed, each of them in turn', () => {
    expect(dedicationFor(all, 7)).toBe(dedicationFor(all, 7));
    const shown = new Set(Array.from({ length: 40 }, (_, seed) => dedicationFor(all, seed)!.name));
    expect(shown).toEqual(new Set(['א', 'ב', 'ג', 'ד']));
  });

  it('has none without dedications', () => {
    expect(dedicationFor(undefined, 1)).toBeUndefined();
    expect(dedicationFor([], 1)).toBeUndefined();
  });
});
