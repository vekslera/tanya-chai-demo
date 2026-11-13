// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { he } from '../../../src/strings/he.ts';
import { contentRules } from '../config.ts';
import { diskFiles } from '../env.ts';
import { loadChapter } from '../load.ts';
import { reviewDocument } from './index.ts';
import { item, quote } from './item.ts';
import { sectionTitle } from './sections.ts';

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

describe('sectionTitle', () => {
  it('names a section by its number and its units', () => {
    expect(sectionTitle(real, [{ from: 'LA.32.009', to: 'LA.32.013' }], 0)).toBe(
      '1 (LA.32.009–013)',
    );
    expect(sectionTitle(real, [{ from: 'LA.32.008', to: 'LA.32.008' }], 0)).toBe('1 (LA.32.008)');
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
    const { levelCategories } = contentRules.questions;
    const rules = {
      ...contentRules,
      questions: { ...contentRules.questions, levelCategories: { ...levelCategories, 9: [] } },
    };
    const { text } = reviewDocument(all, all.portion!, rules);
    expect(text).not.toMatch('Source line');
    expect(text).toMatch('### Level 9:  ()');
    // Each question with where it is asked, and the text of its section.
    const first = all.portion!.questions[0]!;
    expect(text).toMatch(`#### ${first.id}: after section 1 (LA.32.001–003)`);
    expect(text).toMatch('choice, literal; relies on LA.32.001\n\n> ');
    expect(text).toMatch('#### q-l1-summary: summary question, after the last section');
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
