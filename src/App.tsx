import { useEffect } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PortionProvider } from './content/PortionContext';
import { useRoute, type Route } from './router';
import { StoreProvider } from './store/store';
import { HomeScreen } from './screens/Home';
import { LevelScreen } from './screens/Level';
import { ReadScreen } from './screens/Read';
import { QuizScreen } from './screens/Quiz';

const SCREENS: Partial<Record<Route, () => JSX.Element | null>> = {
  '/': HomeScreen,
  '/level': LevelScreen,
  '/read': ReadScreen,
  '/quiz': QuizScreen,
};

function Screens() {
  const route = useRoute();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route]);
  const Screen = SCREENS[route] ?? HomeScreen;
  return <Screen key={route} />;
}

export function App() {
  return (
    <ErrorBoundary>
      <StoreProvider>
        <PortionProvider>
          <Screens />
        </PortionProvider>
      </StoreProvider>
    </ErrorBoundary>
  );
}
