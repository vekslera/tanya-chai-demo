import { useEffect, type ComponentType } from 'react';
import { SHINUN_ENABLED } from './features';
import { useRoute } from './router';
import { ROUTES, type Route } from './routes';
import { AboutScreen } from './screens/about/AboutScreen';
import { DoneScreen } from './screens/done/DoneScreen';
import { HomeScreen } from './screens/home/HomeScreen';
import { LevelScreen } from './screens/level/LevelScreen';
import { QuizScreen } from './screens/quiz/QuizScreen';
import { ReadScreen } from './screens/read/ReadScreen';
import { ShinunScreen } from './screens/shinun/ShinunScreen';
import { TogetherQuizScreen } from './screens/together/TogetherQuizScreen';
import { TogetherScreen } from './screens/together/TogetherScreen';

/** The screen of each route. With the Shinun flag off its route does not exist. */
export function screensFor(shinun: boolean): Partial<Record<Route, ComponentType>> {
  return {
    [ROUTES.home]: HomeScreen,
    [ROUTES.level]: LevelScreen,
    [ROUTES.read]: ReadScreen,
    [ROUTES.quiz]: QuizScreen,
    [ROUTES.done]: DoneScreen,
    [ROUTES.together]: TogetherScreen,
    [ROUTES.togetherQuiz]: TogetherQuizScreen,
    [ROUTES.about]: AboutScreen,
    ...(shinun ? { [ROUTES.shinun]: ShinunScreen } : {}),
  };
}

const SCREENS = screensFor(SHINUN_ENABLED);

/** The current route's screen, scrolled to the top; an unknown route shows Home. */
export function Screens() {
  const route = useRoute();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route]);
  const Screen = SCREENS[route] ?? HomeScreen;
  return <Screen key={route} />;
}
