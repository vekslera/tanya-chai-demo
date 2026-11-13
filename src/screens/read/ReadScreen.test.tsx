import { screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { memoryStorage } from '../../adapters/memoryStorage';
import { config } from '../../config';
import { startSession } from '../../domain/quizSession';
import { ROUTES } from '../../routes';
import { en } from '../../strings/en';
import { he } from '../../strings/he';
import { portionData } from '../../test/fixtures';
import { button, click, hash, renderApp } from '../../test/renderApp';

/** Storage with the questions of a level under way, at question `index`. */
const reading = (questionIds = ['q-choice', 'q-find', 'q-tf'], level = 1, index = 0) =>
  memoryStorage({
    [config.storage.key]: JSON.stringify({
      level,
      quiz: { ...startSession('solo', questionIds, 1), index },
    }),
  });
/** The ביאור switch of each section shown, and whether it is on. */
const switches = () => screen.getAllByRole('switch', { name: he.read.biurSwitch });
const checked = () => switches().map((s) => s.getAttribute('aria-checked'));
const saved = (storage: { get(key: string): string | null }) =>
  JSON.parse(storage.get(config.storage.key)!);
const option = (text: string) => button(new RegExp(text));
const sentence = (id: string) => document.querySelector(`button[data-unit="${id}"]`)!;
const shownSections = () =>
  [...document.querySelectorAll('.read-section')].map((s) => s.getAttribute('data-section'));
/** The sentences offered by a findSentence question, other than the answer (LA.1.003). */
const wrongSentences = () =>
  [...document.querySelectorAll<HTMLElement>('button[data-unit]')].filter(
    (b) => b.dataset.unit !== 'LA.1.003',
  );

afterEach(() => {
  delete (Element.prototype as { scrollIntoView?: unknown }).scrollIntoView;
});

describe('ReadScreen', () => {
  it('leaves for the home screen without questions under way', async () => {
    await renderApp(ROUTES.read);
    expect(hash()).toBe(ROUTES.home);
  });

  it('shows the ביאור on level 2 only', async () => {
    const { unmount } = await renderApp(ROUTES.read, { storage: reading(['q-l2'], 2) });
    expect(screen.getByText('ביאור ראשון')).toBeTruthy();
    unmount();
    await renderApp(ROUTES.read, { storage: reading(['q-choice'], 1) });
    expect(screen.queryByText('ביאור ראשון')).toBeNull();
  });

  it('heads each section with its number and its ביאור switch, with a tip the first time', async () => {
    const { storage } = await renderApp(ROUTES.read, { storage: reading() });
    expect(screen.getByText(he.read.section(1, 2))).toBeTruthy();
    expect(checked()).toEqual(['false']);
    expect(screen.getByText(he.read.biurTip)).toBeTruthy();
    await click(switches()[0]!);
    expect(screen.queryByText(he.read.biurTip)).toBeNull();
    expect(saved(storage).seenBiurTip).toBe(true);
  });

  it('turns the current section’s ביאור on before its question: the question follows', async () => {
    const { storage } = await renderApp(ROUTES.read, { storage: reading() });
    expect(screen.queryByText('ביאור ראשון')).toBeNull();
    expect(screen.queryByText(he.quiz.factor(2))).toBeNull();
    await click(switches()[0]!);
    expect(checked()).toEqual(['true']);
    expect(screen.getByText('ביאור ראשון')).toBeTruthy();
    // The level-2 question of this section, at double points.
    expect(screen.getByText('prompt q-l2')).toBeTruthy();
    expect(screen.getByText(he.quiz.progress(1, 2))).toBeTruthy();
    expect(screen.getByText(he.quiz.factor(2))).toBeTruthy();
    expect(saved(storage).level).toBe(2);
    await click(option('נכון ברמה 2'));
    const points = config.scoring.pointsByAttempt[0]! * config.scoring.levelFactor[2]!;
    expect(screen.getByText(he.quiz.points(points))).toBeTruthy();
    // And off again: back to level 1, for the next question.
    await click(switches()[0]!);
    expect(screen.queryByText('ביאור ראשון')).toBeNull();
    expect(saved(storage).level).toBe(1);
    expect(saved(storage).quiz.questionIds).toEqual(['q-l2', 'q-find', 'q-tf']);
  });

  it('keeps a question already tried; the new level applies from the next one', async () => {
    Element.prototype.scrollIntoView = vi.fn();
    const { storage } = await renderApp(ROUTES.read, { storage: reading() });
    await click(option('תשובה שנייה'));
    await click(switches()[0]!);
    expect(screen.getByText('ביאור ראשון')).toBeTruthy();
    expect(screen.getByText('prompt q-choice')).toBeTruthy();
    expect(saved(storage).quiz.questionIds).toEqual(['q-choice', 'q-l2-tf']);
    await click(option('תשובה נכונה'));
    await click(button(he.quiz.next));
    // The next section opens at level 2, with its question.
    expect(checked()).toEqual(['true', 'true']);
    expect(screen.getByText('prompt q-l2-tf')).toBeTruthy();
    expect(screen.getByText(he.quiz.summary)).toBeTruthy();
    expect(screen.getByText(he.quiz.factor(2))).toBeTruthy();
  });

  it('lets an earlier section be read with or without its ביאור, changing only that section', async () => {
    const { storage } = await renderApp(ROUTES.read, { storage: reading(undefined, 1, 1) });
    // Each section shows the level its question was asked at.
    expect(checked()).toEqual(['false', 'false']);
    await click(switches()[0]!);
    expect(checked()).toEqual(['true', 'false']);
    expect(screen.getByText('ביאור ראשון')).toBeTruthy();
    expect(saved(storage)).toMatchObject({
      level: 1,
      quiz: { questionIds: ['q-choice', 'q-find', 'q-tf'], index: 1 },
    });
    await click(switches()[0]!);
    expect(screen.queryByText('ביאור ראשון')).toBeNull();
  });

  it('opens each section after the question before it, to the summary and the finish', async () => {
    Element.prototype.scrollIntoView = vi.fn();
    const { storage } = await renderApp(ROUTES.read, { storage: reading() });
    expect(shownSections()).toEqual(['LA.1.001']);
    expect(screen.getByText(he.quiz.progress(1, 3))).toBeTruthy();
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('0');

    // A wrong answer: a hint; the same answer twice counts once; then the answer is revealed.
    await click(option('תשובה שנייה'));
    expect(screen.getByText(he.quiz.tryAgain)).toBeTruthy();
    expect(screen.getByText('hint q-choice')).toBeTruthy();
    expect(document.querySelector('.option--shake')).toBeTruthy();
    await click(option('תשובה שנייה'));
    await click(option('תשובה שלישית'));
    expect(screen.getByText(he.quiz.revealed)).toBeTruthy();
    expect(screen.getByText('תשובה נכונה', { selector: 'strong' })).toBeTruthy();
    expect(screen.getByText('explanation q-choice')).toBeTruthy();

    // The next section opens, scrolled into view, with its question among the sentences read.
    await click(button(he.quiz.next));
    expect(shownSections()).toEqual(['LA.1.001', 'LA.1.003']);
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
    expect(screen.getByText(he.quiz.findSentenceHelp)).toBeTruthy();
    expect(document.querySelectorAll('button[data-unit]')).toHaveLength(
      config.quiz.findSentence.choices,
    );
    await click(wrongSentences()[0]!);
    expect(document.querySelector('.compact-block--hint')).toBeTruthy();
    await click(sentence('LA.1.003'));
    expect(screen.getByText(he.quiz.praise[1]!)).toBeTruthy();

    // The summary question follows the last section; true and false are labelled.
    await click(button(he.quiz.next));
    expect(shownSections()).toEqual(['LA.1.001', 'LA.1.003']);
    expect(screen.getByText(he.quiz.summary)).toBeTruthy();
    await click(button(he.quiz.true));
    expect(button(`${he.quiz.true} (${he.quiz.chosenWrong})`)).toBeTruthy();
    await click(button(he.quiz.false));
    expect(screen.getByText(he.quiz.points(config.scoring.pointsByAttempt[1]!))).toBeTruthy();
    await click(button(he.quiz.finish));
    expect(hash()).toBe(ROUTES.done);
    expect(saved(storage).completedSolo).toBe(true);
  });

  it('praises a correct answer with its points', async () => {
    await renderApp(ROUTES.read, { storage: reading() });
    await click(option('תשובה נכונה'));
    expect(screen.getByText(he.quiz.praise[0]!)).toBeTruthy();
    expect(screen.getByText(he.quiz.points(config.scoring.pointsByAttempt[0]!))).toBeTruthy();
    expect(document.querySelector('.option--shake')).toBeNull();
  });

  it('reveals a findSentence answer among the sentences themselves', async () => {
    await renderApp(ROUTES.read, { storage: reading(['q-find']) });
    const [first, second] = wrongSentences();
    await click(first!);
    await click(second!);
    expect(screen.getByText(he.quiz.revealed)).toBeTruthy();
    expect(sentence('LA.1.003').className).toContain('compact-sentence--correct');
    // The question is done: the sentences take no more answers.
    await click(sentence('LA.1.003'));
    expect(screen.getByText(he.quiz.revealed)).toBeTruthy();
  });

  it('switches the whole lesson to English and back, with its footnotes', async () => {
    const { storage } = await renderApp(ROUTES.read, { storage: reading(['q-find']) });
    const toggle = button(he.language.label);
    expect(toggle.getAttribute('aria-pressed')).toBe('false');
    await click(toggle);
    expect(toggle.getAttribute('aria-pressed')).toBe('true');
    // Every section shown has its English: the choice is for the whole lesson.
    const english = () => [...document.querySelectorAll('.read-section .english')];
    expect(english().map((e) => e.textContent)).toEqual(['Love [and soul]1.', 'Brothers.']);
    expect(JSON.parse(storage.get(config.storage.key)!).english).toBe(true);
    await click(button(he.read.footnote('1')));
    expect(screen.getByRole('dialog', { name: he.read.footnote('1') })).toBeTruthy();
    expect(screen.getByText('A note.')).toBeTruthy();
    await click(button(he.common.close));
    expect(screen.queryByRole('dialog')).toBeNull();
    await click(toggle);
    expect(english()).toEqual([]);
  });

  it('gives the English ביאור instead of the Hebrew in English mode', async () => {
    await renderApp(ROUTES.read, { storage: reading(['q-l2'], 2) });
    expect(screen.getByText('ביאור ראשון')).toBeTruthy();
    await click(button(he.language.label));
    expect(screen.queryByText('ביאור ראשון')).toBeNull();
    const biur = screen.getByText('The first biur');
    expect([biur.getAttribute('dir'), biur.getAttribute('lang')]).toEqual([
      'ltr',
      config.translationLanguage,
    ]);
    // A sentence without an English ביאור keeps its Hebrew one.
    expect(screen.getByText('ביאור שני').getAttribute('dir')).toBeNull();
  });

  it('asks the questions in English in English mode, quoting the English', async () => {
    Element.prototype.scrollIntoView = vi.fn();
    const quiz = { ...startSession('solo', ['q-choice', 'q-find', 'q-tf'], 1), index: 0 };
    const storage = memoryStorage({
      [config.storage.key]: JSON.stringify({ level: 1, english: true, quiz }),
    });
    await renderApp(ROUTES.read, { storage });
    const card = document.querySelector('.read-question')!;
    expect([card.getAttribute('dir'), card.getAttribute('lang')]).toEqual([
      'ltr',
      config.translationLanguage,
    ]);
    expect(screen.getByText(en.quiz.progress(1, 3))).toBeTruthy();
    expect(screen.getByText('prompt q-choice en')).toBeTruthy();
    await click(option('Second answer'));
    expect(screen.getByText(en.quiz.tryAgain)).toBeTruthy();
    expect(screen.getByText('hint q-choice en')).toBeTruthy();
    expect(screen.getByText('Love [and soul].', { selector: 'mark' })).toBeTruthy();
    await click(option('Third answer'));
    expect(screen.getByText(en.quiz.revealed)).toBeTruthy();
    expect(screen.getByText('Right answer', { selector: 'strong' })).toBeTruthy();
    expect(screen.getByText(en.quiz.fromText)).toBeTruthy();

    // The sentences to find are offered in English.
    await click(button(en.quiz.next));
    expect(screen.getByText(en.quiz.findSentenceHelp)).toBeTruthy();
    await click(button('Brothers.'));
    expect(screen.getByText(en.quiz.praise[1]!)).toBeTruthy();

    await click(button(en.quiz.next));
    expect(screen.getByText(en.quiz.summary)).toBeTruthy();
    await click(button(en.quiz.false));
    await click(button(en.quiz.finish));
    expect(hash()).toBe(ROUTES.done);
  });

  it('shows the English of each sentence right after it', async () => {
    const data = portionData();
    data.portion.sections = [{ from: 'LA.1.001', to: 'LA.1.004' }];
    // One span per unit; the two units of the sentence LA.1.003 join as written.
    const [first, second] = data.translations;
    data.translations = [
      { ...first!, to: 'LA.1.001', text: 'Love, ', footnotes: {} },
      { ...first!, from: 'LA.1.002', text: '[and soul][1].' },
      { ...second!, to: 'LA.1.003', text: 'Brothers, ' },
      { ...second!, from: 'LA.1.004', text: 'one father.' },
    ];
    await renderApp(ROUTES.read, { data, storage: reading() });
    await click(button(he.language.label));
    const englishOf = (id: string) =>
      document.querySelector(`.sentence-block[data-unit="${id}"] .english`)!.textContent;
    expect(['LA.1.001', 'LA.1.002', 'LA.1.003'].map(englishOf)).toEqual([
      'Love, ',
      '[and soul]1.',
      'Brothers, one father.',
    ]);
  });

  it('has no language switch without English', async () => {
    const data = portionData();
    data.translations = [];
    await renderApp(ROUTES.read, { data, storage: reading() });
    expect(screen.queryByRole('button', { name: he.language.label })).toBeNull();
  });

  it('opens a glossary term', async () => {
    await renderApp(ROUTES.read, { storage: reading() });
    await click(button('אַהֲבָה'));
    expect(screen.getByRole('dialog', { name: 'אהבה' })).toBeTruthy();
    await click(button(he.common.close));
  });

  it('shows the dedication under the text, when the day has one', async () => {
    for (const kind of Object.keys(he.dedication) as (keyof typeof he.dedication)[]) {
      const data = portionData();
      data.portion.dedication = { kind, name: 'פלוני בן פלוני' };
      const { unmount } = await renderApp(ROUTES.read, { data, storage: reading() });
      expect(screen.getByText(he.dedication[kind]('פלוני בן פלוני'))).toBeTruthy();
      unmount();
    }
    await renderApp(ROUTES.read, { storage: reading() });
    expect(document.querySelector('.dedication')).toBeNull();
  });
});
