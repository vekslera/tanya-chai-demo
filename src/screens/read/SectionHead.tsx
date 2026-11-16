import { he } from '../../strings/he';

type Props = {
  /** The section's number, from 1, and how many there are. */
  n: number;
  total: number;
  biur: boolean;
  onToggle: () => void;
  /** The first-time line under the switch (S2). */
  tip?: boolean;
};

/** The head of a section (S2): its number, and the switch that shows or hides its ביאור. */
export function SectionHead({ n, total, biur, onToggle, tip }: Props) {
  return (
    <div className="section-head">
      <div className="section-head-row">
        <span className="section-number">{he.read.section(n, total)}</span>
        <button
          type="button"
          role="switch"
          aria-checked={biur}
          className="biur-switch"
          onClick={onToggle}
        >
          <span className="biur-switch-track" aria-hidden="true">
            <span className="biur-switch-thumb" />
          </span>
          <span>{he.read.biurSwitch}</span>
        </button>
      </div>
      {tip && <p className="section-tip">{he.read.biurTip}</p>}
    </div>
  );
}
