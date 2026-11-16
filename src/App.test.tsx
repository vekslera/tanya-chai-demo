import { act, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ROUTES, type Route } from './routes';
import { screensFor } from './Screens';
import { ShinunScreen } from './screens/shinun/ShinunScreen';
import { he } from './strings/he';
import { goTo, renderApp } from './test/renderApp';

describe('Screens', () => {
  it('shows home for an unknown route, and follows navigation', async () => {
    await renderApp('/nowhere' as Route);
    expect(screen.getByText(he.home.start)).toBeTruthy();
    await goTo(ROUTES.about);
    expect(screen.getByText(he.about.title)).toBeTruthy();
    // With the feature off, the Shinun route shows home.
    await goTo(ROUTES.shinun);
    expect(screen.getByText(he.home.start)).toBeTruthy();
  });

  it('has a Shinun route only with the feature on', () => {
    expect(screensFor(false)[ROUTES.shinun]).toBeUndefined();
    expect(screensFor(true)[ROUTES.shinun]).toBe(ShinunScreen);
  });
});

describe('main', () => {
  it('renders the app into #root with the browser adapters', async () => {
    document.body.innerHTML = '<div id="root"></div>';
    window.history.replaceState(null, '', '#/');
    let main!: typeof import('./main');
    await act(async () => {
      main = await import('./main');
    });
    await act(async () => {});
    expect(document.getElementById('root')!.textContent).toContain(he.home.start);
    // Nothing may render once the test environment is gone.
    act(() => main.root.unmount());
  });
});
