import { useEffect } from 'react';
import { HeartMark } from '../components/HeartMark';
import { HeartPulseIcon } from '../components/Icons';
import { useCountUp, useTimeline } from '../hooks';
import { navigate, redirectFrom } from '../router';
import { useStore } from '../store/store';
import { he } from '../strings/he';
import { SHINUN_ENABLED } from '../features';
import './Done.css';

// Timeline (ms from mount): contour starts, purify after the 1.2s contour, streak ticks over,
// points count up.
const CONTOUR_AT = 500;
const PURIFY_AT = CONTOUR_AT + 1300;
const STREAK_AT = 900;
const POINTS_AT = 1300;

export function DoneScreen() {
  const { state } = useStore();
  const c = state.lastCompletion;
  const step = useTimeline([CONTOUR_AT, STREAK_AT, POINTS_AT, PURIFY_AT]);

  useEffect(() => {
    if (!c) redirectFrom('/done', '/');
  }, [c]);

  const total = c && c.awarded ? c.earned + c.bonus : 0;
  const points = useCountUp(total, step >= 3);
  if (!c) return null;

  const together = c.track === 'together';
  const heart = step >= 1 ? c.after.heartProgress : c.before.heartProgress;
  const streakBefore = together ? c.before.familyStreak : c.before.streak;
  const streakAfter = together ? c.after.familyStreak : c.after.streak;
  const streak = step >= 2 ? streakAfter : streakBefore;
  const streakChanged = step >= 2 && streakAfter !== streakBefore;

  return (
    <main className="screen done">
      <h1 className="done-headline">{together ? he.done.headlineTogether : he.done.headline}</h1>

      <div className="done-heart">
        <HeartMark
          progress={heart}
          animated
          purify={c.awarded && step >= 4}
          size={196}
          label={he.done.heartLabel(c.after.heartProgress)}
        />
        <p className="done-heart-line">{he.done.heartLine}</p>
      </div>

      <section className="done-streak" aria-live="polite">
        <p className="done-streak-label">
          <HeartPulseIcon />
          {together ? he.done.familyStreakLabel : he.done.streakLabel}
        </p>
        <p className="done-streak-value">
          <span
            key={streak}
            className={streakChanged ? 'done-streak-number pulse' : 'done-streak-number'}
          >
            {streak}
          </span>{' '}
          <span className="done-streak-unit">{he.done.streakDays(streak)}</span>
        </p>
        <p className="done-streak-rule">{he.done.streakRule}</p>
      </section>

      <section className="done-points">
        {c.awarded ? (
          <>
            <p className="done-points-line">
              <bdi dir="ltr">+{points}</bdi> {he.done.pointsWord}
            </p>
            <p className="done-points-detail">{he.done.pointsDetail(c.earned, c.bonus)}</p>
          </>
        ) : (
          <p className="done-points-detail">
            {together ? he.done.pointsAlreadyTogether : he.done.pointsAlready}
          </p>
        )}
      </section>

      <section className="done-community">
        <p>
          {he.done.communityLabel} <bdi>{he.done.communityValue.toLocaleString('en-US')}</bdi>{' '}
          {he.done.communityUnit}
        </p>
        <span className="demo-tag">{he.common.demoData}</span>
      </section>

      <div className="done-actions">
        {together ? (
          <button type="button" className="btn btn-primary btn-block" onClick={() => navigate('/')}>
            {he.done.home}
          </button>
        ) : (
          <>
            <button
              type="button"
              className="btn btn-primary btn-block"
              onClick={() => navigate('/level')}
            >
              {he.done.otherLevel}
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-block"
              onClick={() => navigate('/together')}
            >
              {he.done.together}
            </button>
          </>
        )}
        {SHINUN_ENABLED && (
          <button
            type="button"
            className="btn btn-secondary btn-block"
            onClick={() => navigate('/shinun')}
          >
            {he.done.shinun}
          </button>
        )}
        <button type="button" className="link-btn" onClick={() => navigate('/about')}>
          {he.done.about}
        </button>
      </div>
    </main>
  );
}
