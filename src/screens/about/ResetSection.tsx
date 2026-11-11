import { useState } from 'react';
import { useStore } from '../../store/StoreProvider';
import { he } from '../../strings/he';

/** Start the demo over, after a confirmation. */
export function ResetSection() {
  const { dispatch } = useStore();
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);

  return (
    <section className="about-section">
      <h2>{he.about.resetTitle}</h2>
      {confirming ? (
        <div className="about-confirm">
          <p>{he.about.resetConfirm}</p>
          <div className="about-confirm-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                dispatch({ type: 'reset' });
                setConfirming(false);
                setDone(true);
              }}
            >
              {he.about.resetYes}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setConfirming(false)}
            >
              {he.about.resetNo}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => {
            setDone(false);
            setConfirming(true);
          }}
        >
          {he.about.reset}
        </button>
      )}
      <p className="about-status" aria-live="polite">
        {done ? he.about.resetDone : ''}
      </p>
    </section>
  );
}
