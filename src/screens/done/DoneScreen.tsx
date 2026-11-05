import { useEffect } from 'react';
import { HeartMark } from '../../components/HeartMark';
import { config } from '../../config';
import { completionView, doneDelays } from '../../domain/completion';
import { useCountUp } from '../../hooks/useCountUp';
import { useTimeline } from '../../hooks/useTimeline';
import { redirectFrom } from '../../router';
import { ROUTES } from '../../routes';
import { useStore } from '../../store/StoreProvider';
import { he } from '../../strings/he';
import { DoneActions } from './DoneActions';
import { DoneCommunity } from './DoneCommunity';
import { DonePoints } from './DonePoints';
import { DoneStreak } from './DoneStreak';
import './Done.css';

const DELAYS = doneDelays(config.motion.done, config.motion.heartContourMs);

/** The completion screen (S5): the heart's contour advances, the streak ticks, points count up. */
export function DoneScreen() {
  const { state } = useStore();
  const c = state.lastCompletion;
  const step = useTimeline(DELAYS);

  useEffect(() => {
    if (!c) redirectFrom(ROUTES.done, ROUTES.home);
  }, [c]);

  const view = c && completionView(c, step);
  const points = useCountUp(view?.points ?? 0, !!view?.countPoints, config.motion.countUpMs);
  if (!c || !view) return null;

  return (
    <main className="screen done">
      <h1 className="done-headline">
        {view.together ? he.done.headlineTogether : he.done.headline}
      </h1>

      <div className="done-heart">
        <HeartMark
          progress={view.heart}
          animated
          purify={view.purify}
          label={he.done.heartLabel(c.after.heartProgress)}
        />
        <p className="done-heart-line">{he.done.heartLine}</p>
      </div>

      <DoneStreak together={view.together} streak={view.streak} changed={view.streakChanged} />
      <DonePoints completion={c} points={points} />
      <DoneCommunity />
      <DoneActions together={view.together} />
    </main>
  );
}
