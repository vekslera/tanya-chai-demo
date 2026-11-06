import { act, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { memoryStorage } from '../adapters/memoryStorage';
import { config } from '../config';
import { createPersistence } from './persistence';
import { createReducer, initialStateFrom, type DemoState } from './state';
import { StoreProvider, useStore } from './StoreProvider';

const initialState = initialStateFrom(config);
const reducer = createReducer({ scoring: config.scoring, initialState });

describe('initialStateFrom', () => {
  it('starts from the configured demo progress and level', () => {
    expect(initialState).toMatchObject({
      ...config.demo.initialProgress,
      level: config.defaultLevel,
      completedLevels: [],
      togetherIndex: -1,
      quiz: null,
    });
  });
});

describe('reducer', () => {
  const started = reducer(initialState, {
    type: 'startQuiz',
    track: 'solo',
    level: 1,
    questionIds: ['q1', 'q2'],
    seed: 1,
  });

  it('runs a quiz from start to completion', () => {
    let s = reducer(started, {
      type: 'answer',
      questionId: 'q1',
      choice: 'a',
      correct: true,
      maxAttempts: 2,
    });
    s = reducer(s, { type: 'nextQuestion' });
    expect(s.quiz).toMatchObject({ index: 1, earned: config.scoring.pointsByAttempt[0] });
    s = reducer(s, { type: 'completeQuiz' });
    expect(s.quiz).toBeNull();
    expect(s.completedLevels).toEqual([1]);
    expect(s.lastCompletion?.awarded).toBe(true);
  });

  it('ignores quiz actions without a quiz', () => {
    for (const action of [
      { type: 'answer', questionId: 'q', choice: 'a', correct: true, maxAttempts: 2 },
      { type: 'nextQuestion' },
      { type: 'completeQuiz' },
    ] as const) {
      expect(reducer(initialState, action)).toBe(initialState);
    }
  });

  it('handles the other actions', () => {
    let s: DemoState = reducer(initialState, { type: 'setLevel', level: 1 });
    expect(s.level).toBe(1);
    s = reducer(s, { type: 'toggleEnglish', spanId: 'x' });
    expect(s.englishOpen).toEqual({ x: true });
    s = reducer(s, { type: 'toggleEnglish', spanId: 'x' });
    expect(s.englishOpen).toEqual({ x: false });
    s = reducer(s, { type: 'setAllEnglish', spanIds: ['x', 'y'], open: true });
    expect(s.englishOpen).toEqual({ x: true, y: true });
    s = reducer(s, { type: 'setTogetherIndex', index: 3 });
    expect(s.togetherIndex).toBe(3);
    s = reducer(s, { type: 'seenShinun' });
    expect(s.seenShinun).toBe(true);
    expect(reducer(s, { type: 'reset' })).toBe(initialState);
  });
});

describe('persistence', () => {
  const key = 'k';

  it('round-trips the state', () => {
    const storage = memoryStorage();
    const p = createPersistence(storage, key, initialState);
    p.save({ ...initialState, points: 999 });
    expect(p.load().points).toBe(999);
  });

  it('falls back to the initial state on missing or broken data', () => {
    for (const raw of [undefined, 'not json', 'null', '7']) {
      const storage = memoryStorage(raw === undefined ? {} : { [key]: raw });
      expect(createPersistence(storage, key, initialState).load()).toBe(initialState);
    }
  });

  it('fills fields added since the state was saved', () => {
    const storage = memoryStorage({ [key]: JSON.stringify({ points: 5 }) });
    expect(createPersistence(storage, key, initialState).load()).toMatchObject({
      points: 5,
      seenShinun: false,
    });
  });
});

function Points() {
  const { state, dispatch } = useStore();
  return (
    <button type="button" onClick={() => dispatch({ type: 'setLevel', level: 1 })}>
      {state.points}:{state.level}
    </button>
  );
}

describe('StoreProvider', () => {
  it('loads, dispatches and saves', async () => {
    const storage = memoryStorage();
    const persistence = createPersistence(storage, config.storage.key, initialState);
    render(
      <StoreProvider reducer={reducer} persistence={persistence}>
        <Points />
      </StoreProvider>,
    );
    await act(async () => screen.getByRole('button').click());
    expect(screen.getByRole('button').textContent).toBe(`${initialState.points}:1`);
    expect(JSON.parse(storage.get(config.storage.key)!).level).toBe(1);
  });

  it('requires a provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Points />)).toThrow('useStore outside StoreProvider');
    vi.restoreAllMocks();
  });
});
