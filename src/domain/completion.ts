// What the completion screen shows at each step of its timeline (SPEC §3.1, S5).
import type { Completion } from './progress.ts';

export type DoneTimeline = {
  contourAtMs: number;
  streakAtMs: number;
  pointsAtMs: number;
  /** The purify glow starts this long after the contour has finished. */
  purifyAfterContourMs: number;
};

/** The delays of the timeline's steps, in step order: contour, streak, points, purify. */
export function doneDelays(t: DoneTimeline, heartContourMs: number): number[] {
  return [
    t.contourAtMs,
    t.streakAtMs,
    t.pointsAtMs,
    t.contourAtMs + heartContourMs + t.purifyAfterContourMs,
  ];
}

const STEP = { contour: 1, streak: 2, points: 3, purify: 4 } as const;

/** The values on screen once `step` steps of the timeline have passed. */
export function completionView(c: Completion, step: number) {
  const together = c.track === 'together';
  const streakBefore = together ? c.before.familyStreak : c.before.streak;
  const streakAfter = together ? c.after.familyStreak : c.after.streak;
  const streakShown = step >= STEP.streak;
  return {
    together,
    heart: step >= STEP.contour ? c.after.heartProgress : c.before.heartProgress,
    streak: streakShown ? streakAfter : streakBefore,
    streakChanged: streakShown && streakAfter !== streakBefore,
    points: c.awarded ? c.earned + c.bonus : 0,
    countPoints: step >= STEP.points,
    purify: c.awarded && step >= STEP.purify,
  };
}
