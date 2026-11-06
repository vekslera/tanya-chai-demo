// @vitest-environment node
// fetch-sefaria over a fake network: it writes only when every version and license is as expected.
import { describe, expect, it } from 'vitest';
import { languagesOf, run } from './fetch-sefaria.ts';
import { config, pathOf } from './lib/config.ts';
import { diskFiles } from './lib/env.ts';
import { memoryEnv, memoryFiles } from './test/memoryEnv.ts';

const ch = config.chapters[0]!;
const disk = diskFiles();
const saved = (lang: string) =>
  JSON.parse(disk.read(pathOf(`sefariaResponse.${lang}`, ch))).response;

/** A network that answers with the saved responses, changed by `change`. */
function network(
  change: (lang: string, response: { versions: Record<string, unknown>[] }) => void = () => {},
) {
  return (async (url: string) => {
    const lang = url.includes('hebrew') ? 'he' : 'en';
    const response = structuredClone(saved(lang));
    change(lang, response);
    return { ok: true, status: 200, json: async () => response };
  }) as unknown as typeof fetch;
}

describe('languagesOf', () => {
  it('reads --lang', () => {
    expect(languagesOf([])).toEqual(['he', 'en']);
    expect(languagesOf(['--lang', 'en'])).toEqual(['en']);
  });
});

describe('fetch-sefaria', () => {
  it('writes the responses and the same resource files as before', async () => {
    const { files, data } = memoryFiles();
    const { env, lines } = memoryEnv(files, { fetch: network() });
    expect(await run(env)).toBe(0);
    for (const lang of ['he', 'en']) {
      expect(data.get(pathOf(`text.${lang}`, ch))).toBe(disk.read(pathOf(`text.${lang}`, ch)));
      expect(JSON.parse(data.get(pathOf(`sefariaResponse.${lang}`, ch))!).fetchedAt).toBe(
        '2026-11-06T00:00:00.000Z',
      );
    }
    expect(lines.info.join('\n')).toMatch(/¶1 markers: .*\[פ: ט אדר\]/);
    expect(lines.info.filter((l) => l.startsWith('created'))).toHaveLength(4);
  });

  it('says whether each file changed', async () => {
    const he = pathOf('text.he', ch);
    const { files } = memoryFiles({ [he]: disk.read(he), [pathOf('text.en', ch)]: 'old' });
    const { env, lines } = memoryEnv(files, { fetch: network() });
    await run(env);
    expect(lines.info).toContain(`unchanged: ${he}`);
    expect(lines.info).toContain(`updated: ${pathOf('text.en', ch)}`);
  });

  it.each([
    ['an HTTP error', 'HTTP 500'],
    ['no version', 'no version in the response'],
    ['another version', 'Unexpected version'],
    ['another license', 'is not allowed'],
  ])('writes nothing after %s', async (what, message) => {
    const fetch =
      what === 'an HTTP error'
        ? ((async () => ({ ok: false, status: 500 })) as unknown as typeof globalThis.fetch)
        : network((lang, r) => {
            if (lang !== 'en') return;
            if (what === 'no version') r.versions = [];
            if (what === 'another version') r.versions[0]!.versionTitle = 'Other';
            if (what === 'another license') r.versions[0]!.license = 'All rights reserved';
          });
    const { files, data } = memoryFiles();
    const { env, lines } = memoryEnv(files, { fetch });
    expect(await run(env)).toBe(1);
    expect(lines.error.join()).toMatch(message);
    expect(data.size).toBe(0);
  });
});
