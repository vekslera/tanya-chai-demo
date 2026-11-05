// The demo's state under one storage key (SPEC §5.3). The storage itself never throws.
import type { KeyValueStorage } from '../ports';
import type { DemoState } from './state';

export type Persistence = { load(): DemoState; save(state: DemoState): void };

export function createPersistence(
  storage: KeyValueStorage,
  key: string,
  initialState: DemoState,
): Persistence {
  return {
    load() {
      const raw = storage.get(key);
      if (!raw) return initialState;
      try {
        const saved: unknown = JSON.parse(raw);
        if (!saved || typeof saved !== 'object') return initialState;
        return { ...initialState, ...(saved as Partial<DemoState>) };
      } catch {
        return initialState;
      }
    },
    save: (state) => storage.set(key, JSON.stringify(state)),
  };
}
