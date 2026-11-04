import { describe, expect, it } from 'vitest';
import { footnoteMarks, parseEnglish } from './english.mjs';

describe('parseEnglish', () => {
  const raw =
    'First “quote”[1] and a [bracketed] word.\r\nSecond paragraph.[2]\r\n\r\n[1] Leviticus 19:18.\r\n[2] Avot 5:16.\r\n';

  it('splits paragraphs from footnotes', () => {
    const { paragraphs, footnotes, errors } = parseEnglish(raw);
    expect(errors).toEqual([]);
    expect(paragraphs).toEqual([
      'First “quote”[1] and a [bracketed] word.',
      'Second paragraph.[2]',
    ]);
    expect(footnotes).toEqual({ 1: 'Leviticus 19:18.', 2: 'Avot 5:16.' });
  });

  it('marks only numeric brackets', () => {
    expect(footnoteMarks('a[1] b [word] c[12]')).toEqual(['1', '12']);
  });

  it('works without footnotes', () => {
    expect(parseEnglish('One.\nTwo.\n').paragraphs).toEqual(['One.', 'Two.']);
  });

  it('reports a malformed footnote line', () => {
    expect(parseEnglish('One.\n\nnot a note\n').errors).toHaveLength(1);
  });
});
