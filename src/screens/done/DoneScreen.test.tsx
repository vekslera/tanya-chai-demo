import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { memoryStorage } from '../../adapters/memoryStorage';
import { config } from '../../config';
import { complete } from '../../domain/progress';
import { ROUTES } from '../../routes';
import { initialStateFrom } from '../../store/state';
import { he } from '../../strings/he';
import { button, click, hash, reducedMotion, renderApp } from '../../test/renderApp';
import { DoneActions } from './DoneActions';

const start = initialStateFrom(config);

function afterCompleting(track: 'solo' | 'together', twice = false) {
  let { progress, completion } = complete(start, track, 15, config.scoring);
  if (twice) completion = complete(progress, track, 15, config.scoring).completion;
  progress = completion.after;
  return memoryStorage({
    [config.storage.key]: JSON.stringify({ ...progress, lastCompletion: completion }),
  });
}

afterEach(() => {
  vi.useRealTimers();
  delete (window as { matchMedia?: unknown }).matchMedia;
});

describe('DoneScreen', () => {
  it('goes home without a completion', async () => {
    await renderApp(ROUTES.done);
    expect(hash()).toBe(ROUTES.home);
  });

  it('runs its timeline: the streak ticks over and the points count up', async () => {
    vi.useFakeTimers();
    await renderApp(ROUTES.done, { storage: afterCompleting('solo') });
    expect(screen.getByText(he.done.headline)).toBeTruthy();
    expect(document.querySelector('.done-streak-number')!.textContent).toBe(String(start.streak));
    await act(async () => void vi.advanceTimersByTime(5000));
    // The count-up starts once the points step has rendered.
    await act(async () => void vi.advanceTimersByTime(config.motion.countUpMs + 100));
    expect(document.querySelector('.done-streak-number.pulse')!.textContent).toBe(
      String(start.streak + 1),
    );
    expect(screen.getByText(`+${15 + config.scoring.completionBonus}`)).toBeTruthy();
    expect(screen.getByText(he.done.pointsDetail(15, config.scoring.completionBonus))).toBeTruthy();
    expect(document.querySelector('.heartmark-purify')).toBeTruthy();
  });

  it('shows the community counter as demo data', async () => {
    reducedMotion(true);
    await renderApp(ROUTES.done, { storage: afterCompleting('solo') });
    const n = config.demo.communityLessons.toLocaleString(config.format.numberLocale);
    expect(screen.getByText(n)).toBeTruthy();
    expect(screen.getByText(he.common.demoData)).toBeTruthy();
  });

  it('explains when nothing was added', async () => {
    reducedMotion(true);
    const { unmount } = await renderApp(ROUTES.done, { storage: afterCompleting('solo', true) });
    expect(screen.getByText(he.done.pointsAlready)).toBeTruthy();
    unmount();
    await renderApp(ROUTES.done, { storage: afterCompleting('together', true) });
    expect(screen.getByText(he.done.pointsAlreadyTogether)).toBeTruthy();
  });

  it('shows the family streak after Avos uBanim, and goes home', async () => {
    reducedMotion(true);
    await renderApp(ROUTES.done, { storage: afterCompleting('together') });
    expect(screen.getByText(he.done.headlineTogether)).toBeTruthy();
    expect(screen.getByText(he.done.familyStreakLabel)).toBeTruthy();
    await click(button(he.done.home));
    expect(hash()).toBe(ROUTES.home);
  });

  it.each([
    [he.done.together, ROUTES.together],
    [he.done.home, ROUTES.home],
    [he.done.about, ROUTES.about],
  ])('"%s" goes to %s', async (label, route) => {
    reducedMotion(true);
    await renderApp(ROUTES.done, { storage: afterCompleting('solo') });
    await click(button(label));
    expect(hash()).toBe(route);
  });
});

describe('DoneActions', () => {
  it('offers Shinun when the feature is on', async () => {
    render(<DoneActions together={false} shinun />);
    await click(button(he.done.shinun));
    expect(hash()).toBe(ROUTES.shinun);
  });
});
