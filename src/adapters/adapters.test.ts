import { describe, expect, it, vi } from 'vitest';
import { browserStorage } from './browserStorage';
import { bundledContentSource, bundledTextSource, type Bundle } from './bundledSources';
import { memoryStorage } from './memoryStorage';

describe('memoryStorage', () => {
  it('keeps values for its lifetime', () => {
    const s = memoryStorage({ a: '1' });
    expect(s.get('a')).toBe('1');
    expect(s.get('b')).toBeNull();
    s.set('b', '2');
    expect(s.get('b')).toBe('2');
  });
});

describe('browserStorage', () => {
  it('reads and writes localStorage', () => {
    const s = browserStorage();
    s.set('test.key', 'v');
    expect(window.localStorage.getItem('test.key')).toBe('v');
    expect(s.get('test.key')).toBe('v');
  });

  it('never throws when storage is blocked', () => {
    const blocked = () => {
      throw new Error('blocked');
    };
    const s = browserStorage(blocked);
    expect(s.get('k')).toBeNull();
    expect(() => s.set('k', 'v')).not.toThrow();
  });

  it('never throws when storage is full', () => {
    const full = {
      getItem: vi.fn(),
      setItem: vi.fn(() => {
        throw new Error('full');
      }),
    };
    expect(() => browserStorage(() => full as unknown as Storage).set('k', 'v')).not.toThrow();
  });
});

describe('bundled sources', () => {
  const bundle: Bundle = {
    units: { 'LA.1': ['u'] },
    translations: { 'LA.1': ['t'] },
    unitContent: { 'LA.1': ['c'] },
    schedule: 's',
    glossary: ['g'],
    portion: 'p',
  };
  const ch = { part: 'LA', chapter: 1 };
  const other = { part: 'LA', chapter: 2 };

  it('serves a chapter by its key', async () => {
    const text = bundledTextSource(bundle);
    expect(await text.units(ch)).toEqual(['u']);
    expect(await text.translations(ch)).toEqual(['t']);
    const content = bundledContentSource(bundle);
    expect(await content.unitContent(ch)).toEqual(['c']);
    expect(await content.schedule()).toBe('s');
    expect(await content.glossary()).toEqual(['g']);
    expect(await content.portion()).toBe('p');
  });

  it('fails without the units, and does without English or content', async () => {
    await expect(bundledTextSource(bundle).units(other)).rejects.toThrow(
      'No units bundled for LA.2',
    );
    expect(await bundledTextSource(bundle).translations(other)).toEqual([]);
    expect(await bundledContentSource(bundle).unitContent(other)).toEqual([]);
  });

  it('serves the real bundle by default', async () => {
    const portion = await bundledContentSource().portion();
    expect(portion).toHaveProperty('dateKey');
    expect((await bundledTextSource().units({ part: 'LA', chapter: 32 })).length).toBeGreaterThan(
      0,
    );
  });
});
