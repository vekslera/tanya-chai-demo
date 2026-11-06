// Renders the app, or one screen, over in-memory adapters: the fixture portion and memory storage.
import { act, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { vi } from 'vitest';
import { App, AppProviders } from '../App';
import { memoryStorage } from '../adapters/memoryStorage';
import { createDeps, type Adapters } from '../composition';
import { config } from '../config';
import type { PortionData } from '../domain/portion';
import type { LearningContentSource, TextSource } from '../ports';
import type { Route } from '../routes';
import { portionData } from './fixtures';

export function fixtureSources(data: PortionData = portionData()) {
  const text: TextSource = {
    units: async () => data.units,
    translations: async () => data.translations,
  };
  const content: LearningContentSource = {
    schedule: async () => data.schedule,
    portion: async () => data.portion,
    unitContent: async () => data.unitContent,
    glossary: async () => data.glossary,
  };
  return { text, content };
}

type Options = { data?: PortionData; storage?: Adapters['storage'] };

async function mount(
  route: Route,
  node: (deps: ReturnType<typeof createDeps>) => ReactNode,
  o: Options,
) {
  const storage = o.storage ?? memoryStorage();
  window.history.replaceState(null, '', `#${route}`);
  const deps = createDeps({ ...fixtureSources(o.data), storage }, config);
  const utils = render(node(deps));
  await act(async () => {});
  return { ...utils, storage };
}

/** Renders the app at `route` and waits until the portion has loaded. */
export const renderApp = (route: Route, o: Options = {}) =>
  mount(route, (deps) => <App deps={deps} />, o);

/** Renders one screen within the app's providers, at `route`. */
export const renderScreen = (route: Route, screenNode: ReactNode, o: Options = {}) =>
  mount(route, (deps) => <AppProviders deps={deps}>{screenNode}</AppProviders>, o);

/** Navigates by hash, as a link or the back button would. */
export async function goTo(route: Route) {
  await act(async () => {
    window.location.hash = route;
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  });
}

export const hash = () => window.location.hash.replace(/^#/, '');

export const button = (name: string | RegExp) => screen.getByRole('button', { name });

/** Clicks and lets React and the hash router settle. */
export async function click(el: Element) {
  await act(async () => {
    (el as HTMLElement).click();
  });
  // A hash set by navigate() is announced asynchronously in jsdom.
  await act(async () => {
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  });
}

export function reducedMotion(on: boolean) {
  window.matchMedia = vi.fn().mockReturnValue({ matches: on }) as never;
}
