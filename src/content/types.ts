// Content model (SPEC §6). Validated at build time by scripts/validate-content.mjs.

export type UnitId = string; // "LA.32.001", or "LA.32.007a" after a later split

export type Unit = {
  id: UnitId;
  seq: number;
  part: 'LA';
  chapter: number;
  paragraph: number;
  text: string;
};

export type DateKey = string;
export type Range = { from: UnitId; to: UnitId };
export type DailySchedule = {
  source: string;
  regular: Record<DateKey, Range[]>;
  leap: Record<DateKey, Range[]>;
};

export type TranslationSpan = {
  from: UnitId;
  to: UnitId;
  text: string;
  sourceId: 'en-resource' | 'sefaria-en';
  sourceSegments?: number[];
  /** Footnotes by number. The text marks each one where it applies, as "[n]". */
  footnotes?: Record<string, string>;
};

export type Reviewed<T> = { value: T; reviewed: boolean; note?: string };

export type UnitContent = {
  id: UnitId;
  biur?: { short?: Reviewed<string> };
  glossary?: { entryId: string; match: string }[];
};

export type GlossaryEntry = {
  id: string;
  term: string;
  body: Reviewed<string>;
  /** Optional source line shown under the ביאור (SPEC §3.1, S3). */
  source?: string;
};

export type TogetherCard = {
  id: string;
  from: UnitId;
  to: UnitId;
  forParent: Reviewed<string>;
  toChild: Reviewed<string>;
  talk?: Reviewed<string>;
};

export type Source = {
  id: 'he-resource' | 'en-resource' | 'sefaria-en';
  path?: string;
  ref?: string;
  versionTitle?: string;
  license: string;
  attribution: string;
  url?: string;
};

export type Question = {
  id: string;
  track: 'solo' | 'together';
  level?: 1 | 2;
  kind: 'choice' | 'trueFalse' | 'findSentence';
  category: 'literal' | 'understanding' | 'concept' | 'child';
  prompt: Reviewed<string>;
  options?: { id: string; text: string }[];
  answer: string;
  unitRef: UnitId;
  hint: Reviewed<string>;
  explanation: Reviewed<string>;
  fixedOrder?: boolean;
};

export type Portion = {
  dateKey: 'adar-09';
  yearType: 'regular';
  label: { he: string };
  location: { he: string; en: string };
  boundariesConfirmed: boolean;
  sources: Source[];
  questions: Question[];
  together: TogetherCard[];
  shinun?: { unitId: UnitId; rounds: number[][] };
};
