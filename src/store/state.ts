// The demo's state and its reducer. The rules (scoring, the starting state) are passed in, so the
// reducer reads no config of its own.
import type { AppConfig } from '../config';
import { complete, type Completion, type Progress } from '../domain/progress';
import {
  answer,
  nextQuestion,
  startSession,
  type Answer,
  type QuizSession,
} from '../domain/quizSession';
import type { ScoringRules } from '../domain/scoring';
import { INTRO_INDEX } from '../domain/together';
import type { Level, Track } from '../domain/types';

export type DemoState = Progress & {
  level: Level;
  togetherIndex: number;
  quiz: QuizSession | null;
  /** Whether each section's English is shown, by section ID. */
  englishOpen: Record<string, boolean>;
  seenShinun: boolean;
  /** What the completion screen shows and animates. */
  lastCompletion: Completion | null;
};

export function initialStateFrom({
  defaultLevel,
  demo,
}: Pick<AppConfig, 'defaultLevel' | 'demo'>): DemoState {
  return {
    ...demo.initialProgress,
    level: defaultLevel,
    completedLevels: [],
    completedTogether: false,
    togetherIndex: INTRO_INDEX,
    quiz: null,
    englishOpen: {},
    seenShinun: false,
    lastCompletion: null,
  };
}

export type Action =
  | { type: 'setLevel'; level: Level }
  | { type: 'startQuiz'; track: Track; level?: Level; questionIds: string[]; seed: number }
  | ({ type: 'answer' } & Answer)
  | { type: 'nextQuestion' }
  | { type: 'completeQuiz' }
  | { type: 'toggleEnglish'; sectionId: string }
  | { type: 'setAllEnglish'; sectionIds: string[]; open: boolean }
  | { type: 'setTogetherIndex'; index: number }
  | { type: 'seenShinun' }
  | { type: 'reset' };

export type StoreRules = { scoring: ScoringRules; initialState: DemoState };
export type Reducer = (state: DemoState, action: Action) => DemoState;

export function createReducer({ scoring, initialState }: StoreRules): Reducer {
  return (state, action) => {
    switch (action.type) {
      case 'setLevel':
        return { ...state, level: action.level };
      case 'startQuiz':
        return {
          ...state,
          quiz: startSession(action.track, action.level, action.questionIds, action.seed),
        };
      case 'answer':
        return state.quiz ? { ...state, quiz: answer(state.quiz, action, scoring) } : state;
      case 'nextQuestion':
        return state.quiz ? { ...state, quiz: nextQuestion(state.quiz) } : state;
      case 'completeQuiz': {
        const q = state.quiz;
        if (!q) return state;
        const { progress, completion } = complete(state, q.track, q.level, q.earned, scoring);
        return { ...state, ...progress, quiz: null, lastCompletion: completion };
      }
      case 'toggleEnglish':
        return {
          ...state,
          englishOpen: {
            ...state.englishOpen,
            [action.sectionId]: !state.englishOpen[action.sectionId],
          },
        };
      case 'setAllEnglish':
        return {
          ...state,
          englishOpen: Object.fromEntries(action.sectionIds.map((id) => [id, action.open])),
        };
      case 'setTogetherIndex':
        return { ...state, togetherIndex: action.index };
      case 'seenShinun':
        return { ...state, seenShinun: true };
      case 'reset':
        return initialState;
    }
  };
}
