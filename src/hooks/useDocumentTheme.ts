import { useEffect } from 'react';
import type { Theme } from '../domain/theme';

/**
 * Applies the learner's choice of light or dark to the page (`data-theme` on the root, read by
 * tokens.css); "auto" leaves the device's own mode.
 */
export function useDocumentTheme(theme: Theme) {
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'auto') delete root.dataset.theme;
    else root.dataset.theme = theme;
  }, [theme]);
}
