import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { memoryStorage } from '../../adapters/memoryStorage';
import { config } from '../../config';
import { startSession } from '../../domain/quizSession';
import { ROUTES } from '../../routes';
import { he } from '../../strings/he';
import { button, click, hash, renderApp } from '../../test/renderApp';

const withQuiz = (questionIds = ['q-choice', 'q-find', 'q-tf']) =>
  memoryStorage({
    [config.storage.key]: JSON.stringify({ quiz: startSession('solo', 1, questionIds, 1) }),
  });
const option = (text: string) => button(new RegExp(text));
const sentence = (id: string) => document.querySelector(`button[data-unit="${id}"]`)!;

describe('QuizScreen', () => {
  it('leaves for the level screen without a quiz', async () => {
    await renderApp(ROUTES.quiz);
    expect(hash()).toBe(ROUTES.level);
  });

  it('gives a hint after a wrong answer, then reveals the answer', async () => {
    await renderApp(ROUTES.quiz, { storage: withQuiz() });
    expect(screen.getByText(he.quiz.progress(1, 3))).toBeTruthy();
    await click(option('תשובה שנייה'));
    expect(screen.getByText(he.quiz.tryAgain)).toBeTruthy();
    expect(screen.getByText('hint q-choice')).toBeTruthy();
    expect(document.querySelector('.option--shake')).toBeTruthy();
    // A tried option takes no second answer.
    await click(option('תשובה שנייה'));
    await click(option('תשובה שלישית'));
    expect(screen.getByText(he.quiz.revealed)).toBeTruthy();
    expect(screen.getByText('תשובה נכונה', { selector: 'strong' })).toBeTruthy();
    expect(screen.getByText('explanation q-choice')).toBeTruthy();
  });

  it('praises a correct answer with its points', async () => {
    await renderApp(ROUTES.quiz, { storage: withQuiz() });
    await click(option('תשובה נכונה'));
    expect(screen.getByText(he.quiz.praise[0]!)).toBeTruthy();
    expect(screen.getByText(he.quiz.points(config.scoring.pointsByAttempt[0]!))).toBeTruthy();
    expect(document.querySelector('.option--shake')).toBeNull();
  });

  it('finds a sentence in the text, with a hint to its paragraph', async () => {
    await renderApp(ROUTES.quiz, { storage: withQuiz(['q-find']) });
    expect(screen.getByText(he.quiz.findSentenceHelp)).toBeTruthy();
    await click(sentence('LA.1.001'));
    expect(document.querySelector('.compact-paragraph--hint')).toBeTruthy();
    await click(sentence('LA.1.003'));
    expect(screen.getByText(he.quiz.praise[0]!)).toBeTruthy();
    expect(button(he.quiz.finish)).toBeTruthy();
  });

  it('reveals a findSentence answer in the text itself', async () => {
    await renderApp(ROUTES.quiz, { storage: withQuiz(['q-find']) });
    await click(sentence('LA.1.001'));
    await click(sentence('LA.1.002'));
    expect(screen.getByText(he.quiz.revealed)).toBeTruthy();
    expect(sentence('LA.1.003').className).toContain('compact-sentence--correct');
    // The question is done: the text takes no more answers.
    await click(sentence('LA.1.004'));
    expect(sentence('LA.1.004').className).not.toContain('wrong');
  });

  it('opens the text in a sheet, pointing at the source once answered', async () => {
    await renderApp(ROUTES.quiz, { storage: withQuiz(['q-find']) });
    const footer = () => document.querySelector('.quiz-footer .link-btn')!;
    await click(footer());
    expect(document.querySelector('.sheet .compact-sentence--highlight')).toBeNull();
    await click(button(he.common.close));
    await click(sentence('LA.1.003'));
    Element.prototype.scrollIntoView = () => {};
    await click(footer());
    expect(document.querySelector('.sheet .compact-sentence--highlight')).toBeTruthy();
  });

  it('labels true and false, and runs to the completion screen', async () => {
    const { storage } = await renderApp(ROUTES.quiz, { storage: withQuiz(['q-choice', 'q-tf']) });
    await click(option('תשובה נכונה'));
    await click(button(he.quiz.next));
    expect(screen.getByText(he.quiz.progress(2, 2))).toBeTruthy();
    await click(button(he.quiz.true));
    expect(button(`${he.quiz.true} (${he.quiz.chosenWrong})`)).toBeTruthy();
    await click(button(he.quiz.false));
    expect(screen.getByText(he.quiz.points(config.scoring.pointsByAttempt[1]!))).toBeTruthy();
    await click(button(he.quiz.finish));
    expect(hash()).toBe(ROUTES.done);
    expect(JSON.parse(storage.get(config.storage.key)!).completedLevels).toEqual([1]);
  });
});
