import { createContext, useContext, type ReactNode } from 'react';
import { assemblePortion, type AssembledPortion } from './loader';

const PortionContext = createContext<AssembledPortion | null>(null);

let cached: AssembledPortion | null = null;

export function PortionProvider({ children }: { children: ReactNode }) {
  // Throws if the content is broken; the error boundary above shows the retry screen.
  cached ??= assemblePortion();
  return <PortionContext.Provider value={cached}>{children}</PortionContext.Provider>;
}

export function usePortion(): AssembledPortion {
  const p = useContext(PortionContext);
  if (!p) throw new Error('usePortion outside PortionProvider');
  return p;
}
