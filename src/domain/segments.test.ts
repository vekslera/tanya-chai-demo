// The text segmentations: glossary terms, footnote marks, Latin runs, Shinun words.
import { describe, expect, it } from 'vitest';
import { balance, bidiSegments } from './bidi';
import { footnoteMarks, footnoteSegments } from './footnotes';
import { glossarySegments, type Segment } from './glossaryMarks';
import type { GlossaryMark } from './portion';
import { firstLetter, roundWords, wordsOf } from './shinun';

const mark = (match: string): GlossaryMark => ({
  match,
  entry: { id: match, term: match, body: { value: '', reviewed: false } },
});
const join = (segs: Segment[]) =>
  segs.map((s) => (s.kind === 'text' ? s.text : s.before + s.term + s.after)).join('');

describe('glossarySegments', () => {
  const text = 'הִנֵּה וְהַנֶּפֶשׁ, וְהַנֶּפֶשׁ שׁוֹרֶשׁ';

  it('marks a term at its first occurrence, with the letters attached to it', () => {
    const segs = glossarySegments(text, [mark('הַנֶּפֶשׁ')]);
    expect(segs).toEqual([
      { kind: 'text', text: 'הִנֵּה ' },
      { kind: 'term', before: 'וְ', term: 'הַנֶּפֶשׁ', after: ',', mark: mark('הַנֶּפֶשׁ') },
      { kind: 'text', text: ' וְהַנֶּפֶשׁ שׁוֹרֶשׁ' },
    ]);
    expect(join(segs)).toBe(text);
  });

  it('skips matches that are absent or overlap an earlier one', () => {
    const segs = glossarySegments(text, [mark('נֶּפֶשׁ, וְ'), mark('הַנֶּפֶשׁ'), mark('אַיִן')]);
    expect(segs.filter((s) => s.kind === 'term')).toHaveLength(1);
    expect(join(segs)).toBe(text);
  });

  it('marks a term at the very start, with nothing after the last term', () => {
    expect(glossarySegments('שׁוֹרֶשׁ', [mark('שׁוֹרֶשׁ')])).toEqual([
      { kind: 'term', before: '', term: 'שׁוֹרֶשׁ', after: '', mark: mark('שׁוֹרֶשׁ') },
    ]);
  });
});

describe('footnotes', () => {
  it('finds the marks, and leaves bracketed words alone', () => {
    expect(footnoteMarks('a[1] [word] b[12]')).toEqual(['1', '12']);
  });

  it('splits at the marks of known footnotes only', () => {
    expect(footnoteSegments('a[1] b[2].', { '1': 'x' })).toEqual([
      { kind: 'text', text: 'a' },
      { kind: 'note', n: '1' },
      { kind: 'text', text: ' b[2].' },
    ]);
    expect(footnoteSegments('[1]', { '1': 'x' })).toEqual([{ kind: 'note', n: '1' }]);
  });
});

describe('bidi', () => {
  it('drops unpaired parentheses at the ends of a run', () => {
    expect(balance('(Sefaria')).toEqual({ text: 'Sefaria', lead: 1 });
    expect(balance('Sefaria)')).toEqual({ text: 'Sefaria', lead: 0 });
    expect(balance('(Sefaria)')).toEqual({ text: '(Sefaria)', lead: 0 });
  });

  it('isolates Latin runs; short ones do not wrap', () => {
    // Paired parentheses stay inside the run; an unpaired one is left to the Hebrew.
    expect(bidiSegments('הוצאת קה״ת (Kehot Publication Society), ספריא', 10)).toEqual([
      { text: 'הוצאת קה״ת ', latin: false, nowrap: false },
      { text: '(Kehot Publication Society)', latin: true, nowrap: false },
      { text: ', ספריא', latin: false, nowrap: false },
    ]);
    expect(bidiSegments('ספריא (Sefaria.', 30).map((s) => s.text)).toEqual([
      'ספריא (',
      'Sefaria',
      '.',
    ]);
    expect(bidiSegments('רישיון CC-BY-NC.', 30)[1]).toEqual({
      text: 'CC-BY-NC',
      latin: true,
      nowrap: true,
    });
  });

  it('leaves plain Hebrew whole', () => {
    expect(bidiSegments('שלום', 30)).toEqual([{ text: 'שלום', latin: false, nowrap: false }]);
  });
});

describe('shinun', () => {
  it('keeps the first letter with its nikud and any punctuation before it', () => {
    expect(firstLetter('״אַהֲבָה')).toBe('״אַ');
    expect(firstLetter('...')).toBe('...');
  });

  it('hides the round words that were not revealed', () => {
    expect(wordsOf('אַחִים מַמָּשׁ')).toEqual(['אַחִים', 'מַמָּשׁ']);
    expect(roundWords('אַחִים מַמָּשׁ', [0, 1], new Set([1]))).toEqual([
      { index: 0, text: 'אַחִים', hidden: true },
      { index: 1, text: 'מַמָּשׁ', hidden: false },
    ]);
  });
});
