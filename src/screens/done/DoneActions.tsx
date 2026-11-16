import { SHINUN_ENABLED } from '../../features';
import { navigate } from '../../router';
import { ROUTES, type Route } from '../../routes';
import { he } from '../../strings/he';

const Action = ({ to, primary, label }: { to: Route; primary?: boolean; label: string }) => (
  <button
    type="button"
    className={`btn ${primary ? 'btn-primary' : 'btn-secondary'} btn-block`}
    onClick={() => navigate(to)}
  >
    {label}
  </button>
);

/** Where to go next: Avos uBanim or home after Matmid, home after Avos uBanim. */
export function DoneActions({
  together,
  shinun = SHINUN_ENABLED,
}: {
  together: boolean;
  shinun?: boolean;
}) {
  return (
    <div className="done-actions">
      {together ? (
        <Action to={ROUTES.home} primary label={he.done.home} />
      ) : (
        <>
          <Action to={ROUTES.together} primary label={he.done.together} />
          <Action to={ROUTES.home} label={he.done.home} />
        </>
      )}
      {shinun && <Action to={ROUTES.shinun} label={he.done.shinun} />}
      <button type="button" className="link-btn" onClick={() => navigate(ROUTES.about)}>
        {he.done.about}
      </button>
    </div>
  );
}
