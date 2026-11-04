import { useState } from 'react';
import { BidiText } from '../components/BidiText';
import { TopBar } from '../components/TopBar';
import { Wordmark } from '../components/Wordmark';
import { HeartMark } from '../components/HeartMark';
import { unreviewedCount } from '../content/loader';
import { usePortion } from '../content/PortionContext';
import { clearState } from '../store/persistence';
import { useStore } from '../store/store';
import { he } from '../strings/he';
import './About.css';

const UNREVIEWED = unreviewedCount();

export function AboutScreen() {
  const { dispatch } = useStore();
  const { portion } = usePortion();
  const [confirming, setConfirming] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const showDraft = !__CONTENT_STRICT__ && UNREVIEWED > 0;

  const reset = () => {
    clearState();
    dispatch({ type: 'reset' });
    setConfirming(false);
    setResetDone(true);
  };

  return (
    <main className="screen about">
      <TopBar back="/" />
      <div className="about-brand">
        <HeartMark progress={75} size={72} />
        <Wordmark as="p" />
        {showDraft && (
          <p className="draft-badge" title={he.about.draftNote(UNREVIEWED)}>
            {he.about.draft}
          </p>
        )}
      </div>

      <h1 className="screen-title">{he.about.title}</h1>
      <section className="about-section">
        {he.about.what.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </section>

      <section className="about-section">
        <h2>{he.about.pathsTitle}</h2>
        <dl className="about-paths">
          {he.about.paths.map((p) => (
            <div key={p.name}>
              <dt>{p.name}</dt>
              <dd>{p.text}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="about-section">
        <h2>{he.about.sourcesTitle}</h2>
        <ul className="about-sources">
          {portion.sources.map((s) => (
            <li key={s.id}>
              <BidiText text={s.attribution} />
              {s.url && (
                <>
                  {' '}
                  <a href={s.url} target="_blank" rel="noopener noreferrer">
                    {he.about.licenseLink}
                  </a>
                </>
              )}
            </li>
          ))}
          <li>{he.about.contentCredit}</li>
        </ul>
        {showDraft && <p className="small muted">{he.about.draftNote(UNREVIEWED)}</p>}
      </section>

      <section className="about-section">
        <h2>{he.about.contactTitle}</h2>
        <p>{he.about.contact}</p>
      </section>

      <section className="about-section">
        <h2>{he.about.resetTitle}</h2>
        {confirming ? (
          <div className="about-confirm">
            <p>{he.about.resetConfirm}</p>
            <div className="about-confirm-actions">
              <button type="button" className="btn btn-primary" onClick={reset}>
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
              setResetDone(false);
              setConfirming(true);
            }}
          >
            {he.about.reset}
          </button>
        )}
        <p className="about-status" aria-live="polite">
          {resetDone ? he.about.resetDone : ''}
        </p>
      </section>

      <p className="about-version">
        <bdi>{he.about.version(__APP_VERSION__, __BUILD_DATE__)}</bdi>
      </p>
    </main>
  );
}
