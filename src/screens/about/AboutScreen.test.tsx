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
    expect(screen.getAllByRole('link')).toHaveLength(2);
    // The contact details: the email opens a message.
    const email = screen.getByRole('link', { name: he.about.contact.email });
    expect(email.getAttribute('href')).toBe(`mailto:${he.about.contact.email}`);
    expect(screen.getByText(he.about.contact.phone)).toBeTruthy();
    expect(screen.getByText(he.about.contentCredit)).toBeTruthy();
  });

  it('marks a development build with unreviewed content as a draft', async () => {
    const { unmount } = await renderScreen(ROUTES.about, <AboutScreen strict={false} />);
    expect(screen.getByText(he.about.draft)).toBeTruthy();
    expect(screen.getByText(he.about.draftNote(39))).toBeTruthy();
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

  it('chooses the look, the device’s own by default, and keeps it on starting over', async () => {
    const { storage } = await renderApp(ROUTES.about);
    const option = (theme: 'auto' | 'light' | 'dark') =>
      screen.getByRole('radio', { name: he.about.themes[theme] });
    expect(option('auto').getAttribute('aria-checked')).toBe('true');
    expect(document.documentElement.dataset.theme).toBeUndefined();
    await click(option('dark'));
    expect(option('dark').getAttribute('aria-checked')).toBe('true');
    expect(document.documentElement.dataset.theme).toBe('dark');
    await click(button(he.about.reset));
    await click(button(he.about.resetYes));
    expect(JSON.parse(storage.get(config.storage.key)!).theme).toBe('dark');
    await click(option('auto'));
    expect(document.documentElement.dataset.theme).toBeUndefined();
  });
});
