import { otherTheme, shownTheme } from '../domain/theme';
import { usePrefersDark } from '../hooks/usePrefersDark';
import { useStore } from '../store/StoreProvider';
import { he } from '../strings/he';
import { MoonIcon, SunIcon } from './Icons';

/** One tap to the other look: a moon in the light look, a sun in the dark one (S1, S7). */
export function ThemeToggle() {
  const { state, dispatch } = useStore();
  const deviceDark = usePrefersDark();
  const dark = shownTheme(state.theme, deviceDark) === 'dark';
  return (
    <button
      type="button"
      className="icon-btn"
      aria-label={dark ? he.theme.toLight : he.theme.toDark}
      onClick={() => dispatch({ type: 'setTheme', theme: otherTheme(state.theme, deviceDark) })}
    >
      {dark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
