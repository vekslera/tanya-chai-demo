import { describe, expect, it } from 'vitest';
import { otherTheme, shownTheme } from './theme';

describe('theme', () => {
  it('shows the choice, or the device’s own mode', () => {
    expect([shownTheme('auto', false), shownTheme('auto', true)]).toEqual(['light', 'dark']);
    expect([shownTheme('light', true), shownTheme('dark', false)]).toEqual(['light', 'dark']);
  });

  it('switches to the other look, back to "auto" at the device’s own mode', () => {
    expect(otherTheme('auto', false)).toBe('dark');
    expect(otherTheme('dark', false)).toBe('auto');
    expect(otherTheme('auto', true)).toBe('light');
    expect(otherTheme('light', true)).toBe('auto');
    expect(otherTheme('light', false)).toBe('dark');
  });
});
