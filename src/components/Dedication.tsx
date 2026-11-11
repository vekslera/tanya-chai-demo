import { usePortion } from '../content/PortionProvider';
import { he } from '../strings/he';
import './Dedication.css';

/** The day's dedication: a quiet line under the buttons of a reading screen (S3, S8). */
export function Dedication() {
  const { dedication } = usePortion().portion;
  if (!dedication) return null;
  return <p className="dedication">{he.dedication[dedication.kind](dedication.name)}</p>;
}
