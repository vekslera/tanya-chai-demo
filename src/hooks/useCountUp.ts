import { useEffect, useState } from 'react';
import { prefersReducedMotion } from './reducedMotion';

/** Ease-out cubic: fast at first, settling at the end. */
export const easeOut = (p: number) => 1 - Math.pow(1 - p, 3);

/** Counts from 0 to `target` over `durationMs` once `start` is true; instant under reduced motion. */
export function useCountUp(target: number, start: boolean, durationMs: number): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    if (prefersReducedMotion() || target === 0) {
      setValue(target);
      return;
    }
    let frame = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / durationMs);
      setValue(Math.round(target * easeOut(p)));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, start, durationMs]);
  return value;
}
