import { CheckIcon } from '../../components/Icons';
import { TopBar } from '../../components/TopBar';
import { config } from '../../config';
import type { Level } from '../../domain/types';
import { navigate } from '../../router';
import { ROUTES } from '../../routes';
import { useStore } from '../../store/StoreProvider';
import { he } from '../../strings/he';
import './Level.css';

export function LevelScreen() {
  const { state, dispatch } = useStore();
  const choose = (level: Level) => {
    dispatch({ type: 'setLevel', level });
    navigate(ROUTES.read);
  };
  return (
    <main className="screen">
      <TopBar back={ROUTES.home} />
      <h1 className="screen-title">{he.level.title}</h1>
      <div className="level-options">
        {config.levels.map(({ id }) => {
          const o = he.level.options[id]!;
          const selected = state.level === id;
          return (
            <button
              key={id}
              type="button"
              className={`level-card${selected ? ' level-card--selected' : ''}`}
              onClick={() => choose(id)}
              aria-describedby={`level-desc-${id}`}
            >
              <span className="level-card-title">{o.title}</span>
              <span className="level-card-desc" id={`level-desc-${id}`}>
                {o.description}
              </span>
              {selected && (
                <span className="level-card-check">
                  <CheckIcon />
                  <span>{he.level.selected}</span>
                </span>
              )}
            </button>
          );
        })}
      </div>
      <p className="level-maskil">{he.level.maskil}</p>
    </main>
  );
}
