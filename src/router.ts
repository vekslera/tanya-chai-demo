// Hash routing (SPEC §3.2): GitHub Pages needs no SPA fallback, and the back button works.
import { useEffect, useState } from 'react';

export type Route =
  | '/'
  | '/level'
  | '/read'
  | '/quiz'
  | '/done'
  | '/together'
  | '/together/quiz'
  | '/shinun'
  | '/about';

const ROUTES: Route[] = [
  '/',
  '/level',
  '/read',
  '/quiz',
  '/done',
  '/together',
  '/together/quiz',
  '/shinun',
  '/about',
];

function current(): Route {
  const path = window.location.hash.replace(/^#/, '') || '/';
  return (ROUTES as string[]).includes(path) ? (path as Route) : '/';
}

export function navigate(to: Route, { replace = false } = {}) {
  const hash = `#${to}`;
  if (replace) {
    window.history.replaceState(null, '', hash);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  } else {
    window.location.hash = to;
  }
}

/**
 * Leaves a screen that has nothing to show, but only while it is still the current route: a screen
 * that just navigated away (e.g. the quiz after completing) must not redirect.
 */
export function redirectFrom(from: Route, to: Route) {
  if (current() === from) navigate(to, { replace: true });
}

export function useRoute(): Route {
  const [route, setRoute] = useState(current);
  useEffect(() => {
    const onChange = () => setRoute(current());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}
