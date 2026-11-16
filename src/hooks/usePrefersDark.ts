import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-color-scheme: dark)';

/** The device's dark-mode query; null where it cannot be asked. */
function media(): MediaQueryList | null {
  try {
    return window.matchMedia(QUERY);
  } catch {
    return null;
  }
}

/** Whether the device is in dark mode, following its changes. False when it cannot be told. */
export function usePrefersDark(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const m = media();
      m?.addEventListener('change', onChange);
      return () => m?.removeEventListener('change', onChange);
    },
    () => media()?.matches ?? false,
  );
}
