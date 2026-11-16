import { usePortion } from '../content/PortionProvider';
import { dedicationFor } from '../domain/dedication';
import { useStore } from '../store/StoreProvider';
import { he } from '../strings/he';
import './Dedication.css';

/**
 * The lesson's dedication: a quiet line under the buttons of a reading screen (S3, S8), one of the
 * portion's, drawn at random each time a lesson is started or resumed.
 */
export function Dedication() {
  const { dedicationSeed } = useStore().state;
  const dedication = dedicationFor(usePortion().portion.dedications, dedicationSeed);
  if (!dedication) return null;
  return <p className="dedication">{he.dedication[dedication.kind](dedication.name)}</p>;
}
