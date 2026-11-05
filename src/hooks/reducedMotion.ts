/** Whether the user asked for reduced motion (SPEC §3.2). False when it cannot be told. */
export function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}
