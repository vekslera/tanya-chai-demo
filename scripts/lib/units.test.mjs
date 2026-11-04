import { describe, expect, it } from 'vitest';
import { buildUnits, checkUnits, lettersOnly } from './units.mjs';
import { loadAll, validate } from './content.mjs';

describe('lettersOnly', () => {
  it('drops nikud, punctuation and gershayim', () => {
    expect(lettersOnly('דְּ״קוּדְשָׁא,')).toBe('דקודשא');
  });
});

describe('buildUnits', () => {
  const raw = '  שָׁלוֹם, עוֹלָם – גָּדוֹל. [וְעוֹד] דָּבָר־אַחֵר \r\nשׁוּרָה שְׁנִיָּה\r\n';
  const splits = [
    { id: 'LA.1.001', startsWith: 'שלום עולם' },
    { id: 'LA.1.002', startsWith: 'ועוד דבר' },
    { id: 'LA.1.003', startsWith: 'שורה' },
  ];

  it('splits at anchors, keeping attached punctuation and joining back exactly', () => {
    const { units, lines, errors } = buildUnits({ raw, splits, part: 'LA', chapter: 1 });
    expect(errors).toEqual([]);
    expect(units.map((u) => u.text)).toEqual([
      '  שָׁלוֹם, עוֹלָם – גָּדוֹל. ',
      '[וְעוֹד] דָּבָר־אַחֵר ',
      'שׁוּרָה שְׁנִיָּה',
    ]);
    expect(units.map((u) => u.paragraph)).toEqual([1, 1, 2]);
    expect(checkUnits({ units, lines, splits })).toEqual([]);
  });

  it('treats a maqaf as a space', () => {
    const { errors } = buildUnits({
      raw,
      splits: [splits[0], { id: 'LA.1.002', startsWith: 'ועוד דבר אחר' }, splits[2]],
      part: 'LA',
      chapter: 1,
    });
    expect(errors).toEqual([]);
  });

  it('reports a paragraph whose first unit is not at its start', () => {
    const { errors } = buildUnits({
      raw,
      splits: [splits[0], { id: 'LA.1.002', startsWith: 'שניה' }],
      part: 'LA',
      chapter: 1,
    });
    expect(errors.join()).toMatch(/does not start at the beginning/);
  });

  it('reports a missing anchor', () => {
    const { errors } = buildUnits({
      raw,
      splits: [splits[0], { id: 'LA.1.002', startsWith: 'אין כזה' }, splits[2]],
      part: 'LA',
      chapter: 1,
    });
    expect(errors.join()).toMatch(/not found/);
  });
});

describe('chapter 32', () => {
  it('builds 48 units that join back to the raw text', () => {
    const all = loadAll();
    expect(all.errors).toEqual([]);
    expect(all.units).toHaveLength(48);
    expect(checkUnits(all)).toEqual([]);
  });

  it('passes every integrity rule of the content', () => {
    expect(validate(loadAll()).errors).toEqual([]);
  });
});
