import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { memoryStorage } from '../../adapters/memoryStorage';
import { config } from '../../config';
import { ROUTES } from '../../routes';
import { he } from '../../strings/he';
import { portionData } from '../../test/fixtures';
import { button, click, hash, renderScreen } from '../../test/renderApp';
import { ShinunScreen } from './ShinunScreen';

describe('ShinunScreen', () => {
  it('hides words round by round, with first-letter cues in the last round', async () => {
    const storage = memoryStorage();
    await renderScreen(ROUTES.shinun, <ShinunScreen />, { storage });
    expect(screen.getByText(he.shinun.roundZero)).toBeTruthy();
    expect(screen.queryByRole('button', { name: he.shinun.hiddenWord })).toBeNull();

    await click(button(he.shinun.success));
    expect(screen.getByText(he.shinun.round(1, 2))).toBeTruthy();
    await click(button(he.shinun.hiddenWord));
    expect(screen.queryByRole('button', { name: he.shinun.hiddenWord })).toBeNull();
    await click(button(he.shinun.again));
    expect(screen.getAllByRole('button', { name: he.shinun.hiddenWord })).toHaveLength(1);

    await click(button(he.shinun.success));
    const cues = screen.getAllByRole('button', { name: he.shinun.hiddenWord });
    expect(cues.map((c) => c.textContent)).toEqual(['אַ', 'מַ']);

    await click(button(he.shinun.success));
    expect(screen.getByText(he.shinun.finishedTitle)).toBeTruthy();
    expect(JSON.parse(storage.get(config.storage.key)!).seenShinun).toBe(true);
    await click(button(he.shinun.home));
    expect(hash()).toBe(ROUTES.home);
  });

  it('shows nothing without a Shinun sentence', async () => {
    const data = portionData();
    delete data.portion.shinun;
    const { container } = await renderScreen(ROUTES.shinun, <ShinunScreen />, { data });
    expect(container.textContent).toBe('');
  });
});
