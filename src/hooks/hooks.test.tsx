import { act, render, renderHook, screen } from '@testing-library/react';
import { useRef } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { prefersReducedMotion } from './reducedMotion';
import { easeOut, useCountUp } from './useCountUp';
import { useElapsed } from './useElapsed';
import { useSeen } from './useSeen';
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

describe('useElapsed', () => {
  it('turns true after the time', () => {
    const { result } = renderHook(() => useElapsed(500));
    expect(result.current).toBe(false);
    act(() => void vi.advanceTimersByTime(500));
    expect(result.current).toBe(true);
  });
});

function Seen({ ids }: { ids: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useSeen(ref, ids, '0px', [ids]);
  return (
    <div ref={ref}>
      {ids.map((id) => (
        <p key={id} data-unit={id} />
      ))}
      <output>{[...seen].join(',')}</output>
    </div>
  );
}

describe('useSeen', () => {
  it('counts every unit as seen without IntersectionObserver', () => {
    render(<Seen ids={['a', 'b']} />);
    expect(screen.getByRole('status').textContent).toBe('a,b');
  });

  it('adds the units that come into view, once each', () => {
    let callback!: IntersectionObserverCallback;
    const observe = vi.fn();
    const unobserve = vi.fn();
    const disconnect = vi.fn();
    window.IntersectionObserver = vi.fn(function (this: unknown, cb: IntersectionObserverCallback) {
      callback = cb;
      return { observe, unobserve, disconnect };
    }) as never;
    const { unmount } = render(<Seen ids={['a', 'b']} />);
    expect(observe).toHaveBeenCalledTimes(2);
    const [a, b] = [...document.querySelectorAll('[data-unit]')];
    act(() =>
      callback(
        [
          { isIntersecting: true, target: a },
          { isIntersecting: false, target: b },
        ] as never,
        {} as never,
      ),
    );
    act(() => callback([{ isIntersecting: false, target: b }] as never, {} as never));
    expect(screen.getByRole('status').textContent).toBe('a');
    expect(unobserve).toHaveBeenCalledWith(a);
    unmount();
    expect(disconnect).toHaveBeenCalled();
    delete (window as { IntersectionObserver?: unknown }).IntersectionObserver;
  });
});
