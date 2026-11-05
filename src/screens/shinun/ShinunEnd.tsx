import { navigate } from '../../router';
import { ROUTES } from '../../routes';
import { he } from '../../strings/he';

/** After the last round: the whole sentence again, and a word on the full Shinun path. */
export function ShinunEnd({ sentence }: { sentence: string }) {
  return (
    <section className="shinun-end">
      <h1 className="screen-title">{he.shinun.finishedTitle}</h1>
      <p className="shinun-sentence">{sentence}</p>
      <p className="shinun-note">{he.shinun.finishedNote}</p>
      <button
        type="button"
        className="btn btn-primary btn-block"
        onClick={() => navigate(ROUTES.home)}
      >
        {he.shinun.home}
      </button>
    </section>
  );
}
