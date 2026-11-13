// The app's parameters (app.config.json, served as `virtual:app-config`). Every module reads them
// from here.
import raw from 'virtual:app-config';
import type { DoneTimeline } from './domain/completion';
import type { Progress } from './domain/progress';
import type { QuizRules } from './domain/quiz';
import type { LevelRule } from './domain/reading';
import type { ScoringRules } from './domain/scoring';
import type { Theme } from './domain/theme';
import type { Level } from './domain/types';

export type DemoProgress = Pick<Progress, 'streak' | 'points' | 'heartProgress' | 'familyStreak'>;

export type AppConfig = {
  /** The language of the app: its text, its ביאור and its UI. */
  language: string;
  /** The language of the translation the learner may switch to, and of its ביאור. */
  translationLanguage: string;
  storage: { key: string };
  levels: LevelRule[];
  defaultLevel: Level;
  /** The look before the learner chooses one: "auto" follows the device (S7). */
  defaultTheme: Theme;
  demo: {
    /** The demo starts with this progress, so the screens show a learner in the middle of a streak. */
    initialProgress: DemoProgress;
    estimatedMinutes: number;
    communityLessons: number;
    aboutHeartProgress: number;
  };
  scoring: ScoringRules;
  quiz: QuizRules;
  motion: {
    heartContourMs: number;
    countUpMs: number;
    /** How long a "coming soon" note stays. */
    comingSoonMs: number;
    done: DoneTimeline;
  };
  format: { numberLocale: string };
  text: { bidiNowrapMaxChars: number };
};

export const config = raw as AppConfig;
