// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { textsModule, virtualModules } from './virtual.vite.ts';

type Hooks = {
  resolveId: (id: string) => string | undefined;
  load: (this: { addWatchFile: (f: string) => void }, id: string) => string | undefined;
};

describe('virtual modules', () => {
  const plugin = virtualModules() as unknown as Hooks;
  const watch = { addWatchFile: vi.fn() };

  it('resolves only its own modules', () => {
    expect(plugin.resolveId('virtual:texts')).toBe('\0virtual:texts');
    expect(plugin.resolveId('virtual:brand')).toBe('\0virtual:brand');
    expect(plugin.resolveId('react')).toBeUndefined();
  });

  it('serves every chapter’s files, keyed by chapter', () => {
    const code = textsModule();
    expect(code).toMatch(/export const units = \{ "LA\.32": units0 \}/);
    expect(code).toMatch(/export \{ default as portion \} from ".*content\/portions/);
    expect(plugin.load.call(watch, '\0virtual:texts')).toBe(code);
  });

  it('leaves out the English and content a chapter does not have yet', () => {
    const code = textsModule([{ part: 'LA', chapter: 999 }]);
    expect(code).toMatch(/export const units = \{ "LA\.999": units0 \}/);
    expect(code).toMatch(/export const translations = \{ {2}\}/);
  });

  it('serves the app config and the logo geometry, watching their files', () => {
    expect(plugin.load.call(watch, '\0virtual:app-config')).toMatch(
      /^export default \{"\$comment"/,
    );
    expect(plugin.load.call(watch, '\0virtual:brand')).toMatch(/"viewBox":"52 54 156 156"/);
    expect(watch.addWatchFile).toHaveBeenCalledTimes(2);
    expect(plugin.load.call(watch, 'other')).toBeUndefined();
  });
});
