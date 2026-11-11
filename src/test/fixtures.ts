// A small portion with every kind of item, for tests: two paragraphs of a made-up chapter
// "LA.1", glossary terms, an English span with a footnote, questions of each kind and two cards.
import type { PortionData } from '../domain/portion';
import type { Question, Reviewed, Unit } from '../domain/types';

export const reviewed = (value: string, ok = false): Reviewed<string> => ({ value, reviewed: ok });

export const units: Unit[] = [
  { id: 'LA.1.001', seq: 1001, part: 'LA', chapter: 1, paragraph: 1, text: 'וְהִנֵּה אַהֲבָה, ' },
  {
    id: 'LA.1.002',
    seq: 1002,
    part: 'LA',
    chapter: 1,
    paragraph: 1,
    text: 'וְהַנֶּפֶשׁ שׁוֹרֶשׁ.',
  },
  { id: 'LA.1.003', seq: 1003, part: 'LA', chapter: 1, paragraph: 2, text: 'אַחִים מַמָּשׁ ' },
  // Continues LA.1.003's sentence.
  {
    id: 'LA.1.004',
    seq: 1004,
    part: 'LA',
    chapter: 1,
    paragraph: 2,
    text: 'אָב אֶחָד.',
    sentence: 'LA.1.003',
  },
];

const q = (over: Partial<Question> & Pick<Question, 'id'>): Question => ({
  track: 'solo',
  level: 1,
  kind: 'choice',
  category: 'literal',
  prompt: reviewed(`prompt ${over.id}`),
  answer: 'a',
  unitRef: 'LA.1.001',
  hint: reviewed(`hint ${over.id}`),
  explanation: reviewed(`explanation ${over.id}`),
  ...over,
});

export const questions: Question[] = [
  q({
    id: 'q-choice',
    options: [
      { id: 'a', text: 'תשובה נכונה' },
      { id: 'b', text: 'תשובה שנייה' },
      { id: 'c', text: 'תשובה שלישית' },
    ],
    fixedOrder: true,
  }),
  q({ id: 'q-find', kind: 'findSentence', answer: 'LA.1.003', unitRef: 'LA.1.003' }),
  q({ id: 'q-tf', kind: 'trueFalse', answer: 'false', summary: true }),
  q({
    id: 'q-l2',
    level: 2,
    category: 'understanding',
    options: [
      { id: 'a', text: 'נכון ברמה 2' },
      { id: 'b', text: 'לא ברמה 2' },
    ],
    fixedOrder: true,
  }),
  q({
    id: 'q-child',
    track: 'together',
    level: undefined,
    category: 'child',
    unitRef: 'LA.1.004',
    options: [
      { id: 'a', text: 'אבא אחד' },
      { id: 'b', text: 'שכונה' },
    ],
    fixedOrder: true,
  }),
  q({
    id: 'q-child-tf',
    track: 'together',
    level: undefined,
    category: 'child',
    kind: 'trueFalse',
    answer: 'true',
  }),
];

export function portionData(): PortionData {
  return {
    language: 'he',
    units,
    schedule: {
      source: 'test',
      regular: { 'day-1': [{ from: 'LA.1.001', to: 'LA.1.004' }] },
      leap: {},
    },
    translations: [
      {
        from: 'LA.1.001',
        to: 'LA.1.002',
        text: 'Love [and soul][1].',
        sourceId: 'en-resource',
        footnotes: { '1': 'A note.' },
      },
      { from: 'LA.1.003', to: 'LA.1.004', text: 'Brothers.', sourceId: 'en-resource' },
    ],
    unitContent: [
      {
        id: 'LA.1.001',
        biur: {
          he: { short: reviewed('ביאור ראשון', true) },
          en: { short: reviewed('The first biur') },
        },
        glossary: [{ entryId: 'ahava', match: 'אַהֲבָה' }],
      },
      {
        id: 'LA.1.002',
        biur: { he: { short: reviewed('ביאור שני') } },
        glossary: [{ entryId: 'missing', match: 'שׁוֹרֶשׁ' }],
      },
    ],
    glossary: [
      { id: 'ahava', term: 'אהבה', body: reviewed('ביאור המילה'), source: 'ויקרא יט, יח' },
      { id: 'plain', term: 'מילה', body: reviewed('בלי מקור') },
    ],
    portion: {
      dateKey: 'day-1',
      yearType: 'regular',
      label: { he: 'שיעור לבדיקה', en: 'Test lesson' },
      location: { he: 'פרק א', en: 'chapter 1' },
      boundariesConfirmed: true,
      sections: [
        { from: 'LA.1.001', to: 'LA.1.002' },
        { from: 'LA.1.003', to: 'LA.1.004' },
      ],
      sources: [
        {
          id: 'he-resource',
          license: 'CC-BY-NC',
          attribution: 'לשון: Kehot (Sefaria).',
          url: 'https://example.org/license',
        },
        { id: 'other', license: 'x', attribution: 'בלי קישור' },
      ],
      questions,
      together: [
        {
          id: 'card-1',
          forParent: reviewed('לאבא 1'),
          toChild: reviewed('לילד 1'),
          talk: reviewed('שיחה 1'),
        },
        {
          id: 'card-2',
          forParent: reviewed('לאבא 2'),
          toChild: reviewed('לילד 2'),
        },
      ],
      shinun: { unitId: 'LA.1.003', rounds: [[], [0], [0, 1]] },
    },
  };
}
