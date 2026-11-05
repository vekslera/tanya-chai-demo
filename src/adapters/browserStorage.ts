import type { KeyValueStorage } from '../ports';

/**
 * localStorage, with every access wrapped (SPEC §3.2): when storage is blocked, full or missing,
 * reads return nothing and writes are dropped, and the app keeps going in memory.
 */
export function browserStorage(
  storage: () => Storage = () => window.localStorage,
): KeyValueStorage {
  return {
    get(key) {
      try {
        return storage().getItem(key);
      } catch {
        return null;
      }
    },
    set(key, value) {
      try {
        storage().setItem(key, value);
      } catch {
        // Storage full, blocked or unavailable.
      }
    },
  };
}
