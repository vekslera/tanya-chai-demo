import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type Dispatch,
  type ReactNode,
} from 'react';
import type { Persistence } from './persistence';
import type { Action, DemoState, Reducer } from './state';

export type StoreDeps = { reducer: Reducer; persistence: Persistence };

const StoreContext = createContext<{ state: DemoState; dispatch: Dispatch<Action> } | null>(null);

export function StoreProvider({
  reducer,
  persistence,
  children,
}: StoreDeps & { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, persistence.load);
  useEffect(() => {
    persistence.save(state);
  }, [state, persistence]);
  return <StoreContext.Provider value={{ state, dispatch }}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore outside StoreProvider');
  return ctx;
}
