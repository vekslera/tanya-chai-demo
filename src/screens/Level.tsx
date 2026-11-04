import { TopBar } from '../components/TopBar';
import { CheckIcon } from '../components/Icons';
import { navigate } from '../router';
import type { Level } from '../store/logic';
import { useStore } from '../store/store';
import { he } from '../strings/he';
import './Level.css';

const LEVELS: Level[] = [1, 2];

export function LevelScreen() {
  const { state, dispatch } = useStore();
  const choose = (level: Level) => {
    dispatch({ type: 'setLevel', level });
    navigate('/read');
  };
  return (
    <main className="screen">
      <TopBar back="/" />
      <h1 className="screen-title">{he.level.title}</h1>
      <div className="level-options">
        {LEVELS.map((level) => {
          const o = he.level.options[level];
          const selected = state.level === level;
          return (
            <button
              key={level}
              type="button"
              className={`level-card${selected ? ' level-card--selected' : ''}`}
              onClick={() => choose(level)}
              aria-describedby={`level-desc-${level}`}
            >
              <span className="level-card-title">{o.title}</span>
              <span className="level-card-desc" id={`level-desc-${level}`}>
                {o.description}
              </span>
              {selected && (
                <span className="level-card-check">
                  <CheckIcon size={16} />
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
