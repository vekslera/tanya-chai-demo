// @vitest-environment node
import { strFromU8, unzipSync } from 'fflate';
import { describe, expect, it } from 'vitest';
import { en } from '../../../src/strings/en.ts';
import { he } from '../../../src/strings/he.ts';
import { pathOf, printConfig } from '../config.ts';
import { diskFiles } from '../env.ts';
import { loadChapter } from '../load.ts';
import { toDocx } from './docx.ts';
import { printModel, type PrintModel } from './model.ts';
import { cssVars, family, hex, printStyle } from './style.ts';

const disk = diskFiles();
const real = loadChapter(disk);
const tokens = disk.read(pathOf('tokens'));
const settings = (language: string) => printConfig.languages[language]!;
const styleOf = (language: string) => printStyle(tokens, printConfig.biurPt, settings(language));
const biurOf = (language: string) => real.unitContent[0]!.biur![language]!.short!.value;

describe('the print style', () => {
  it('reads the custom properties and resolves var()', () => {
    const vars = cssVars(':root { --a: #fff; --b: var(--a); /* c */ --c: 1px }');
    expect(vars.get('--b')).toBe('#fff');
    expect(() => cssVars(':root { --b: var(--missing); }')).toThrow('--missing is not defined');
  });

  it('takes a font from its stack and a color as Word writes it', () => {
    expect(family("'Frank Ruhl Libre', David, serif", 'David')).toBe('David');
    expect(() => family('Rubik, Arial', 'Courier')).toThrow('not in the stack');
    expect(hex('#1e2a5a')).toBe('1E2A5A');
    expect(hex('light-dark(#b47a00, #f0b437)')).toBe('B47A00');
    expect(() => hex('rgba(0, 0, 0, 0.1)')).toThrow('#rrggbb');
  });

  it.each(['he', 'en'])('sets the Tanya text and the ביאור apart (%s)', (language) => {
    const style = styleOf(language);
    expect(style.biur.sizePt).toBe(printConfig.biurPt);
    expect(style.text.sizePt).toBeGreaterThan(style.biur.sizePt);
    expect(style.text).toMatchObject({ font: settings(language).fonts.text, bold: true });
    expect(style.biur).toMatchObject({ font: settings(language).fonts.biur, bold: false });
    expect(style.text.color).not.toBe(style.biur.color);
  });
});

describe('the print model', () => {
  it.each(['he', 'en'])('puts each sentence’s ביאור right after it (%s)', (language) => {
    const model = printModel(real, real.portion!, language);
    expect(model.paragraphs).toHaveLength(3);
    // The first sentence joins the first two units, in either language.
    const first = model.paragraphs[0]![0]!;
    const [a, b] = real.texts[language]!.units;
    expect(first.text[0]).toMatchObject({ kind: 'text' });
    expect(first.text[0]!.kind === 'text' && first.text[0]!.text).toBe(
      `${a!.text.trim()} ${b!.text.trim()}`,
    );
    expect(first.biur).toBe(biurOf(language));
    expect(model.subtitle).toMatch(real.portion!.label[language as 'he' | 'en']);
    expect(model.credits).toHaveLength(2);
  });

  it('keeps the footnotes the portion’s text marks', () => {
    const english = printModel(real, real.portion!, 'en');
    expect(Object.keys(english.footnotes)).toEqual(['1', '2', '3', '4', '5', '6', '7']);
    expect(english.paragraphs[0]![1]!.text).toContainEqual({ kind: 'note', n: '1' });
    expect(printModel(real, real.portion!, 'he').footnotes).toEqual({});
  });

  it('credits the source of its language', () => {
    expect(printModel(real, real.portion!, 'en').credits[0]).toMatch(
      'Kehot Publication Society (English Translation)',
    );
    expect(printModel(real, real.portion!, 'he').credits[1]).toBe(he.print.contentCredit);
  });

  it('marks a draft only while a ביאור waits for approval', () => {
    const approved = structuredClone(real);
    for (const c of approved.unitContent) {
      for (const b of Object.values(c.biur ?? {})) if (b.short) b.short.reviewed = true;
    }
    expect(printModel(approved, approved.portion!, 'en').draft).toBeNull();
    approved.unitContent[0]!.biur!.en!.short!.reviewed = false;
    expect(printModel(approved, approved.portion!, 'en').draft).toBe(en.print.draft);
  });

  it('prints a unit without a ביאור as text alone, and credits only what it finds', () => {
    const all = structuredClone(real);
    delete all.unitContent[0]!.biur;
    const model = printModel(all, all.portion!, 'he', 'no such version');
    expect(model.paragraphs[0]![0]!.biur).toBeUndefined();
    expect(model.credits).toEqual([he.print.contentCredit]);
  });

  it('needs the language’s strings and text', () => {
    expect(() => printModel(real, real.portion!, 'fr')).toThrow('no fr strings or text');
    const all = structuredClone(real);
    delete all.texts.en;
    expect(() => printModel(all, all.portion!, 'en')).toThrow('no en strings or text');
  });

  it('leaves out the subtitle parts a portion lacks in that language', () => {
    const all = structuredClone(real);
    (all.portion!.label as Record<string, string>) = { he: 'רק עברית' };
    expect(printModel(all, all.portion!, 'en').subtitle).toBe(`${all.portion!.location.en} · `);
  });
});

describe('the Word document', () => {
  const read = async (language: string, change: (m: PrintModel) => void = () => {}) => {
    const model = printModel(real, real.portion!, language);
    change(model);
    const docx = await toDocx(model, styleOf(language), printConfig, settings(language));
    const zip = unzipSync(docx);
    const part = (prefix: string) =>
      Object.entries(zip)
        .filter(([name]) => name.startsWith(prefix))
        .map(([, data]) => strFromU8(data))
        .join();
    return {
      body: part('word/document.xml'),
      footer: part('word/footer'),
      notes: part('word/footnotes'),
    };
  };

  it('is right to left in Hebrew, with the text and the ביאור in their own fonts', async () => {
    const { body, footer } = await read('he', (m) => (m.draft = he.print.draft));
    expect(body).toMatch('<w:bidi');
    expect(body).toMatch('<w:rtl');
    expect(body).toMatch(`w:bidi="${settings('he').tag}"`);
    expect(body).toMatch(`w:cs="${settings('he').fonts.text}"`);
    expect(body).toMatch(`w:cs="${settings('he').fonts.biur}"`);
    expect(body).toMatch(biurOf('he'));
    expect(body).toMatch(he.print.draft);
    expect(footer).toMatch(he.print.contentCredit);
    expect(footer).toMatch('PAGE');
  });

  it('is left to right in English, with the text’s footnotes as Word footnotes', async () => {
    const { body, notes } = await read('en');
    expect(body).not.toMatch('<w:bidi');
    expect(body).toMatch(`w:val="${settings('en').tag}"`);
    expect(body).toMatch(`w:ascii="${settings('en').fonts.text}"`);
    expect(body).toMatch('<w:footnoteReference w:id="1"/>');
    expect(body).not.toMatch('[1]');
    expect(notes).toMatch('Leviticus 19:18.');
  });

  it('leaves out the draft notice once approved, and a ביאור a unit lacks', async () => {
    const { body } = await read('he', (m) => {
      m.draft = null;
      delete m.paragraphs[0]![0]!.biur;
    });
    expect(body).not.toMatch(he.print.draft);
    expect(body).not.toMatch(biurOf('he'));
  });
});
