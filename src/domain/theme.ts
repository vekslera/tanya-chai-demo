// The app's look (SPEC §4.1, S7): the device's own light or dark mode, or the learner's choice.

export const THEMES = ['auto', 'light', 'dark'] as const;
export type Theme = (typeof THEMES)[number];

/** The look shown: the choice, or the device's own mode for "auto". */
export const shownTheme = (theme: Theme, deviceDark: boolean): 'light' | 'dark' =>
  theme === 'auto' ? (deviceDark ? 'dark' : 'light') : theme;

/** The other look, as a choice; the device's own mode is "auto" again. */
export function otherTheme(theme: Theme, deviceDark: boolean): Theme {
  const next = shownTheme(theme, deviceDark) === 'dark' ? 'light' : 'dark';
  return next === shownTheme('auto', deviceDark) ? 'auto' : next;
}
