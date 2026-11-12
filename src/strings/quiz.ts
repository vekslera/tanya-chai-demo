// The question card's strings, in the language the question is asked in (SPEC S4).
import { en } from './en.ts';
import { he } from './he.ts';

export type QuizStrings = {
  progress: (i: number, n: number) => string;
  summary: string;
  true: string;
  false: string;
  findSentenceHelp: string;
  praise: readonly string[];
  tryAgain: string;
  revealed: string;
  fromText: string;
  next: string;
  finish: string;
  points: (n: number) => string;
  chosenWrong: string;
};

const byLanguage: Record<string, QuizStrings> = { he: he.quiz, en: en.quiz };

/** The question card's strings in a language: its own, or the app's when it has none. */
export const quizStrings = (language: string): QuizStrings => byLanguage[language] ?? he.quiz;
