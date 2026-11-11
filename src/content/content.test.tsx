import { act, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { bundledContentSource, bundledTextSource } from '../adapters/bundledSources';
import { ErrorBoundary } from '../components/ErrorBoundary';
import type { AssembledPortion } from '../domain/portion';
import { portionData } from '../test/fixtures';
import { fixtureSources } from '../test/renderApp';
import { config } from '../config';
import { he } from '../strings/he';
import { loadPortion } from './loadPortion';
import { PortionProvider, usePortion } from './PortionProvider';

describe('loadPortion', () => {
  it('assembles the portion from any sources', async () => {
    const { text, content } = fixtureSources();
    const units = vi.spyOn(text, 'units');
    const p = await loadPortion(text, content, config.language);
    expect(p.units).toHaveLength(4);
    expect(units).toHaveBeenCalledWith({ part: 'LA', chapter: 1 });
  });

  it('assembles the demo portion from the bundled files', async () => {
    const p = await loadPortion(bundledTextSource(), bundledContentSource(), config.language);
    expect(p.units[0]!.id).toBe('LA.32.001');
    // The app's language's ביאור, for every unit of the portion.
    expect(p.units.every((u) => /[א-ת]/.test(u.biur?.value ?? ''))).toBe(true);
    expect(p.paragraphs.every((x) => x.translation)).toBe(true);
  });
});

function Label() {
  return <p>{usePortion().portion.label.he}</p>;
}

describe('PortionProvider', () => {
  it('shows nothing until loaded, then provides the portion', async () => {
    let resolve!: (p: AssembledPortion) => void;
    const load = () => new Promise<AssembledPortion>((r) => (resolve = r));
    const { container } = render(
      <PortionProvider load={load}>
        <Label />
      </PortionProvider>,
    );
    expect(container.textContent).toBe('');
    const { text, content } = fixtureSources();
    const portion = await loadPortion(text, content, config.language);
    await act(async () => resolve(portion));
    expect(screen.getByText(portionData().portion.label.he)).toBeTruthy();
  });

  it('passes a loading error to the error boundary', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <PortionProvider load={() => Promise.reject(new Error('offline'))}>
          <Label />
        </PortionProvider>
      </ErrorBoundary>,
    );
    await act(async () => {});
    expect(screen.getByText(he.error.title)).toBeTruthy();
    vi.restoreAllMocks();
  });

  it('ignores a load that finishes after unmounting', async () => {
    let resolve!: (p: AssembledPortion) => void;
    const { unmount } = render(
      <PortionProvider load={() => new Promise((r) => (resolve = r))}>
        <Label />
      </PortionProvider>,
    );
    unmount();
    await act(async () => resolve({} as AssembledPortion));
  });

  it('requires a provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Label />)).toThrow('usePortion outside PortionProvider');
    vi.restoreAllMocks();
  });
});
