import { HeartPulseIcon } from '../../components/Icons';
import { he } from '../../strings/he';

/** The streak (or the family streak), pulsing as it ticks over. */
export function DoneStreak({
  together,
  streak,
  changed,
}: {
  together: boolean;
  streak: number;
  changed: boolean;
}) {
  return (
    <section className="done-streak" aria-live="polite">
      <p className="done-streak-label">
        <HeartPulseIcon />
        {together ? he.done.familyStreakLabel : he.done.streakLabel}
      </p>
      <p className="done-streak-value">
        <span key={streak} className={changed ? 'done-streak-number pulse' : 'done-streak-number'}>
          {streak}
        </span>{' '}
        <span className="done-streak-unit">{he.done.streakDays(streak)}</span>
      </p>
      <p className="done-streak-rule">{he.done.streakRule}</p>
    </section>
  );
}
