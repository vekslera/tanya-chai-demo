import type { KeyValueStorage } from '../ports';

/** Storage that lasts for the page's lifetime: for tests, or when nothing should be kept. */
export function memoryStorage(initial: Record<string, string> = {}): KeyValueStorage {
  const data = new Map(Object.entries(initial));
  return {
    get: (key) => data.get(key) ?? null,
    set: (key, value) => void data.set(key, value),
  };
}
