// @vitest-environment node
// The text libraries: units, the English resource, glossary matches, overlaps, translation spans.
import { describe, expect, it } from 'vitest';
import { parseResource } from './resource.ts';
import { resolveMatch, sameLetters, skipLetters } from './matches.ts';
import { overlaps, runs, toWords } from './overlap.ts';
import { translationSpans } from './translations.ts';
import { buildUnits, checkUnits, lettersOnly, paragraphs } from './units.ts';

describe('lettersOnly', () => {
  it('drops nikud, punctuation and gershayim', () => {
    expect(lettersOnly('דְּ״קוּדְשָׁא,')).toBe('דקודשא');
    expect(lettersOnly('–')).toBe('');
  });

  it('reads English case-blind, without quotes or footnote numbers', () => {
    expect(lettersOnly('“Bless us,”[7]', 'en')).toBe('blessus');
    expect(() => lettersOnly('x', 'fr')).toThrow('no script for language "fr"');
  });
});

describe('paragraphs', () => {
  it('drops a BOM, line endings and empty lines', () => {
    expect(paragraphs('﻿א\r\n\r\nב\n')).toEqual(['א', 'ב']);
  });
});

describe('buildUnits', () => {
  const raw = '  שָׁלוֹם, עוֹלָם – גָּדוֹל. [וְעוֹד] דָּבָר־אַחֵר \r\nשׁוּרָה שְׁנִיָּה\r\n';
  const splits = [
    { id: 'LA.1.001', startsWith: 'שלום עולם' },
    { id: 'LA.1.002', startsWith: 'ועוד דבר' },
    { id: 'LA.1.003', startsWith: 'שורה' },
  ];
  const build = (s = splits) => buildUnits({ raw, splits: s, part: 'LA', chapter: 1 });

  it('splits at anchors, keeping attached punctuation and joining back exactly', () => {
    const { units, lines, errors } = build();
    expect(errors).toEqual([]);
    expect(units.map((u) => u.text)).toEqual([
      '  שָׁלוֹם, עוֹלָם – גָּדוֹל. ',
      '[וְעוֹד] דָּבָר־אַחֵר ',
      'שׁוּרָה שְׁנִיָּה',
    ]);
    expect(units.map((u) => [u.paragraph, u.seq])).toEqual([
      [1, 1001],
      [1, 1002],
      [2, 1003],
    ]);
    expect(checkUnits({ units, lines, splits })).toEqual([]);
  });

  it('treats a maqaf as a space', () => {
    expect(
      build([splits[0]!, { id: 'LA.1.002', startsWith: 'ועוד דבר אחר' }, splits[2]!]).errors,
    ).toEqual([]);
  });

  it('reports bad anchors and uncovered paragraphs', () => {
    const errors = (s: typeof splits) => build(s).errors.join('\n');
    expect(errors([splits[0]!, { id: 'LA.1.002', startsWith: 'שניה' }])).toMatch(
      /does not start at the beginning/,
    );
    expect(errors([splits[0]!, { id: 'LA.1.002', startsWith: 'אין כזה' }, splits[2]!])).toMatch(
      /not found/,
    );
    expect(errors([splits[0]!, { id: 'LA.1.002', startsWith: '–' }, splits[2]!])).toMatch(
      /has no letters/,
    );
    expect(errors([splits[0]!])).toMatch(/paragraph 2 has no unit/);
  });

  it('checks IDs and that the units join back', () => {
    const { units, lines } = build();
    const bad = [{ id: 'bad', startsWith: 'x' }, splits[0]!, splits[0]!];
    expect(checkUnits({ units, lines, splits: bad })).toEqual([
      'bad: malformed unit ID',
      'LA.1.001: duplicate unit ID',
    ]);
    expect(checkUnits({ units: units.slice(1), lines, splits })).toEqual([
      'paragraph 1: units do not join back to the raw line',
    ]);
  });
});

describe('parseResource', () => {
  const raw =
    '﻿First “quote”[1] and a [bracketed] word.\r\nSecond paragraph.[2]\r\n\r\n[1] Leviticus 19:18.\r\n[2] Avot 5:16.\r\n';

  it('splits paragraphs from footnotes', () => {
    expect(parseResource(raw)).toEqual({
      paragraphs: ['First “quote”[1] and a [bracketed] word.', 'Second paragraph.[2]'],
      footnotes: { 1: 'Leviticus 19:18.', 2: 'Avot 5:16.' },
      errors: [],
    });
  });

  it('works without footnotes', () => {
    expect(parseResource('One.\nTwo.\n').paragraphs).toEqual(['One.', 'Two.']);
  });

  it('reports malformed and repeated footnotes', () => {
    expect(parseResource('One.\n\nnot a note\n[1] a\n[1] b\n').errors).toEqual([
      'footnote line without "[n]": not a note',
      'footnote [1] appears twice',
    ]);
  });
});

describe('resolveMatch', () => {
  const text = 'וְהַנֶּפֶשׁ וְהָרוּחַ, מִי יוֹדֵעַ';

  it('keeps an exact match, and finds a match written without nikud or prefix', () => {
    expect(resolveMatch(text, 'מִי')).toBe('מִי');
    expect(resolveMatch(text, 'נפש והרוח')).toBe('נֶּפֶשׁ וְהָרוּחַ');
    expect(resolveMatch(text, 'אין')).toBeNull();
  });

  it('skips letters with their nikud', () => {
    expect(skipLetters('וְהַנֶּפֶשׁ', 2)).toBe('נֶּפֶשׁ');
    expect(skipLetters('וְ', 3)).toBe('');
    expect(sameLetters('נֶפֶשׁ', 'נפש')).toBe(true);
  });
});

describe('overlaps', () => {
  it('flags shared runs that are not quotations of the text', () => {
    expect(toWords('אַחַת־שְׁתַּיִם, שָׁלֹשׁ')).toEqual(['אחת', 'שתים', 'שלש']);
    expect(runs(['a', 'b', 'c'], 2)).toEqual(new Set(['a b', 'b c']));
    const reference = runs(toWords('אחת שתים שלש ארבע'), 2);
    const quotations = runs(toWords('אחת שתים'), 2);
    const drafts = [
      { id: 'x', text: 'אחת שתים שלש' },
      { id: 'y', text: 'חמש שש' },
    ];
    expect(overlaps(drafts, reference, quotations, 2)).toEqual([{ id: 'x', hits: ['שתים שלש'] }]);
  });
});

describe('translationSpans', () => {
  const units = buildUnits({
    raw: 'אַחַת שְׁתַּיִם\nשָׁלֹשׁ\n',
    splits: [
      { id: 'LA.1.001', startsWith: 'אחת' },
      { id: 'LA.1.002', startsWith: 'שתים' },
      { id: 'LA.1.003', startsWith: 'שלש' },
    ],
    part: 'LA',
    chapter: 1,
  }).units;

  it('makes one span per paragraph, with the footnotes it marks', () => {
    const english = parseResource('One[1], two[9].\nThree.\n\n[1] Note.\n');
    expect(translationSpans(units, 2, english)).toEqual({
      spans: [
        {
          from: 'LA.1.001',
          to: 'LA.1.002',
          text: 'One[1], two[9].',
          sourceId: 'en-resource',
          footnotes: { 1: 'Note.' },
        },
        { from: 'LA.1.003', to: 'LA.1.003', text: 'Three.', sourceId: 'en-resource' },
      ],
    });
  });

  it('refuses a different number of paragraphs', () => {
    expect(translationSpans(units, 3, parseResource('One.\n'))).toEqual({
      error: 'the English has 1 paragraphs, the Hebrew 3. Ask Alex how to align them.',
    });
  });
});
