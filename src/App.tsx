import type { ReactNode } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import type { AppDeps } from './composition';
import { PortionProvider } from './content/PortionProvider';
import { Screens } from './Screens';
import { StoreProvider } from './store/StoreProvider';

/** The providers every screen needs, given the app's dependencies. */
export function AppProviders({ deps, children }: { deps: AppDeps; children: ReactNode }) {
  return (
    <ErrorBoundary>
      <StoreProvider {...deps.store}>
        <PortionProvider load={deps.loadPortion}>{children}</PortionProvider>
      </StoreProvider>
    </ErrorBoundary>
  );
}

/** The app, given its dependencies by the composition root (src/main.tsx) or by a test. */
export function App({ deps }: { deps: AppDeps }) {
  return (
    <AppProviders deps={deps}>
      <Screens />
    </AppProviders>
  );
}
