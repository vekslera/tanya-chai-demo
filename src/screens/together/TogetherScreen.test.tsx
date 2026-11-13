import { act, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { memoryStorage } from '../../adapters/memoryStorage';
import { config } from '../../config';
import { startSession } from '../../domain/quizSession';
import { ROUTES } from '../../routes';
import { he } from '../../strings/he';
import { portionData } from '../../test/fixtures';
import { button, click, hash, renderApp } from '../../test/renderApp';

describe('TogetherScreen', () => {
  it('goes from the intro through each card and its question to the finish', async () => {
    await renderApp(ROUTES.together);
    expect(screen.getByText(he.together.intro)).toBeTruthy();
    await click(button(he.together.start));
    expect(screen.getByText(he.together.cardOf(1, 2))).toBeTruthy();
    expect(screen.getByText('לאבא 1')).toBeTruthy();
    expect(screen.getByText('שיחה 1')).toBeTruthy();
    await click(button('אַהֲבָה'));
    expect(screen.getByRole('dialog', { name: 'אהבה' })).toBeTruthy();
    await click(button(he.common.close));

    // After the first card, its question; back to the card, and back to the intro.
    await click(button(he.common.next));
    expect(screen.getByText(he.together.childTurn)).toBeTruthy();
    expect(screen.getByText('prompt q-child-tf')).toBeTruthy();
    await click(button(he.together.backToCard));
    expect(screen.getByText('לאבא 1')).toBeTruthy();
    await click(button(he.common.prev));
    expect(screen.getByText(he.together.intro)).toBeTruthy();

    // Starting again resumes the same question.
    await click(button(he.together.start));
    await click(button(he.common.next));
    await click(button(he.quiz.true));
    expect(screen.getByText(he.togetherQuiz.correct[0]!)).toBeTruthy();
    await click(button(he.togetherQuiz.next));
    expect(screen.getByText('לילד 2')).toBeTruthy();
    expect(screen.queryByText(he.together.talk)).toBeNull();

    // The son tries again with what his father said, then finishes.
    await click(button(he.common.next));
    await click(button('שכונה'));
    expect(screen.getByText(he.togetherQuiz.tryAgain)).toBeTruthy();
    expect(screen.getByText(he.togetherQuiz.fatherSaid)).toBeTruthy();
    expect(screen.getByText('לילד 2')).toBeTruthy();
    expect((button('שכונה') as HTMLButtonElement).disabled).toBe(true);
    await click(button('אבא אחד'));
    expect(screen.getByText(he.togetherQuiz.correct[1]!)).toBeTruthy();
    expect(
      screen.getByText(he.togetherQuiz.points(config.scoring.pointsByAttempt[1]!)),
    ).toBeTruthy();
    await click(button(he.togetherQuiz.finish));
    expect(hash()).toBe(ROUTES.done);
  });

  it('dims the English switch, which is coming soon on this path', async () => {
    vi.useFakeTimers();
    try {
      await renderApp(ROUTES.together);
      const toggle = button(he.language.label);
      expect(toggle.getAttribute('aria-disabled')).toBe('true');
      expect(screen.getByRole('status').textContent).toBe('');
      await click(toggle);
      expect(screen.getByRole('status').textContent).toBe(he.language.comingSoon);
      act(() => void vi.advanceTimersByTime(config.motion.comingSoonMs));
      expect(screen.getByRole('status').textContent).toBe('');
      // Dimmed on the cards and the questions too.
      await click(button(he.together.start));
      expect(button(he.language.label).getAttribute('aria-disabled')).toBe('true');
      await click(button(he.common.next));
      expect(button(he.language.label).getAttribute('aria-disabled')).toBe('true');
    } finally {
      vi.useRealTimers();
    }
  });

  it('shows the dedication on the cards only', async () => {
    const data = portionData();
    data.portion.dedication = { kind: 'partner', name: 'שותף' };
    const line = he.dedication.partner('שותף');
    await renderApp(ROUTES.together, { data });
    expect(screen.queryByText(line)).toBeNull();
    await click(button(he.together.start));
    expect(screen.getByText(line)).toBeTruthy();
  });

  it('names the summary question, with no father’s words beyond the cards', async () => {
    const data = portionData();
    data.portion.together = [data.portion.together[0]!];
    data.portion.questions.find((q) => q.id === 'q-child')!.summary = true;
    const quiz = { ...startSession('together', ['q-child-tf', 'q-child'], 1), index: 1 };
    const storage = memoryStorage({
      [config.storage.key]: JSON.stringify({ togetherIndex: 2, quiz }),
    });
    await renderApp(ROUTES.together, { data, storage });
    expect(screen.getByText(he.togetherQuiz.summary)).toBeTruthy();
    await click(button('שכונה'));
    expect(screen.queryByText(he.togetherQuiz.fatherSaid)).toBeNull();
  });
});
