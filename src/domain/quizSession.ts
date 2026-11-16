// A quiz in progress, and its transitions. Pure: the store keeps it and applies these.
import { pointsFor, type ScoringRules } from './scoring.ts';
import type { Level, Track } from './types.ts';

export type QuizSession = {
  track: Track;
  /** The questions asked so far, then those to come, at the current level on the solo track. */
  questionIds: string[];
  index: number;
  attempts: Record<string, number>;
  /** The answers chosen for each question, in order (option id, "true"/"false" or unit ID). */
  chosen: Record<string, string[]>;
  solved: Record<string, boolean>;
  earned: number;
  seed: number;
  /** By section ID: the ביאור shown or hidden there by its switch (S2). */
  biur?: Record<string, boolean>;
};

export function startSession(track: Track, questionIds: string[], seed: number): QuizSession {
  return {
    track,
    questionIds,
    index: 0,
    attempts: {},
    chosen: {},
    solved: {},
    earned: 0,
    seed,
  };
}

export type Answer = {
  questionId: string;
  choice: string;
  correct: boolean;
  maxAttempts: number;
  /** The question's level, by which its points are multiplied (S4). */
  level?: Level;
};

/** Records an answer. A solved question, or one with no attempts left, takes no more answers. */
export function answer(s: QuizSession, a: Answer, rules: ScoringRules): QuizSession {
  const chosen = s.chosen[a.questionId] ?? [];
  if (s.solved[a.questionId] || chosen.length >= a.maxAttempts) return s;
  const attempt = chosen.length + 1;
  return {
    ...s,
    chosen: { ...s.chosen, [a.questionId]: [...chosen, a.choice] },
    attempts: { ...s.attempts, [a.questionId]: attempt },
    solved: { ...s.solved, [a.questionId]: a.correct },
    earned: s.earned + (a.correct ? pointsFor(attempt, rules, a.level) : 0),
  };
}

export const nextQuestion = (s: QuizSession): QuizSession => ({ ...s, index: s.index + 1 });

/** Shows or hides the ביאור of one section. */
export const showBiur = (s: QuizSession, section: string, shown: boolean): QuizSession => ({
  ...s,
  biur: { ...s.biur, [section]: shown },
});

/** The questions to ask from now on, at another level; those asked so far stay. */
export const withQuestions = (s: QuizSession, questionIds: string[]): QuizSession => ({
  ...s,
  questionIds,
});

export const currentQuestionId = (s: QuizSession) => s.questionIds[s.index];

export const isLastQuestion = (s: QuizSession) => s.index === s.questionIds.length - 1;

/** A session can be resumed for the same track while it has questions left. */
export const isResumable = (s: QuizSession | null, track: Track) =>
  !!s && s.track === track && s.index < s.questionIds.length;
