import type { Completion } from '../../domain/progress';
import { he } from '../../strings/he';

/** The points earned, counting up; or why none were added this time. */
export function DonePoints({ completion: c, points }: { completion: Completion; points: number }) {
  return (
    <section className="done-points">
      {c.awarded ? (
        <>
          <p className="done-points-line">
            <bdi dir="ltr">+{points}</bdi> {he.done.pointsWord}
          </p>
          <p className="done-points-detail">{he.done.pointsDetail(c.earned, c.bonus)}</p>
        </>
      ) : (
        <p className="done-points-detail">
          {c.track === 'together' ? he.done.pointsAlreadyTogether : he.done.pointsAlready}
        </p>
      )}
    </section>
  );
}
