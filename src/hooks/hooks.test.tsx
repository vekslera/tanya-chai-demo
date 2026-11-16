import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Theme } from '../domain/theme';
import { prefersReducedMotion } from './reducedMotion';
import { easeOut, useCountUp } from './useCountUp';
import { useDocumentTheme } from './useDocumentTheme';
import { useNotice } from './useNotice';
import { usePrefersDark } from './usePrefersDark';
import { useTimeline } from './useTimeline';

const setReducedMotion = (matches: boolean) => {
  window.matchMedia = vi.fn().mockReturnValue({ matches }) as never;
};

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  vi.useRealTimers();
  // jsdom has no matchMedia of its own.
  delete (window as { matchMedia?: unknown }).matchMedia;
});

describe('prefersReducedMotion', () => {
  it('reads the media query, and is false when it cannot', () => {
    setReducedMotion(true);
    expect(prefersReducedMotion()).toBe(true);
    delete (window as { matchMedia?: unknown }).matchMedia;
    expect(prefersReducedMotion()).toBe(false);
  });
});

describe('useCountUp', () => {
  it('waits for the start, then counts to the target', () => {
    const { result, rerender } = renderHook(({ start }) => useCountUp(100, start, 900), {
      initialProps: { start: false },
    });
    expect(result.current).toBe(0);
    rerender({ start: true });
    act(() => void vi.advanceTimersByTime(1000));
    expect(result.current).toBe(100);
  });

  it('jumps to the target under reduced motion, or when it is 0', () => {
    setReducedMotion(true);
    expect(renderHook(() => useCountUp(40, true, 900)).result.current).toBe(40);
    setReducedMotion(false);
    expect(renderHook(() => useCountUp(0, true, 900)).result.current).toBe(0);
  });

  it('eases out', () => {
    expect([0, 1].map(easeOut)).toEqual([0, 1]);
    expect(easeOut(0.5)).toBeGreaterThan(0.5);
  });
});

describe('useTimeline', () => {
  it('counts the delays that have passed', () => {
    const { result, unmount } = renderHook(() => useTimeline([100, 300]));
    expect(result.current).toBe(0);
    act(() => void vi.advanceTimersByTime(150));
    expect(result.current).toBe(1);
    act(() => void vi.advanceTimersByTime(200));
    expect(result.current).toBe(2);
    unmount();
  });

  it('has every step at once under reduced motion', () => {
    setReducedMotion(true);
    expect(renderHook(() => useTimeline([100, 300])).result.current).toBe(2);
  });
});

describe('useNotice', () => {
  it('shows a note for a while, the wait starting again when asked again', () => {
    const { result } = renderHook(() => useNotice(1000));
    expect(result.current[0]).toBe(false);
    act(() => result.current[1]());
    expect(result.current[0]).toBe(true);
    act(() => void vi.advanceTimersByTime(600));
    act(() => result.current[1]());
    act(() => void vi.advanceTimersByTime(600));
    expect(result.current[0]).toBe(true);
    act(() => void vi.advanceTimersByTime(400));
    expect(result.current[0]).toBe(false);
  });
});

describe('useDocumentTheme', () => {
  it('sets the chosen look on the page, and leaves the device’s own for "auto"', () => {
    const { rerender, unmount } = renderHook(({ theme }) => useDocumentTheme(theme), {
      initialProps: { theme: 'dark' as Theme },
    });
    expect(document.documentElement.dataset.theme).toBe('dark');
    rerender({ theme: 'light' });
    expect(document.documentElement.dataset.theme).toBe('light');
    rerender({ theme: 'auto' });
    expect(document.documentElement.dataset.theme).toBeUndefined();
    unmount();
  });
});

describe('usePrefersDark', () => {
  it('follows the device’s dark mode, and is false when it cannot be told', () => {
    const listeners = new Set<() => void>();
    let matches = false;
    window.matchMedia = vi.fn(() => ({
      get matches() {
        return matches;
      },
      addEventListener: (_: string, f: () => void) => listeners.add(f),
      removeEventListener: (_: string, f: () => void) => listeners.delete(f),
    })) as never;
    const { result, unmount } = renderHook(() => usePrefersDark());
    expect(result.current).toBe(false);
    matches = true;
    act(() => listeners.forEach((f) => f()));
    expect(result.current).toBe(true);
    unmount();
    expect(listeners.size).toBe(0);
    delete (window as { matchMedia?: unknown }).matchMedia;
    expect(renderHook(() => usePrefersDark()).result.current).toBe(false);
  });
});
