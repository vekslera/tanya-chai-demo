import { useEffect, useState } from 'react';

/** True once `ms` have passed since mount. */
export function useElapsed(ms: number): boolean {
  const [elapsed, setElapsed] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setElapsed(true), ms);
    return () => window.clearTimeout(t);
  }, [ms]);
  return elapsed;
}
