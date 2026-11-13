import { THEMES } from '../../domain/theme';
import { useStore } from '../../store/StoreProvider';
import { he } from '../../strings/he';

/** The app's look: the device's own light or dark mode (the default), or always one of them. */
export function ThemeSection() {
  const { state, dispatch } = useStore();
  return (
    <section className="about-section">
      <h2 id="theme-title">{he.about.themeTitle}</h2>
      <div className="theme-choice" role="radiogroup" aria-labelledby="theme-title">
        {THEMES.map((theme) => (
          <button
            key={theme}
            type="button"
            role="radio"
            aria-checked={state.theme === theme}
            className="theme-option"
            onClick={() => dispatch({ type: 'setTheme', theme })}
          >
            {he.about.themes[theme]}
          </button>
        ))}
      </div>
    </section>
  );
}
