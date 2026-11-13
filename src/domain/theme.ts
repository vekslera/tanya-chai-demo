// The app's look (SPEC §4.1, S7): the device's own light or dark mode, or the learner's choice.

export const THEMES = ['auto', 'light', 'dark'] as const;
export type Theme = (typeof THEMES)[number];
