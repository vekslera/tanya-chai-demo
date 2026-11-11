// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { he } from '../../../src/strings/he.ts';
import { contentRules } from '../config.ts';
import { diskFiles } from '../env.ts';
import { loadChapter } from '../load.ts';
import { reviewDocument } from './index.ts';
import { item, quote } from './item.ts';

const real = loadChapter(diskFiles());

describe('review items', () => {
  it('shows the status and any note', () => {
    expect(item('x', { value: 'v', reviewed: true, note: 'n' })).toBe(
      '- **x** (✅ approved)\n  v\n  _Note: n_',
    );
    expect(item('x', { value: 'v', reviewed: false })).toBe('- **x** (⬜ to review)\n  v');
    expect(quote(real.units.slice(0, 2))).toMatch(/^> \S/);
  });
});

describe('reviewDocument', () => {
  it('counts the items to review and lists every section', () => {
    const { text, unreviewed } = reviewDocument(real, real.portion!);
    expect(text).toMatch(`**Status:** ${unreviewed} item(s) to review.`);
    expect(text).toMatch(`### Level 1: ${he.level.options[1]!.title}`);
    expect(text).toMatch('## 3. Avos uBanim cards');
  });

  it('handles an entry without a source, a choice without options and an unnamed level', () => {
    const all = structuredClone(real);
    for (const g of all.glossary) delete g.source;
    delete all.portion!.questions[0]!.options;
    delete all.unitContent[0]!.biur;
    all.unitContent.splice(1, 1);
    const rules = { ...contentRules, levelQuestions: { ...contentRules.levelQuestions, 9: {} } };
    const { text } = reviewDocument(all, all.portion!, rules);
    expect(text).not.toMatch('Source line');
    expect(text).toMatch('### Level 9:  ()');
  });

  it('quotes the text of each other language before its ביאור', () => {
    const all = structuredClone(real);
    const { text } = reviewDocument(all, all.portion!);
    // The first sentence joins the first two units.
    const english = all.texts
      .en!.units.slice(0, 2)
      .map((u) => u.text.trim())
      .join(' ');
    expect(text).toMatch(`> ${english}\n\n- **LA.32.001/biur.en**`);
    all.unitContent[0]!.biur = {
      he: {},
      en: {},
      fr: { short: { value: 'Bonjour', reviewed: false } },
    };
    const other = reviewDocument(all, all.portion!).text;
    expect(other).not.toMatch('LA.32.001/biur.he');
    expect(other).not.toMatch('LA.32.001/biur.en');
    expect(other).toMatch('- **LA.32.001/biur.fr** (⬜ to review)\n  Bonjour');
  });
});
