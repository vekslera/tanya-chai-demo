// The composition root: the one place that chooses the concrete sources and storage. Replacing the
// bundled text with another TextSource (e.g. the Sefaria API) is a change here only.
import { browserStorage } from './adapters/browserStorage';
import { bundledContentSource, bundledTextSource } from './adapters/bundledSources';
import { config, type AppConfig } from './config';
import { loadPortion } from './content/loadPortion';
import type { AssembledPortion } from './domain/portion';
import type { KeyValueStorage, LearningContentSource, TextSource } from './ports';
import { createPersistence, storageKeyFor } from './store/persistence';
import { createReducer, initialStateFrom } from './store/state';
import type { StoreDeps } from './store/StoreProvider';

export type AppDeps = { loadPortion: () => Promise<AssembledPortion>; store: StoreDeps };

export type Adapters = {
  text: TextSource;
  content: LearningContentSource;
  storage: KeyValueStorage;
};

export function createDeps(
  { text, content, storage }: Adapters,
  appConfig: AppConfig = config,
  base: string = import.meta.env.BASE_URL,
): AppDeps {
  const initialState = initialStateFrom(appConfig);
  return {
    loadPortion: () => loadPortion(text, content, appConfig.language),
    store: {
      reducer: createReducer({ scoring: appConfig.scoring, initialState }),
      persistence: createPersistence(
        storage,
        storageKeyFor(appConfig.storage.key, base),
        initialState,
      ),
    },
  };
}

export const browserAdapters = (): Adapters => ({
  text: bundledTextSource(),
  content: bundledContentSource(),
  storage: browserStorage(),
});
