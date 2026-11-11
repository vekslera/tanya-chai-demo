// Hash routing (SPEC §3.2): GitHub Pages needs no SPA fallback, and the back button works.
import { useEffect, useState } from 'react';
import { ROUTES, type Route } from './routes';

const ALL: readonly string[] = Object.values(ROUTES);

export function currentRoute(): Route {
  const path = window.location.hash.replace(/^#/, '') || ROUTES.home;
  return ALL.includes(path) ? (path as Route) : ROUTES.home;
}

export function navigate(to: Route, { replace = false } = {}) {
  if (replace) {
    window.history.replaceState(null, '', `#${to}`);
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
  if (currentRoute() === from) navigate(to, { replace: true });
}

export function useRoute(): Route {
  const [route, setRoute] = useState(currentRoute);
  useEffect(() => {
    const onChange = () => setRoute(currentRoute());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}
