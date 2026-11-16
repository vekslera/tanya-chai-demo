import { usePortion } from '../content/PortionProvider';
import { dedicationFor } from '../domain/dedication';
import { he } from '../strings/he';
import './Dedication.css';

/**
 * The lesson's dedication: a quiet line under the buttons of a reading screen (S3, S8), one of the
 * portion's, chosen at random for each lesson (by the lesson's `seed`).
 */
export function Dedication({ seed }: { seed: number }) {
  const dedication = dedicationFor(usePortion().portion.dedications, seed);
  if (!dedication) return null;
  return <p className="dedication">{he.dedication[dedication.kind](dedication.name)}</p>;
}
