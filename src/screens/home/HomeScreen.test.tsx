import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { config } from '../../config';
import { ROUTES } from '../../routes';
import { he } from '../../strings/he';
import { button, click, hash, renderApp } from '../../test/renderApp';

describe('HomeScreen', () => {
  it('shows the portion, the time and the streak', async () => {
    await renderApp(ROUTES.home);
    expect(screen.getByText('שיעור לבדיקה')).toBeTruthy();
    expect(screen.getByText(he.home.estimatedTime(config.demo.estimatedMinutes))).toBeTruthy();
    expect(screen.getByText(he.home.streak(config.demo.initialProgress.streak))).toBeTruthy();
  });

  it.each([
    [he.home.start, ROUTES.level],
    [he.home.together, ROUTES.together],
    [he.home.about, ROUTES.about],
  ])('"%s" goes to %s', async (label, route) => {
    await renderApp(ROUTES.home);
    await click(button(label));
    expect(hash()).toBe(route);
  });
});
