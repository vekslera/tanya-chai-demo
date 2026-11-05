// A quiz in progress, and its transitions. Pure: the store keeps it and applies these.
import { pointsFor, type ScoringRules } from './scoring.ts';
import type { Level, Track } from './types.ts';

export type QuizSession = {
  track: Track;
  level?: Level;
  questionIds: string[];
  index: number;
  attempts: Record<string, number>;
  /** The answers chosen for each question, in order (option id, "true"/"false" or unit ID). */
  chosen: Record<string, string[]>;
  solved: Record<string, boolean>;
  earned: number;
  seed: number;
};

export function startSession(
  track: Track,
  level: Level | undefined,
  questionIds: string[],
  seed: number,
): QuizSession {
  return {
    track,
    level,
    questionIds,
    index: 0,
    attempts: {},
    chosen: {},
    solved: {},
    earned: 0,
    seed,
  };
}

export type Answer = { questionId: string; choice: string; correct: boolean; maxAttempts: number };

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
    earned: s.earned + (a.correct ? pointsFor(attempt, rules) : 0),
  };
}

export const nextQuestion = (s: QuizSession): QuizSession => ({ ...s, index: s.index + 1 });

export const currentQuestionId = (s: QuizSession) => s.questionIds[s.index];

export const isLastQuestion = (s: QuizSession) => s.index === s.questionIds.length - 1;

/** A session can be resumed for the same track and level while it has questions left. */
export const isResumable = (s: QuizSession | null, track: Track, level?: Level) =>
  !!s && s.track === track && s.level === level && s.index < s.questionIds.length;
