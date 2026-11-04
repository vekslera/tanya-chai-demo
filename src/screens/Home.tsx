import { HeartMark } from '../components/HeartMark';
import { HeartPulseIcon } from '../components/Icons';
import { Wordmark } from '../components/Wordmark';
import { usePortion } from '../content/PortionContext';
import { navigate } from '../router';
import { useStore } from '../store/store';
import { he } from '../strings/he';
import './Home.css';

export function HomeScreen() {
  const { state } = useStore();
  const { portion } = usePortion();
  return (
    <main className="screen home">
      <div className="home-brand">
        <HeartMark
          progress={state.heartProgress}
          animated
          drawIn
          beating
          size={168}
          label={he.appName.full}
        />
        <Wordmark />
      </div>

      <section className="card home-portion" aria-label={portion.label.he}>
        <p className="home-portion-label">{portion.label.he}</p>
        <p className="home-portion-meta">
          <span>{portion.location.he}</span>
          <span aria-hidden="true"> · </span>
          <span>{he.home.estimatedTime}</span>
        </p>
      </section>

      <p className="home-streak">
        <HeartPulseIcon />
        <span>{he.home.streak(state.streak)}</span>
      </p>

      <div className="home-actions">
        <button
          type="button"
          className="btn btn-primary btn-block"
          onClick={() => navigate('/level')}
        >
          {he.home.start}
        </button>
        <button
          type="button"
          className="btn btn-secondary btn-block"
          onClick={() => navigate('/together')}
        >
          {he.home.together}
        </button>
        <button type="button" className="link-btn" onClick={() => navigate('/about')}>
          {he.home.about}
        </button>
      </div>
    </main>
  );
}
