import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { config } from '../../config';
import { ROUTES } from '../../routes';
import { he } from '../../strings/he';
import { button, click, hash, renderApp } from '../../test/renderApp';

describe('LevelScreen', () => {
  it('lists every configured level and marks the last choice', async () => {
    await renderApp(ROUTES.level);
    for (const { id } of config.levels)
      expect(button(new RegExp(he.level.options[id]!.title))).toBeTruthy();
    expect(screen.getAllByText(he.level.selected)).toHaveLength(1);
  });

  it('saves the choice and opens the text', async () => {
    const { storage } = await renderApp(ROUTES.level);
    await click(button(new RegExp(he.level.options[1]!.title)));
    expect(hash()).toBe(ROUTES.read);
    expect(JSON.parse(storage.get(config.storage.key)!).level).toBe(1);
  });
});
