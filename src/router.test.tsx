import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { currentRoute, navigate, redirectFrom, useRoute } from './router';
import { ROUTES, trackRoute } from './routes';

beforeEach(() => window.history.replaceState(null, '', '#/'));

describe('router', () => {
  it('reads the route from the hash; anything unknown is home', () => {
    window.history.replaceState(null, '', '#/read');
    expect(currentRoute()).toBe(ROUTES.read);
    window.history.replaceState(null, '', '#/nowhere');
    expect(currentRoute()).toBe(ROUTES.home);
    window.history.replaceState(null, '', '#');
    expect(currentRoute()).toBe(ROUTES.home);
  });

  it('navigates by pushing or replacing the hash', () => {
    navigate(ROUTES.about);
    expect(window.location.hash).toBe('#/about');
    const length = window.history.length;
    navigate(ROUTES.level, { replace: true });
    expect(window.location.hash).toBe('#/level');
    expect(window.history.length).toBe(length);
  });

  it('redirects only while the screen is still current', () => {
    navigate(ROUTES.done, { replace: true });
    redirectFrom(ROUTES.read, ROUTES.level);
    expect(currentRoute()).toBe(ROUTES.done);
    redirectFrom(ROUTES.done, ROUTES.home);
    expect(currentRoute()).toBe(ROUTES.home);
  });

  it('names the screen of each track', () => {
    expect(trackRoute('solo')).toBe(ROUTES.read);
    expect(trackRoute('together')).toBe(ROUTES.together);
  });
});

function Where() {
  return <p>{useRoute()}</p>;
}

describe('useRoute', () => {
  it('follows hash changes', async () => {
    const { unmount } = render(<Where />);
    expect(screen.getByText('/')).toBeTruthy();
    await act(async () => navigate(ROUTES.read, { replace: true }));
    expect(screen.getByText('/read')).toBeTruthy();
    unmount();
  });
});
