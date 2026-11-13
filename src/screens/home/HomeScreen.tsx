import { HeartMark } from '../../components/HeartMark';
import { HeartPulseIcon } from '../../components/Icons';
import { ThemeToggle } from '../../components/ThemeToggle';
import { Wordmark } from '../../components/Wordmark';
import { config } from '../../config';
import { usePortion } from '../../content/PortionProvider';
import { navigate } from '../../router';
import { ROUTES } from '../../routes';
import { useStore } from '../../store/StoreProvider';
import { useStartQuiz } from '../../store/useStartQuiz';
import { he } from '../../strings/he';
import './Home.css';

export function HomeScreen() {
  const { state } = useStore();
  const { portion } = usePortion();
  const startQuiz = useStartQuiz();
  return (
    <main className="screen home">
      <div className="home-top">
        <ThemeToggle />
      </div>
      <div className="home-brand">
        <HeartMark progress={state.heartProgress} animated drawIn beating label={he.appName.full} />
        <Wordmark />
      </div>

      <section className="card home-portion" aria-label={portion.label.he}>
        <p className="home-portion-label">{portion.label.he}</p>
        <p className="home-portion-meta">
          <span>{portion.location.he}</span>
          <span aria-hidden="true"> · </span>
          <span>{he.home.estimatedTime(config.demo.estimatedMinutes)}</span>
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
          onClick={() => startQuiz('solo')}
        >
          {he.home.start}
        </button>
        <button
          type="button"
          className="btn btn-secondary btn-block"
          onClick={() => navigate(ROUTES.together)}
        >
          {he.home.together}
        </button>
        <button type="button" className="link-btn" onClick={() => navigate(ROUTES.about)}>
          {he.home.about}
        </button>
      </div>

      <p className="home-maskil">{he.home.maskil}</p>
    </main>
  );
}
