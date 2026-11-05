import { useEffect, useState } from 'react';
import { prefersReducedMotion } from './reducedMotion';

/**
 * Steps through a timeline: returns how many of the given delays (ms, from mount) have passed. The
 * timeline runs once per mount; under reduced motion every step has passed at once.
 */
export function useTimeline(delays: readonly number[]): number {
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
