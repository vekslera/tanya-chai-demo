import { useEffect, useState } from 'react';

/** A short note: shown when asked, hidden again after `ms`. Asking again restarts the wait. */
export function useNotice(ms: number): [shown: boolean, show: () => void] {
  const [shownAt, setShownAt] = useState<number | null>(null);
  useEffect(() => {
    if (shownAt === null) return;
    const timer = window.setTimeout(() => setShownAt(null), ms);
    return () => window.clearTimeout(timer);
  }, [shownAt, ms]);
  return [shownAt !== null, () => setShownAt(Date.now())];
}
