import { he } from '../../strings/he';

const PERCENT = 100;

/** The thin reading-progress bar under the top bar. */
export function ReadProgress({ percent }: { percent: number }) {
  return (
    <div
      className="read-progress"
      role="progressbar"
      aria-label={he.read.progress}
      aria-valuemin={0}
      aria-valuemax={PERCENT}
      aria-valuenow={percent}
    >
      <div className="read-progress-bar" style={{ transform: `scaleX(${percent / PERCENT})` }} />
    </div>
  );
}
