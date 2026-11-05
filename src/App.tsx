import { ErrorBoundary } from './components/ErrorBoundary';
import type { AppDeps } from './composition';
import { PortionProvider } from './content/PortionProvider';
import { Screens } from './Screens';
import { StoreProvider } from './store/StoreProvider';

/** The app, given its dependencies by the composition root (src/main.tsx) or by a test. */
export function App({ deps }: { deps: AppDeps }) {
  return (
    <ErrorBoundary>
      <StoreProvider {...deps.store}>
        <PortionProvider load={deps.loadPortion}>
          <Screens />
        </PortionProvider>
      </StoreProvider>
    </ErrorBoundary>
  );
}
