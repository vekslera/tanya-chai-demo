// @vitest-environment node
// Every rule of the validator, each broken once in a copy of the real chapter.
import { describe, expect, it } from 'vitest';
import { contentRules } from '../config.ts';
import { diskFiles } from '../env.ts';
import { loadChapter, type ChapterLayers } from '../load.ts';
import { validate } from './index.ts';

const real = loadChapter(diskFiles());

/** The findings after `change` is applied to a copy of the chapter. */
function after(change: (all: ChapterLayers) => void, opts: Parameters<typeof validate>[1] = {}) {
  const all = structuredClone(real);
  change(all);
  return validate(all, opts);
}
const errorsAfter = (change: (all: ChapterLayers) => void) => after(change).errors.join('\n');
const warningsAfter = (change: (all: ChapterLayers) => void) => after(change).warnings.join('\n');
const portion = (all: ChapterLayers) => all.portion!;
const q = (all: ChapterLayers, id: string) => portion(all).questions.find((x) => x.id === id)!;

describe('the demo chapter', () => {
  it('passes every rule', () => {
    expect(validate(real)).toEqual({ errors: [], warnings: [] });
  });
});

describe('units and schedule', () => {
  it('stops at unit errors', () => {
    expect(after((a) => (a.errors = ['broken'])).errors).toEqual(['broken']);
  });

  it('checks the schedule ranges', () => {
    expect(
      errorsAfter((a) => (a.schedule.leap['x'] = [{ from: 'LA.32.002', to: 'LA.32.001' }])),
    ).toMatch('schedule leap.x[0]: LA.32.002 is after LA.32.001');
    expect(
      errorsAfter((a) => (a.schedule.regular['x'] = [{ from: 'LA.99.001', to: 'LA.32.001' }])),
    ).toMatch('unknown unit LA.99.001');
    expect(after((a) => delete (a.schedule as Partial<typeof a.schedule>).leap).errors).toEqual([]);
  });
});

describe('translations', () => {
  it('warns about missing English, and fails on it when strict', () => {
    expect(warningsAfter((a) => (a.translations = null))).toMatch('no English translation yet');
    expect(after((a) => (a.translations = null), { strict: true }).errors.join()).toMatch(
      'no English',
    );
  });

  it('reports the resource’s own errors', () => {
    expect(errorsAfter((a) => a.enResource!.errors.push('bad line'))).toMatch(
      'English resource: bad line',
    );
  });

  it('checks each span', () => {
    const span = (a: ChapterLayers) => a.translations![0]!;
    expect(errorsAfter((a) => (span(a).text = ' '))).toMatch('translation[0]: empty text');
    expect(errorsAfter((a) => ((span(a).text as unknown) = undefined))).toMatch('empty text');
    expect(errorsAfter((a) => (span(a).text = '<b>x</b>'))).toMatch('contains HTML tags');
    expect(errorsAfter((a) => (span(a).text += '!'))).toMatch(
      'not verbatim from the English resource',
    );
    expect(errorsAfter((a) => delete span(a).footnotes)).toMatch('has no footnote');
    expect(errorsAfter((a) => (span(a).footnotes!['1'] = 'x'))).toMatch(
      'footnote [1] is not verbatim',
    );
    expect(errorsAfter((a) => (span(a).footnotes!['77'] = 'x'))).toMatch(
      'footnote [77] is not marked',
    );
  });

  it('accepts spans from another source, without a resource to compare', () => {
    const errors = errorsAfter((a) => {
      a.enResource = null;
      a.translations![0]!.sourceId = 'he-resource';
    });
    expect(errors).toBe('');
  });

  it('covers each unit exactly once', () => {
    expect(errorsAfter((a) => a.translations!.pop())).toMatch(/LA\.32\.0\d\d covered 0 times/);
    expect(errorsAfter((a) => a.translations!.push(a.translations![0]!))).toMatch(
      'covered 2 times',
    );
    expect(errorsAfter((a) => (a.translations![0]!.to = 'LA.99.001'))).toMatch('unknown unit');
  });
});

describe('glossary and ביאור', () => {
  it('checks the glossary entries', () => {
    expect(errorsAfter((a) => a.glossary.push({ ...a.glossary[0]! }))).toMatch(
      'glossary: duplicate id',
    );
    expect(errorsAfter((a) => (a.glossary[0]!.term = ''))).toMatch('no term');
    expect(errorsAfter((a) => ((a.glossary[0]!.body as unknown) = 'x'))).toMatch(
      'body is not a Reviewed',
    );
  });

  it('checks the unit content', () => {
    const c = (a: ChapterLayers) => a.unitContent[0]!;
    expect(errorsAfter((a) => a.unitContent.push({ ...c(a) }))).toMatch('content: duplicate');
    expect(errorsAfter((a) => (c(a).id = 'LA.99.001'))).toMatch('content: unknown unit');
    expect(errorsAfter((a) => ((c(a).biur!.short as unknown) = 'x'))).toMatch(
      'biur is not a Reviewed',
    );
    expect(errorsAfter((a) => (c(a).glossary![0]!.entryId = 'nope'))).toMatch(
      'unknown glossary entry',
    );
    expect(errorsAfter((a) => (c(a).glossary![0]!.match = 'אין'))).toMatch('not in the unit text');
    const long = Array(contentRules.biurMaxWords + 1)
      .fill('מילה')
      .join(' ');
    expect(warningsAfter((a) => (c(a).biur!.short!.value = long))).toMatch('biur has');
  });

  it('accepts content without ביאור or glossary', () => {
    expect(after((a) => (a.unitContent = [{ id: a.unitContent[0]!.id }])).errors).toEqual([]);
  });
});

describe('portion', () => {
  it('needs a portion with a usable day', () => {
    expect(errorsAfter((a) => (a.portion = null))).toMatch('is missing');
    expect(errorsAfter((a) => (portion(a).dateKey = 'nope'))).toMatch('no usable schedule entry');
    expect(errorsAfter((a) => (a.schedule.regular['adar-09']![0]!.to = 'LA.99.001'))).toMatch(
      'no usable schedule entry',
    );
  });

  it('warns about unconfirmed boundaries and missing ביאור', () => {
    expect(warningsAfter((a) => (portion(a).boundariesConfirmed = false))).toMatch('not confirmed');
    expect(warningsAfter((a) => delete a.unitContent[0]!.biur)).toMatch('has no short biur');
  });

  it('checks the sources', () => {
    expect(errorsAfter((a) => (portion(a).sources[0]!.license = ''))).toMatch(
      'license and attribution',
    );
    expect(errorsAfter((a) => (portion(a).sources = []))).toMatch('has no attribution');
    expect(
      errorsAfter((a) => delete (portion(a) as Partial<ReturnType<typeof portion>>).sources),
    ).toMatch('has no attribution');
  });
});

describe('questions', () => {
  it('checks each question', () => {
    expect(errorsAfter((a) => portion(a).questions.push({ ...q(a, 'q-l1-easy-way') }))).toMatch(
      'duplicate id',
    );
    expect(errorsAfter((a) => ((q(a, 'q-l1-easy-way').hint as unknown) = 'x'))).toMatch(
      'hint is not a Reviewed',
    );
    expect(errorsAfter((a) => (q(a, 'q-l1-easy-way').unitRef = 'LA.32.040'))).toMatch(
      'outside the portion',
    );
    expect(errorsAfter((a) => (q(a, 'q-l1-easy-way').unitRef = 'LA.99.001'))).toMatch(
      'unknown unit',
    );
  });

  it('checks the answers of each kind', () => {
    const choice = (a: ChapterLayers) => q(a, 'q-l1-easy-way');
    expect(errorsAfter((a) => choice(a).options!.push({ ...choice(a).options![1]! }))).toMatch(
      'duplicate option ids',
    );
    expect(errorsAfter((a) => (choice(a).answer = 'z'))).toMatch('exactly one correct option');
    expect(errorsAfter((a) => (choice(a).options = choice(a).options!.slice(0, 2)))).toMatch(
      '2 options (expected',
    );
    expect(errorsAfter((a) => delete choice(a).options)).toMatch('0 options');
    expect(errorsAfter((a) => (q(a, 'q-l1-bodies').answer = 'yes'))).toMatch('"true" or "false"');
    expect(errorsAfter((a) => (q(a, 'q-l1-brothers').answer = 'LA.32.040'))).toMatch(
      'answer LA.32.040 is outside',
    );
    expect(errorsAfter((a) => (q(a, 'q-l1-brothers').answer = 'LA.99.001'))).toMatch(
      'unknown unit',
    );
    expect(errorsAfter((a) => ((q(a, 'q-l1-bodies').kind as string) = 'essay'))).toMatch(
      'unknown kind essay',
    );
  });

  it('checks the set of each level and of Avos uBanim', () => {
    expect(errorsAfter((a) => (q(a, 'q-l1-easy-way').category = 'concept'))).toMatch(
      'level 1 needs exactly 3 literal question(s)',
    );
    expect(errorsAfter((a) => (q(a, 'q-l2-why-easy').level = 1))).toMatch('level 2 needs exactly');
    const child = (a: ChapterLayers) => q(a, 'q-c-hillel');
    expect(errorsAfter((a) => (child(a).category = 'literal'))).toMatch(
      'together questions are category "child"',
    );
    expect(errorsAfter((a) => (child(a).kind = 'findSentence'))).toMatch('choice or trueFalse');
    expect(errorsAfter((a) => (child(a).track = 'solo'))).toMatch('together track has 2 questions');
  });
});

describe('cards and Shinun', () => {
  const card = (a: ChapterLayers, i = 0) => portion(a).together[i]!;

  it('checks each card', () => {
    expect(errorsAfter((a) => ((card(a).toChild as unknown) = 'x'))).toMatch(
      'toChild is not a Reviewed',
    );
    expect(errorsAfter((a) => ((card(a, 1).talk as unknown) = 'x'))).toMatch(
      'talk is not a Reviewed',
    );
    const long = Array(contentRules.cards.maxWords['toChild']! + 1)
      .fill('מילה')
      .join(' ');
    expect(warningsAfter((a) => (card(a).toChild.value = long))).toMatch('toChild has');
    expect(after((a) => ((card(a).forParent as unknown) = undefined)).errors.join()).toMatch(
      'forParent',
    );
  });

  it('checks the number of cards, their coverage and their talks', () => {
    expect(errorsAfter((a) => (portion(a).together = portion(a).together.slice(0, 5)))).toMatch(
      '5 cards',
    );
    expect(errorsAfter((a) => (card(a).to = card(a).from))).toMatch('do not cover the portion');
    expect(errorsAfter((a) => (card(a).to = 'LA.99.001'))).toMatch('unknown unit');
    expect(warningsAfter((a) => portion(a).together.forEach((c) => delete c.talk))).toMatch(
      '0 cards with a talk',
    );
    expect(
      errorsAfter((a) => delete (portion(a) as Partial<ReturnType<typeof portion>>).together),
    ).toMatch('0 cards');
  });

  it('checks the Shinun sentence', () => {
    expect(after((a) => delete portion(a).shinun).errors).toEqual([]);
    expect(errorsAfter((a) => (portion(a).shinun!.rounds = [[999]]))).toMatch(
      'word index out of range',
    );
    expect(errorsAfter((a) => (portion(a).shinun!.rounds = [[1.5]]))).toMatch('out of range');
    expect(errorsAfter((a) => ((portion(a).shinun!.rounds as unknown) = 'x'))).toMatch(
      'rounds must be an array',
    );
    expect(errorsAfter((a) => (portion(a).shinun!.unitId = 'LA.99.001'))).toMatch(
      'shinun: unknown unit',
    );
  });
});
