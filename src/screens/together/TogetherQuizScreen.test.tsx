import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { memoryStorage } from '../../adapters/memoryStorage';
import { config } from '../../config';
import { startSession } from '../../domain/quizSession';
import { ROUTES } from '../../routes';
import { he } from '../../strings/he';
import { portionData } from '../../test/fixtures';
import { button, click, hash, renderApp } from '../../test/renderApp';

const withQuiz = () =>
  memoryStorage({
    [config.storage.key]: JSON.stringify({
      quiz: startSession('together', undefined, ['q-child', 'q-child-tf'], 1),
    }),
  });

describe('TogetherQuizScreen', () => {
  it('leaves for Avos uBanim without a quiz', async () => {
    await renderApp(ROUTES.togetherQuiz);
    expect(hash()).toBe(ROUTES.together);
  });

  it('lets the son try again, with what his father said', async () => {
    await renderApp(ROUTES.togetherQuiz, { storage: withQuiz() });
    await click(button('שכונה'));
    expect(screen.getByText(he.togetherQuiz.tryAgain)).toBeTruthy();
    expect(screen.getByText(he.togetherQuiz.fatherSaid)).toBeTruthy();
    expect(screen.getByText('לילד 2')).toBeTruthy();
    expect((button('שכונה') as HTMLButtonElement).disabled).toBe(true);
    await click(button('אבא אחד'));
    expect(screen.getByText(he.togetherQuiz.correct[0]!)).toBeTruthy();
    expect(
      screen.getByText(he.togetherQuiz.points(config.scoring.pointsByAttempt[1]!)),
    ).toBeTruthy();
    await click(button(he.togetherQuiz.next));
    await click(button(he.quiz.true));
    await click(button(he.togetherQuiz.finish));
    expect(hash()).toBe(ROUTES.done);
  });

  it('shows no father’s words for a unit outside the cards', async () => {
    const data = portionData();
    data.portion.together = [data.portion.together[0]!];
    await renderApp(ROUTES.togetherQuiz, { storage: withQuiz(), data });
    await click(button('שכונה'));
    expect(screen.queryByText(he.togetherQuiz.fatherSaid)).toBeNull();
  });
});
