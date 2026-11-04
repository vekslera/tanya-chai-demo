import { complete, pointsFor, type Completion, type Level, type Track } from './logic';

export type QuizState = {
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

export type DemoState = {
  level: Level;
  streak: number;
  points: number;
  heartProgress: number;
  completedLevels: Level[];
  completedTogether: boolean;
  familyStreak: number;
  togetherIndex: number;
  quiz: QuizState | null;
  englishOpen: Record<string, boolean>;
  seenShinun: boolean;
  /** What the completion screen shows and animates. */
  lastCompletion: Completion | null;
};

export const initialState: DemoState = {
  level: 2,
  streak: 12,
  points: 340,
  heartProgress: 62,
  completedLevels: [],
  completedTogether: false,
  familyStreak: 5,
  togetherIndex: -1,
  quiz: null,
  englishOpen: {},
  seenShinun: false,
  lastCompletion: null,
};

export type Action =
  | { type: 'setLevel'; level: Level }
  | { type: 'startQuiz'; track: Track; level?: Level; questionIds: string[]; seed: number }
  | { type: 'answer'; questionId: string; choice: string; correct: boolean; maxAttempts: number }
  | { type: 'nextQuestion' }
  | { type: 'completeQuiz' }
  | { type: 'toggleEnglish'; spanId: string }
  | { type: 'setAllEnglish'; spanIds: string[]; open: boolean }
  | { type: 'setTogetherIndex'; index: number }
  | { type: 'seenShinun' }
  | { type: 'reset' };

export function reducer(state: DemoState, action: Action): DemoState {
  switch (action.type) {
    case 'setLevel':
      return { ...state, level: action.level };

    case 'startQuiz':
      return {
        ...state,
        quiz: {
          track: action.track,
          level: action.level,
          questionIds: action.questionIds,
          index: 0,
          attempts: {},
          chosen: {},
          solved: {},
          earned: 0,
          seed: action.seed,
        },
      };

    case 'answer': {
      const q = state.quiz;
      if (!q) return state;
      const chosen = q.chosen[action.questionId] ?? [];
      if (q.solved[action.questionId] || chosen.length >= action.maxAttempts) return state;
      const attempt = chosen.length + 1;
      return {
        ...state,
        quiz: {
          ...q,
          chosen: { ...q.chosen, [action.questionId]: [...chosen, action.choice] },
          attempts: { ...q.attempts, [action.questionId]: attempt },
          solved: { ...q.solved, [action.questionId]: action.correct },
          earned: q.earned + (action.correct ? pointsFor(attempt) : 0),
        },
      };
    }

    case 'nextQuestion':
      return state.quiz
        ? { ...state, quiz: { ...state.quiz, index: state.quiz.index + 1 } }
        : state;

    case 'completeQuiz': {
      const q = state.quiz;
      if (!q) return state;
      const { progress, completion } = complete(state, q.track, q.level, q.earned);
      return { ...state, ...progress, quiz: null, lastCompletion: completion };
    }

    case 'toggleEnglish':
      return {
        ...state,
        englishOpen: { ...state.englishOpen, [action.spanId]: !state.englishOpen[action.spanId] },
      };

    case 'setAllEnglish':
      return {
        ...state,
        englishOpen: Object.fromEntries(action.spanIds.map((id) => [id, action.open])),
      };

    case 'setTogetherIndex':
      return { ...state, togetherIndex: action.index };

    case 'seenShinun':
      return { ...state, seenShinun: true };

    case 'reset':
      return initialState;
  }
}
