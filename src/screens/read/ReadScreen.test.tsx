import { act, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { memoryStorage } from '../../adapters/memoryStorage';
import { config } from '../../config';
import { startSession } from '../../domain/quizSession';
import { ROUTES } from '../../routes';
import { he } from '../../strings/he';
import { portionData } from '../../test/fixtures';
import { button, click, hash, renderApp } from '../../test/renderApp';

const atLevel = (level: number) =>
  memoryStorage({ [config.storage.key]: JSON.stringify({ level }) });

afterEach(() => {
  vi.useRealTimers();
  delete (window as { IntersectionObserver?: unknown }).IntersectionObserver;
});

describe('ReadScreen', () => {
  it('shows the ביאור on level 2 only', async () => {
    const { unmount } = await renderApp(ROUTES.read, { storage: atLevel(2) });
    expect(screen.getByText('ביאור ראשון')).toBeTruthy();
    unmount();
    await renderApp(ROUTES.read, { storage: atLevel(1) });
    expect(screen.queryByText('ביאור ראשון')).toBeNull();
  });

  it('shows the English of a paragraph, and its footnote', async () => {
    await renderApp(ROUTES.read);
    await click(screen.getAllByRole('button', { name: he.read.englishShow })[0]!);
    expect(screen.getByText(/Love/)).toBeTruthy();
    await click(button(he.read.footnote('1')));
    expect(screen.getByRole('dialog', { name: he.read.footnote('1') })).toBeTruthy();
    expect(screen.getByText('A note.')).toBeTruthy();
    await click(button(he.common.close));
    expect(screen.queryByRole('dialog')).toBeNull();
    await click(button(he.read.englishHide));
    expect(screen.queryByText(/Love/)).toBeNull();
  });

  it('shows or hides all the English from the menu', async () => {
    await renderApp(ROUTES.read);
    await click(button(he.common.menu));
    await click(screen.getByRole('menuitem', { name: he.read.englishAllShow }));
    expect(screen.getByText('Brothers.')).toBeTruthy();
    await click(button(he.common.menu));
    await click(screen.getByRole('menuitem', { name: he.read.englishAllHide }));
    expect(screen.queryByText('Brothers.')).toBeNull();
    await click(button(he.common.menu));
    await click(document.querySelector('.menu-scrim')!);
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('has no menu without English', async () => {
    const data = portionData();
    data.translations = [];
    await renderApp(ROUTES.read, { data });
    expect(screen.queryByRole('button', { name: he.common.menu })).toBeNull();
  });

  it('opens a glossary term', async () => {
    await renderApp(ROUTES.read);
    await click(button('אַהֲבָה'));
    expect(screen.getByRole('dialog', { name: 'אהבה' })).toBeTruthy();
    await click(button(he.common.close));
  });

  it('opens the questions once the reading time has passed', async () => {
    vi.useFakeTimers();
    // An observer that never reports: only the time unlocks.
    window.IntersectionObserver = vi.fn(function () {
      return { observe() {}, unobserve() {}, disconnect() {} };
    }) as never;
    await renderApp(ROUTES.read);
    const toQuestions = button(he.read.toQuestions) as HTMLButtonElement;
    expect(toQuestions.disabled).toBe(true);
    await act(async () => void vi.advanceTimersByTime(config.read.unlockAfterMs));
    expect(toQuestions.disabled).toBe(false);
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('0');
  });

  it('starts the quiz of the chosen level, and resumes it', async () => {
    const { storage } = await renderApp(ROUTES.read, { storage: atLevel(1) });
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('100');
    await click(button(he.read.toQuestions));
    expect(hash()).toBe(ROUTES.quiz);
    const saved = JSON.parse(storage.get(config.storage.key)!);
    expect(saved.quiz.questionIds).toEqual(['q-choice', 'q-find', 'q-tf']);
  });

  it('resumes a quiz in progress for the same level', async () => {
    const quiz = { ...startSession('solo', 1, ['q-choice', 'q-tf'], 1), index: 1 };
    const storage = memoryStorage({ [config.storage.key]: JSON.stringify({ level: 1, quiz }) });
    await renderApp(ROUTES.read, { storage });
    await click(button(he.read.toQuestions));
    expect(JSON.parse(storage.get(config.storage.key)!).quiz.index).toBe(1);
  });
});
