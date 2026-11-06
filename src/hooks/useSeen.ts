import { useEffect, useState, type RefObject } from 'react';

/**
 * The `data-unit` IDs of the elements inside `container` that have come into view (SPEC §7: one
 * observer entry per sentence). Without IntersectionObserver every unit counts as seen. `deps`
 * re-observes when the content changes.
 */
export function useSeen(
  container: RefObject<HTMLElement | null>,
  allIds: readonly string[],
  margin: string,
  deps: readonly unknown[],
): ReadonlySet<string> {
  const [seen, setSeen] = useState<ReadonlySet<string>>(new Set());
  useEffect(() => {
    if (!('IntersectionObserver' in window)) {
      setSeen(new Set(allIds));
      return;
    }
    const els = container.current!.querySelectorAll<HTMLElement>('[data-unit]');
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).map((e) => e.target as HTMLElement);
        if (visible.length === 0) return;
        setSeen((prev) => new Set([...prev, ...visible.map((el) => el.dataset.unit!)]));
        for (const el of visible) io.unobserve(el);
      },
      { rootMargin: margin },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
    // Re-observes only when the caller's content changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return seen;
}
