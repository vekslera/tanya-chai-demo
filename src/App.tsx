import { useEffect } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PortionProvider } from './content/PortionContext';
import { useRoute, type Route } from './router';
import { StoreProvider } from './store/store';
import { HomeScreen } from './screens/Home';
import { LevelScreen } from './screens/Level';
import { ReadScreen } from './screens/Read';
import { QuizScreen } from './screens/Quiz';
import { DoneScreen } from './screens/Done';
import { TogetherScreen } from './screens/Together';
import { TogetherQuizScreen } from './screens/TogetherQuiz';
import { AboutScreen } from './screens/About';
import { ShinunScreen } from './screens/Shinun';
import { SHINUN_ENABLED } from './features';

const SCREENS: Partial<Record<Route, () => JSX.Element | null>> = {
  // With the flag off the route does not exist and falls back to Home.
  ...(SHINUN_ENABLED ? { '/shinun': ShinunScreen } : {}),
  '/': HomeScreen,
  '/level': LevelScreen,
  '/read': ReadScreen,
  '/quiz': QuizScreen,
  '/done': DoneScreen,
  '/together': TogetherScreen,
  '/together/quiz': TogetherQuizScreen,
  '/about': AboutScreen,
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
