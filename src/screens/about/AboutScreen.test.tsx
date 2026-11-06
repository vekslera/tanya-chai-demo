import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { memoryStorage } from '../../adapters/memoryStorage';
import { config } from '../../config';
import { ROUTES } from '../../routes';
import { he } from '../../strings/he';
import { button, click, renderApp, renderScreen } from '../../test/renderApp';
import { AboutScreen } from './AboutScreen';

describe('AboutScreen', () => {
  it('shows the sources, with a license link where there is one', async () => {
    await renderApp(ROUTES.about);
    const link = screen.getByRole('link', { name: he.about.licenseLink });
    expect(link.getAttribute('href')).toBe('https://example.org/license');
    expect(screen.getAllByRole('link')).toHaveLength(1);
    expect(screen.getByText(he.about.contentCredit)).toBeTruthy();
  });

  it('marks a development build with unreviewed content as a draft', async () => {
    const { unmount } = await renderScreen(ROUTES.about, <AboutScreen strict={false} />);
    expect(screen.getByText(he.about.draft)).toBeTruthy();
    expect(screen.getByText(he.about.draftNote(26))).toBeTruthy();
    unmount();
    await renderScreen(ROUTES.about, <AboutScreen strict />);
    expect(screen.queryByText(he.about.draft)).toBeNull();
  });

  it('starts over after a confirmation', async () => {
    const storage = memoryStorage({ [config.storage.key]: JSON.stringify({ points: 9999 }) });
    await renderApp(ROUTES.about, { storage });
    await click(button(he.about.reset));
    await click(button(he.about.resetNo));
    expect(JSON.parse(storage.get(config.storage.key)!).points).toBe(9999);
    await click(button(he.about.reset));
    expect(screen.getByText(he.about.resetConfirm)).toBeTruthy();
    await click(button(he.about.resetYes));
    expect(screen.getByText(he.about.resetDone)).toBeTruthy();
    expect(JSON.parse(storage.get(config.storage.key)!).points).toBe(
      config.demo.initialProgress.points,
    );
    await click(button(he.about.reset));
    expect(screen.queryByText(he.about.resetDone)).toBeNull();
  });
});
