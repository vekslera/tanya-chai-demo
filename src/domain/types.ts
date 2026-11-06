// Content model (SPEC §6). Validated at build time by scripts/validate-content.mjs.

export type UnitId = string; // "LA.32.001", or "LA.32.007a" after a later split

/** A chapter of a part of Tanya, e.g. { part: 'LA', chapter: 32 }. */
export type ChapterRef = { part: string; chapter: number };

export type Unit = ChapterRef & {
  id: UnitId;
  seq: number;
  paragraph: number;
  text: string;
};

export type DateKey = string;
export const YEAR_TYPES = ['regular', 'leap'] as const;
export type YearType = (typeof YEAR_TYPES)[number];
export type Range = { from: UnitId; to: UnitId };
export type DailySchedule = { source: string } & Record<YearType, Record<DateKey, Range[]>>;

export type TranslationSpan = Range & {
  text: string;
  sourceId: string;
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

export type TogetherCard = Range & {
  id: string;
  forParent: Reviewed<string>;
  toChild: Reviewed<string>;
  talk?: Reviewed<string>;
};

export type Source = {
  id: string;
  path?: string;
  ref?: string;
  versionTitle?: string;
  license: string;
  attribution: string;
  url?: string;
};

/** A learning level, as listed in app.config.json. */
export type Level = number;
export type Track = 'solo' | 'together';

export type Question = {
  id: string;
  track: Track;
  level?: Level;
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
  dateKey: DateKey;
  yearType: YearType;
  label: { he: string };
  location: { he: string; en: string };
  boundariesConfirmed: boolean;
  sources: Source[];
  questions: Question[];
  together: TogetherCard[];
  shinun?: { unitId: UnitId; rounds: number[][] };
};
