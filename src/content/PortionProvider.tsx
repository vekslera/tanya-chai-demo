import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { AssembledPortion } from '../domain/portion';

const PortionContext = createContext<AssembledPortion | null>(null);

type Loaded = { portion: AssembledPortion } | { error: unknown } | null;

/**
 * Loads the portion once and provides it. Nothing is shown until it is loaded; if loading fails,
 * the error reaches the error boundary above, which shows the retry screen.
 */
export function PortionProvider({
  load,
  children,
}: {
  load: () => Promise<AssembledPortion>;
  children: ReactNode;
}) {
  const [loaded, setLoaded] = useState<Loaded>(null);
  useEffect(() => {
    let live = true;
    load().then(
      (portion) => live && setLoaded({ portion }),
      (error: unknown) => live && setLoaded({ error }),
    );
    return () => {
      live = false;
    };
  }, [load]);

  if (!loaded) return null;
  if ('error' in loaded) throw loaded.error;
  return <PortionContext.Provider value={loaded.portion}>{children}</PortionContext.Provider>;
}

export function usePortion(): AssembledPortion {
  const p = useContext(PortionContext);
  if (!p) throw new Error('usePortion outside PortionProvider');
  return p;
}
