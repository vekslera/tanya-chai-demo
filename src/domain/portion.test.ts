import { describe, expect, it } from 'vitest';
import { portionData } from '../test/fixtures';
import { assemblePortion, paragraphKey, portionRanges, sentenceText } from './portion';

describe('assemblePortion', () => {
  const p = assemblePortion(portionData());

  it('takes the units of the scheduled ranges, trimmed for display', () => {
    expect(p.units.map((u) => u.id)).toEqual(['LA.1.001', 'LA.1.002', 'LA.1.003', 'LA.1.004']);
    expect(p.unit('LA.1.001')?.display).toBe('וְהִנֵּה אַהֲבָה,');
    expect(p.unit('nope')).toBeUndefined();
  });

  it('joins units into sentences, each with the ביאור of its first unit', () => {
    expect(p.sentences.map((s) => [s.id, s.units.map((u) => u.id)])).toEqual([
      ['LA.1.001', ['LA.1.001']],
      ['LA.1.002', ['LA.1.002']],
      ['LA.1.003', ['LA.1.003', 'LA.1.004']],
    ]);
    expect(p.paragraphs.map((x) => x.sentences.length)).toEqual([2, 1]);
    expect(p.sentenceOf('LA.1.004')!.id).toBe('LA.1.003');
    expect(sentenceText(p.sentenceOf('LA.1.004')!)).toBe('אַחִים מַמָּשׁ אָב אֶחָד.');
    expect(p.sentenceOf('nope')).toBeUndefined();
    expect(p.sentenceOf('LA.1.001')!.biur?.value).toBe('ביאור ראשון');
    expect(p.sentenceOf('LA.1.003')!.biur).toBeUndefined();
  });

  it('attaches the known glossary entries', () => {
    expect(p.unit('LA.1.001')!.glossary.map((m) => m.entry.id)).toEqual(['ahava']);
    // An entry missing from the glossary is left out.
    expect(p.unit('LA.1.002')!.glossary).toEqual([]);
  });

  it('attaches the ביאור in the language asked for', () => {
    const english = assemblePortion({ ...portionData(), language: 'en' });
    expect(english.sentenceOf('LA.1.001')!.biur?.value).toBe('The first biur');
    expect(english.sentenceOf('LA.1.002')!.biur).toBeUndefined();
  });

  it('groups units into paragraphs with their English', () => {
    expect(p.paragraphs.map((x) => [x.key, x.units.length, x.translation?.text])).toEqual([
      ['LA.1.1', 2, 'Love [and soul][1].'],
      ['LA.1.2', 2, 'Brothers.'],
    ]);
  });

  it('gives the units of a range and counts the unreviewed items', () => {
    expect(p.unitsOf({ from: 'LA.1.003', to: 'LA.1.004' })).toHaveLength(2);
    // 3 ביאורים (1 approved), 2 glossary bodies, 6 questions × 3 fields, 2 cards with 5 fields.
    expect(p.unreviewed).toBe(2 + 2 + 18 + 5);
  });

  it('keeps a paragraph without English', () => {
    const data = portionData();
    data.translations = [];
    expect(assemblePortion(data).paragraphs[0]!.translation).toBeUndefined();
  });
});

describe('portionRanges', () => {
  it('throws when the schedule has no entry for the day', () => {
    const { portion, schedule } = portionData();
    expect(() => portionRanges({ ...portion, dateKey: 'x' }, schedule)).toThrow(
      'No schedule entry for regular.x',
    );
  });
});

describe('paragraphKey', () => {
  it('is unique across chapters', () => {
    const u = portionData().units[0]!;
    expect(paragraphKey(u)).toBe('LA.1.1');
    expect(paragraphKey({ ...u, chapter: 2 })).toBe('LA.2.1');
  });
});
