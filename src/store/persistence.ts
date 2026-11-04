// One localStorage key (SPEC §5.3). Every access is wrapped: the demo works without storage.
import { initialState, type DemoState } from './state';

const KEY = 'tanyachai.demo.v1';

export function loadState(): DemoState {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return initialState;
    const saved = JSON.parse(raw) as Partial<DemoState>;
    if (!saved || typeof saved !== 'object') return initialState;
    return { ...initialState, ...saved };
  } catch {
    return initialState;
  }
}

export function saveState(state: DemoState) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Storage full, blocked or unavailable: keep going in memory.
  }
}

export function clearState() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // Nothing to clear.
  }
}
