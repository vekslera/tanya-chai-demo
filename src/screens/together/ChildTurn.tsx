import { TopBar } from '../../components/TopBar';
import { ROUTES } from '../../routes';
import { he } from '../../strings/he';

/** After the last card: the son's turn to answer. */
export function ChildTurn({
  onQuestions,
  onBack,
}: {
  onQuestions: () => void;
  onBack: () => void;
}) {
  return (
    <main className="screen together together--center">
      <TopBar back={ROUTES.home} />
      <div className="together-intro">
        <h1 className="together-title">{he.together.childTurn}</h1>
        <p className="together-intro-text">{he.together.childTurnText}</p>
        <button type="button" className="btn btn-gold btn-big btn-block" onClick={onQuestions}>
          {he.together.toChildQuestions}
        </button>
        <button type="button" className="link-btn" onClick={onBack}>
          {he.together.backToCards}
        </button>
      </div>
    </main>
  );
}
