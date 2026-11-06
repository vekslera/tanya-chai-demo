import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { memoryStorage } from '../../adapters/memoryStorage';
import { config } from '../../config';
import { ROUTES } from '../../routes';
import { he } from '../../strings/he';
import { button, click, hash, renderApp } from '../../test/renderApp';

describe('TogetherScreen', () => {
  it('goes from the intro through the cards to the son’s turn and back', async () => {
    await renderApp(ROUTES.together);
    expect(screen.getByText(he.together.intro)).toBeTruthy();
    await click(button(he.together.start));
    expect(screen.getByText(he.together.cardOf(1, 2))).toBeTruthy();
    expect(screen.getByText('לאבא 1')).toBeTruthy();
    expect(screen.getByText('שיחה 1')).toBeTruthy();
    await click(button('אַהֲבָה'));
    expect(screen.getByRole('dialog', { name: 'אהבה' })).toBeTruthy();
    await click(button(he.common.close));
    await click(button(he.common.next));
    expect(screen.getByText('לילד 2')).toBeTruthy();
    expect(screen.queryByText(he.together.talk)).toBeNull();
    await click(button(he.common.next));
    expect(screen.getByText(he.together.childTurn)).toBeTruthy();
    await click(button(he.together.backToCards));
    expect(screen.getByText(he.together.cardOf(2, 2))).toBeTruthy();
    await click(button(he.common.prev));
    await click(button(he.common.prev));
    expect(screen.getByText(he.together.intro)).toBeTruthy();
  });

  it('starts the son’s questions', async () => {
    const storage = memoryStorage({ [config.storage.key]: JSON.stringify({ togetherIndex: 2 }) });
    await renderApp(ROUTES.together, { storage });
    await click(button(he.together.toChildQuestions));
    expect(hash()).toBe(ROUTES.togetherQuiz);
    expect(screen.getByText('prompt q-child')).toBeTruthy();
  });
});
