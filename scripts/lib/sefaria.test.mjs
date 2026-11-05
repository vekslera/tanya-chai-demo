import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import { config, pathOf } from './config.ts';
import { englishText, hebrewText, portionMarkers } from './sefaria.mjs';

describe('englishText', () => {
  it('turns footnotes into [n] marks and lists them after a blank line', () => {
    const seg =
      'love “yourself”<sup class="footnote-marker">1</sup><i class="footnote"> <i>Leviticus</i> 19:18.</i> toward <i>all</i>.';
    expect(englishText([seg, 'Second.'])).toBe(
      'love “yourself”[1] toward all.\nSecond.\n\n[1] Leviticus 19:18.\n',
    );
  });
});

describe('hebrewText', () => {
  it('removes tags and marker elements, keeping the words', () => {
    const seg = '<i data-overlay="Vilna Pages" data-value="[פ: ט אדר]"></i> <b>וְהִנֵּה</b>, עַל';
    expect(hebrewText([seg])).toBe('וְהִנֵּה, עַל\n');
    expect(portionMarkers([seg])).toEqual([['[פ: ט אדר]']]);
  });
});

// The resource files are exactly what fetch-sefaria derives from the saved responses: nobody has
// edited them by hand.
describe.each(config.chapters)('resources for $part $chapter', (ch) => {
  it.each(['he', 'en'])('%s text matches its saved Sefaria response', (lang) => {
    const saved = pathOf(`sefariaResponse.${lang}`, ch, { absolute: true });
    if (!fs.existsSync(saved)) return;
    const { response } = JSON.parse(fs.readFileSync(saved, 'utf8'));
    const segments = response.versions[0].text;
    const expected = lang === 'he' ? hebrewText(segments) : englishText(segments);
    expect(fs.readFileSync(pathOf(`text.${lang}`, ch, { absolute: true }), 'utf8')).toBe(expected);
  });
});
