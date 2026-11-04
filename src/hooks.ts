import { useEffect, useState } from 'react';

export function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

/** Counts from 0 to `target` once `start` is true; instant under reduced motion. */
export function useCountUp(target: number, start: boolean, durationMs = 900): number {
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
      setValue(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, start, durationMs]);
  return value;
}

/** Steps through a timeline: returns how many of the given delays (ms, from mount) have passed. */
export function useTimeline(delays: number[]): number {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (prefersReducedMotion()) {
      setStep(delays.length);
      return;
    }
    const timers = delays.map((d, i) =>
      window.setTimeout(() => setStep((s) => Math.max(s, i + 1)), d),
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
    // The timeline runs once per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return step;
}
