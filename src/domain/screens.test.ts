// The small domain modules behind single screens: completion, Avos uBanim and reading.
import { describe, expect, it } from 'vitest';
import { portionData } from '../test/fixtures';
import { completionView, doneDelays } from './completion';
import { assemblePortion } from './portion';
import type { Completion, Progress } from './progress';
import { hasEnglish, readingProgress, showsBiur } from './reading';
import { cardOfUnit, togetherStep } from './together';

const before: Progress = {
  streak: 3,
  points: 0,
  heartProgress: 10,
  completedLevels: [],
  completedTogether: false,
  familyStreak: 1,
};
const after: Progress = { ...before, streak: 4, heartProgress: 13, familyStreak: 2 };
const solo: Completion = {
  track: 'solo',
  level: 1,
  earned: 15,
  bonus: 20,
  awarded: true,
  before,
  after,
};

describe('completion', () => {
  it('times the purify glow after the contour', () => {
    const t = { contourAtMs: 500, streakAtMs: 900, pointsAtMs: 1300, purifyAfterContourMs: 100 };
    expect(doneDelays(t, 1200)).toEqual([500, 900, 1300, 1800]);
  });

  it('shows the values before, then after, step by step', () => {
    expect(completionView(solo, 0)).toMatchObject({
      heart: 10,
      streak: 3,
      streakChanged: false,
      points: 35,
      countPoints: false,
      purify: false,
    });
    expect(completionView(solo, 4)).toMatchObject({
      heart: 13,
      streak: 4,
      streakChanged: true,
      countPoints: true,
      purify: true,
    });
  });

  it('shows the family streak for Avos uBanim, and no points when nothing was awarded', () => {
    const together: Completion = { ...solo, track: 'together', awarded: false, after: before };
    expect(completionView(together, 4)).toMatchObject({
      together: true,
      streak: 1,
      streakChanged: false,
      points: 0,
      purify: false,
    });
  });
});

describe('together', () => {
  it('maps the stored index to a step', () => {
    // Without questions under way, the intro; before the cards too.
    expect(togetherStep(1, 2)).toEqual({ kind: 'intro' });
    expect(togetherStep(-1, 2, 0)).toEqual({ kind: 'intro' });
    expect(togetherStep(-5, 2, 0)).toEqual({ kind: 'intro' });
    // A card up to the one the current question follows, then the question.
    expect(togetherStep(0, 2, 0)).toEqual({ kind: 'card', index: 0 });
    expect(togetherStep(1, 2, 0)).toEqual({ kind: 'question' });
    expect(togetherStep(5, 2, 9)).toEqual({ kind: 'card', index: 1 });
  });

  it('finds the card that covers a unit', () => {
    const p = assemblePortion(portionData());
    expect(cardOfUnit(p.portion.together, p.sections, 'LA.1.004')?.id).toBe('card-2');
    expect(cardOfUnit(p.portion.together, p.sections, 'nope')).toBeUndefined();
  });
});

describe('reading', () => {
  it('shows the ביאור on the configured levels only', () => {
    const levels = [
      { id: 1, showBiur: false },
      { id: 2, showBiur: true },
    ];
    expect([1, 2, 3].map((l) => showsBiur(levels, l))).toEqual([false, true, false]);
  });

  it('computes the progress and the unlock', () => {
    expect(readingProgress(1, 3)).toBe(33);
    expect(readingProgress(0, 0)).toBe(100);
  });

  it('tells whether the portion has English', () => {
    const data = portionData();
    expect(hasEnglish(assemblePortion(data).sections)).toBe(true);
    data.translations = [];
    expect(hasEnglish(assemblePortion(data).sections)).toBe(false);
  });
});
