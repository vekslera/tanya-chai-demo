import { describe, expect, it } from 'vitest';
import { he } from './he';

describe('strings', () => {
  it('says one day, or n days', () => {
    expect(he.home.streak(1)).toBe('רצף: יום אחד');
    expect(he.home.streak(5)).toBe('רצף: 5 ימים');
    expect([1, 2].map(he.done.streakDays)).toEqual(['יום', 'ימים']);
  });

  it('fills in numbers and names', () => {
    const filled = [
      he.read.footnote('3'),
      he.quiz.progress(1, 3),
      he.quiz.points(10),
      he.done.pointsDetail(15, 20),
      he.done.heartLabel(65),
      he.together.cardOf(2, 7),
      he.togetherQuiz.points(5),
      he.shinun.round(1, 2),
      he.about.version('1.0', '2026-11-06'),
      he.about.draftNote(4),
    ];
    for (const s of filled) expect(s).toMatch(/\d/);
  });
});
