/** ●●○: questions done and current are filled. Decorative; the count is also given as text. */
export function ProgressDots({ count, current }: { count: number; current: number }) {
  return (
    <span className="progress-dots" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className={`progress-dot${i < current ? ' progress-dot--done' : ''}${i === current ? ' progress-dot--current' : ''}`}
        />
      ))}
    </span>
  );
}
