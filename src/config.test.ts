// app.config.json reaches the app untyped (virtual:app-config); this checks its shape, so a typo
// in the file fails here rather than at runtime.
import { describe, expect, it } from 'vitest';
import { memoryStorage } from './adapters/memoryStorage';
import { createDeps, browserAdapters } from './composition';
import { config } from './config';
import { he } from './strings/he';

const isNumber = (x: unknown) => typeof x === 'number' && Number.isFinite(x);

describe('app config', () => {
  it('has every parameter, with the right type', () => {
    expect(typeof config.storage.key).toBe('string');
    expect(config.levels.length).toBeGreaterThan(0);
    expect(config.levels.map((l) => l.id)).toContain(config.defaultLevel);
    for (const l of config.levels) expect(typeof l.showBiur).toBe('boolean');
    const { initialProgress, ...demo } = config.demo;
    for (const x of [...Object.values(initialProgress), ...Object.values(demo)]) {
      expect(isNumber(x)).toBe(true);
    }
    expect(config.scoring.pointsByAttempt.every(isNumber)).toBe(true);
    for (const x of [
      config.scoring.completionBonus,
      config.scoring.heartStep,
      config.scoring.heartMax,
    ]) {
      expect(isNumber(x)).toBe(true);
    }
    expect(isNumber(config.quiz.solo.maxAttempts)).toBe(true);
    expect(isNumber(config.quiz.findSentence.choices)).toBe(true);
    expect(typeof config.quiz.together.retryUntilCorrect).toBe('boolean');
    expect(isNumber(config.motion.heartContourMs)).toBe(true);
    expect(isNumber(config.motion.countUpMs)).toBe(true);
    expect(Object.values(config.motion.done).every(isNumber)).toBe(true);
    expect(() => (1).toLocaleString(config.format.numberLocale)).not.toThrow();
    expect(isNumber(config.text.bidiNowrapMaxChars)).toBe(true);
  });

  it('has a title and description for every configured level', () => {
    for (const { id } of config.levels) expect(he.level.options[id]?.title).toBeTruthy();
  });
});

describe('composition', () => {
  it('wires the browser adapters', async () => {
    const deps = createDeps(browserAdapters());
    expect((await deps.loadPortion()).units.length).toBeGreaterThan(0);
    expect(deps.store.persistence.load().level).toBe(config.defaultLevel);
  });

  it('keeps a build under a sub-path apart from the root build', () => {
    const storage = memoryStorage();
    const adapters = { ...browserAdapters(), storage };
    createDeps(adapters, config, '/dev/').store.persistence.save({ points: 7 } as never);
    expect(storage.get(`${config.storage.key}@/dev/`)).toMatch('"points":7');
    expect(storage.get(config.storage.key)).toBeNull();
    expect(createDeps(adapters, config, '/').store.persistence.load().points).not.toBe(7);
  });
});
