// The demo's state and its reducer. The rules (scoring, the starting state) are passed in, so the
// reducer reads no config of its own.
import type { AppConfig } from '../config';
import { complete, type Completion, type Progress } from '../domain/progress';
import {
  answer,
  nextQuestion,
  showBiur,
  startSession,
  withQuestions,
  type Answer,
  type QuizSession,
} from '../domain/quizSession';
import type { ScoringRules } from '../domain/scoring';
import type { Theme } from '../domain/theme';
import { INTRO_INDEX } from '../domain/together';
import type { Level, Track } from '../domain/types';

export type DemoState = Progress & {
  /** The level of the current section and the next ones (S2). */
  level: Level;
  togetherIndex: number;
  quiz: QuizSession | null;
  /** Whether the lesson is read with its English: the translation, and its ביאור. */
  english: boolean;
  /** Light or dark, or the device's own mode (S7). */
  theme: Theme;
  seenShinun: boolean;
  /** What the completion screen shows and animates. */
  lastCompletion: Completion | null;
};

export function initialStateFrom({
  defaultLevel,
  defaultTheme,
  demo,
}: Pick<AppConfig, 'defaultLevel' | 'defaultTheme' | 'demo'>): DemoState {
  return {
    ...demo.initialProgress,
    level: defaultLevel,
    completedSolo: false,
    completedTogether: false,
    togetherIndex: INTRO_INDEX,
    quiz: null,
    english: false,
    theme: defaultTheme,
    seenShinun: false,
    lastCompletion: null,
  };
}

export type Action =
  /** The current section's switch (S2): the level from now on, and the questions it asks. */
  | { type: 'setLevel'; level: Level; questionIds: string[] }
  /** Any section's switch: whether that section shows its ביאור. */
  | { type: 'showBiur'; section: string; shown: boolean }
  | { type: 'startQuiz'; track: Track; questionIds: string[]; seed: number }
  | ({ type: 'answer' } & Answer)
  | { type: 'nextQuestion' }
  | { type: 'completeQuiz' }
  | { type: 'toggleEnglish' }
  | { type: 'setTheme'; theme: Theme }
  | { type: 'setTogetherIndex'; index: number }
  | { type: 'seenShinun' }
  | { type: 'reset' };

export type StoreRules = { scoring: ScoringRules; initialState: DemoState };
export type Reducer = (state: DemoState, action: Action) => DemoState;

export function createReducer({ scoring, initialState }: StoreRules): Reducer {
  return (state, action) => {
    switch (action.type) {
      case 'setLevel':
        return {
          ...state,
          level: action.level,
          quiz: state.quiz && withQuestions(state.quiz, action.questionIds),
        };
      case 'showBiur':
        return state.quiz
          ? { ...state, quiz: showBiur(state.quiz, action.section, action.shown) }
          : state;
      case 'startQuiz':
        return { ...state, quiz: startSession(action.track, action.questionIds, action.seed) };
      case 'answer':
        return state.quiz ? { ...state, quiz: answer(state.quiz, action, scoring) } : state;
      case 'nextQuestion':
        return state.quiz ? { ...state, quiz: nextQuestion(state.quiz) } : state;
      case 'completeQuiz': {
        const q = state.quiz;
        if (!q) return state;
        const { progress, completion } = complete(state, q.track, q.earned, scoring);
        return { ...state, ...progress, quiz: null, lastCompletion: completion };
      }
      case 'toggleEnglish':
        return { ...state, english: !state.english };
      case 'setTheme':
        return { ...state, theme: action.theme };
      case 'setTogetherIndex':
        return { ...state, togetherIndex: action.index };
      case 'seenShinun':
        return { ...state, seenShinun: true };
      case 'reset':
        // Starting over clears the progress, not the chosen look.
        return { ...initialState, theme: state.theme };
    }
  };
}
