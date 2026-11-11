// @vitest-environment node
// Each script, run over the repo's files with every write kept in memory.
import { strFromU8, unzipSync } from 'fflate';
import { describe, expect, it } from 'vitest';
import { run as buildPrint } from './build-print.ts';
import { run as buildReview } from './build-review.ts';
import { run as buildTranslations } from './build-translations.ts';
import { run as buildUnits } from './build-units.ts';
import { run as checkOverlap } from './check-overlap.ts';
import { config, pathOf } from './lib/config.ts';
import { diskFiles } from './lib/env.ts';
import { loadChapter } from './lib/load.ts';
import { en } from '../src/strings/en.ts';
import { he } from '../src/strings/he.ts';
import { run as resolveMatches } from './resolve-matches.ts';
import { memoryEnv, repoFiles } from './test/memoryEnv.ts';
import { groupOf, run as validateContent } from './validate-content.ts';

const ch = config.chapters[0]!;
const disk = diskFiles();

/** The repo with some files replaced (null hides a file). */
function repoWith(replace: Record<string, string | null> = {}) {
  const repo = repoFiles();
  const files = {
    ...repo.files,
    read: (rel: string) => (rel in replace ? replace[rel]! : repo.files.read(rel)),
    exists: (rel: string) => (rel in replace ? replace[rel] !== null : repo.files.exists(rel)),
  };
  return { files, written: repo.written, writtenBytes: repo.writtenBytes };
}

describe('build-units', () => {
  it('writes the units of every chapter, in every language', () => {
    const { files, written } = repoWith();
    const { env, lines } = memoryEnv(files);
    expect(buildUnits(env)).toBe(0);
    expect(JSON.parse(written.get(pathOf('units.he', ch))!)).toHaveLength(48);
    expect(JSON.parse(written.get(pathOf('units.en', ch))!)).toHaveLength(48);
    expect(lines.info).toEqual([
      'build-units: LA 32 (he), 48 units',
      'build-units: LA 32 (en), 48 units',
    ]);
  });

  it.each(['he', 'en'])('fails on a bad split (%s)', (language) => {
    const { files } = repoWith({
      [pathOf(`splits.${language}`, ch)]: '[{"id":"LA.32.001","startsWith":"זזזז xyzzy"}]',
    });
    const { env, lines } = memoryEnv(files);
    expect(buildUnits(env)).toBe(1);
    expect(lines.error.join()).toMatch(`(${language}): LA.32.001: anchor`);
  });

  it('skips a language without splits yet', () => {
    const { env, lines } = memoryEnv(repoWith({ [pathOf('splits.en', ch)]: null }).files);
    expect(buildUnits(env)).toBe(0);
    expect(lines.warn).toEqual(['build-units: LA 32 (en) has no text or no splits yet']);
  });
});

describe('loadChapter', () => {
  it('needs the text of the app’s language', () => {
    expect(() => loadChapter(repoWith({ [pathOf('splits.he', ch)]: null }).files)).toThrow(
      'no he text or splits',
    );
  });

  it('joins every language’s units into the app language’s sentences', () => {
    const all = loadChapter(repoWith().files);
    const sentences = (language: string) => all.texts[language]!.units.map((u) => u.sentence);
    expect(sentences('he')[1]).toBe('LA.32.001');
    expect(sentences('en')).toEqual(sentences('he'));
  });
});

describe('build-translations', () => {
  it('rewrites the committed spans exactly', () => {
    const { files, written } = repoWith();
    expect(buildTranslations(memoryEnv(files).env)).toBe(0);
    expect(written.get(pathOf('translations', ch))).toBe(disk.read(pathOf('translations', ch)));
  });

  it.each([
    ['no English', { [pathOf('text.en', ch)]: null }, 'not found'],
    ['bad units', { [pathOf('splits.he', ch)]: '[]' }, 'has no unit'],
    ['a bad footnote', { [pathOf('text.en', ch)]: 'One.\n\nbad\n' }, 'footnote line'],
    ['misaligned English', { [pathOf('text.en', ch)]: 'One.\n' }, 'Ask Alex'],
  ])('fails with %s', (_, replace, message) => {
    const { env, lines } = memoryEnv(repoWith(replace).files);
    expect(buildTranslations(env)).toBe(1);
    expect(lines.error.join()).toMatch(message);
  });
});

describe('build-review', () => {
  it('rewrites the review document exactly', () => {
    const { files, written } = repoWith();
    expect(buildReview(memoryEnv(files).env)).toBe(0);
    expect(written.get(pathOf('review'))).toBe(disk.read(pathOf('review')));
  });

  it('needs a portion', () => {
    const { env } = memoryEnv(repoWith({ [pathOf('portion')]: null }).files);
    expect(buildReview(env)).toBe(1);
  });
});

describe('build-print', () => {
  it('writes the Word document of the portion in every language', async () => {
    const { files, writtenBytes } = repoWith();
    const { env, lines } = memoryEnv(files);
    expect(await buildPrint(env)).toBe(0);
    const documentOf = (language: string) =>
      strFromU8(
        unzipSync(writtenBytes.get(pathOf(`print.${language}`, ch))!)['word/document.xml']!,
      );
    expect(documentOf('he')).toMatch(he.print.title);
    expect(documentOf('en')).toMatch(en.print.title);
    expect(lines.info).toEqual([
      `print: wrote ${pathOf('print.he', ch)}`,
      `print: wrote ${pathOf('print.en', ch)}`,
    ]);
  });

  it('reports a language without a text, and prints the others', async () => {
    const { files, writtenBytes } = repoWith({ [pathOf('splits.en', ch)]: null });
    const { env, lines } = memoryEnv(files);
    expect(await buildPrint(env)).toBe(1);
    expect(lines.error).toEqual(['print: no en text or splits']);
    expect(writtenBytes.has(pathOf('print.he', ch))).toBe(true);
  });

  it('needs a portion', async () => {
    const { env, lines } = memoryEnv(repoWith({ [pathOf('portion')]: null }).files);
    expect(await buildPrint(env)).toBe(1);
    expect(lines.error[0]).toMatch('missing');
  });
});

describe('resolve-matches', () => {
  it('keeps the resolved matches as they are', () => {
    const { files, written } = repoWith();
    expect(resolveMatches(memoryEnv(files).env)).toBe(0);
    expect(written.get(pathOf('unitContent', ch))).toBe(disk.read(pathOf('unitContent', ch)));
  });

  it('resolves a match written without nikud, and reports one not found', () => {
    const content = JSON.parse(disk.read(pathOf('unitContent', ch)));
    content[0].glossary[0].match = 'נבזה ונמאס';
    content[1].glossary = [{ entryId: 'x', match: 'אין כזה' }];
    content.push({ id: 'LA.99.001', glossary: [{ entryId: 'x', match: 'אין' }] });
    const { files, written } = repoWith({ [pathOf('unitContent', ch)]: JSON.stringify(content) });
    const { env, lines } = memoryEnv(files);
    expect(resolveMatches(env)).toBe(1);
    expect(JSON.parse(written.get(pathOf('unitContent', ch))!)[0].glossary[0].match).toBe(
      'נִבְזֶה וְנִמְאָס',
    );
    expect(lines.error).toHaveLength(2);
  });
});

describe('validate-content', () => {
  /** The demo content with every item marked as approved (`to` true) or not. */
  const withAll = (to: boolean) => {
    const mark = (file: string) =>
      disk.read(file).replaceAll(`"reviewed": ${!to}`, `"reviewed": ${to}`);
    return repoWith({
      [pathOf('portion')]: mark(pathOf('portion')),
      [pathOf('glossary')]: mark(pathOf('glossary')),
      [pathOf('unitContent', ch)]: mark(pathOf('unitContent', ch)),
    }).files;
  };
  const unapproved = () => withAll(false);

  it('passes the demo content once approved, also when strict', () => {
    const { env, lines } = memoryEnv(withAll(true), { vars: { CONTENT_STRICT: '1' } });
    expect(validateContent(env)).toBe(0);
    expect(lines.info.join()).not.toMatch('unreviewed by group');
  });

  it('lists unreviewed items by group, and fails on them only when strict', () => {
    const { env, lines } = memoryEnv(unapproved());
    expect(validateContent(env)).toBe(0);
    expect(lines.info.join('\n')).toMatch(
      /unreviewed by group: LA\.32 \d+, glossary \d+, q \d+, card \d+/,
    );
    expect(validateContent(memoryEnv(unapproved(), { vars: { CONTENT_STRICT: '1' } }).env)).toBe(1);
  });

  it('fails on errors, and reports warnings', () => {
    const missing = memoryEnv(repoWith({ [pathOf('portion')]: null }).files);
    expect(validateContent(missing.env)).toBe(1);
    expect(missing.lines.error.join()).toMatch('is missing');
    const portion = JSON.parse(disk.read(pathOf('portion')));
    portion.boundariesConfirmed = false;
    const { env, lines } = memoryEnv(
      repoWith({ [pathOf('portion')]: JSON.stringify(portion) }).files,
    );
    expect(validateContent(env)).toBe(0);
    expect(lines.warn.join()).toMatch('boundaries not confirmed');
  });

  it('groups items by chapter, glossary, question and card', () => {
    expect(['LA.32.001/biur', 'glossary/x', 'q-l1-a/hint', 'card-1/talk'].map(groupOf)).toEqual([
      'LA.32',
      'glossary',
      'q',
      'card',
    ]);
  });
});

describe('check-overlap', () => {
  const dir = pathOf('shiurim');
  const withReference = (text: string, portion?: string | null) => {
    const { files } = repoWith(portion === undefined ? {} : { [pathOf('portion')]: portion });
    return {
      ...files,
      exists: (rel: string) => rel === dir || files.exists(rel),
      list: () => [`${dir}/a`],
      read: (rel: string) => (rel === `${dir}/a` ? text : files.read(rel)),
    };
  };

  it('skips without a local Shiurim file', () => {
    const { files } = repoWith({ [dir]: null });
    const { env, lines } = memoryEnv(files);
    expect(checkOverlap(env)).toBe(0);
    expect(lines.info[0]).toMatch('skipped');
  });

  it('flags a draft that shares a run with the reference, but not quotations of the text', () => {
    const glossary = JSON.parse(disk.read(pathOf('glossary')));
    const shared = glossary[0].body.value;
    const { env, lines } = memoryEnv(
      withReference(`${shared}\n${disk.read(pathOf('text.he', ch))}`),
    );
    expect(checkOverlap(env)).toBe(1);
    expect(lines.info.filter((l) => l.startsWith('FLAG'))).toHaveLength(1);
    expect(lines.info.join()).toMatch(`FLAG glossary/${glossary[0].id}`);
  });

  it('checks the option texts, and passes when nothing is shared', () => {
    const { env, lines } = memoryEnv(withReference('מילים אחרות לגמרי בלי שום קשר לטקסט'));
    expect(checkOverlap(env)).toBe(0);
    expect(lines.info.join()).toMatch(/\d+ items checked, 0 flagged/);
  });

  it('has nothing to check without a portion', () => {
    const { env, lines } = memoryEnv(withReference('אחת שתיים', null));
    expect(checkOverlap(env, 2)).toBe(0);
    expect(lines.info.join()).toMatch('0 items checked');
  });
});
