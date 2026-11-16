// Avos uBanim (S8, S9): the intro, then one card per thought, each followed by the son's question.
import type { PortionSection } from './portion.ts';
import type { TogetherCard, UnitId } from './types.ts';

export const INTRO_INDEX = -1;

export type TogetherStep =
  { kind: 'intro' } | { kind: 'card'; index: number } | { kind: 'question' };

/**
 * The step for a stored card index. `questionAt` is the card the current question follows, with
 * the questions under way: once the father moves past that card, the son answers it.
 */
export function togetherStep(index: number, cardCount: number, questionAt?: number): TogetherStep {
  if (questionAt === undefined || index <= INTRO_INDEX) return { kind: 'intro' };
  if (index > questionAt) return { kind: 'question' };
  return { kind: 'card', index: Math.min(index, cardCount - 1) };
}

/** The card that covers a unit: the card of the unit's section. */
export function cardOfUnit(
  cards: readonly TogetherCard[],
  sections: readonly PortionSection[],
  id: UnitId,
): TogetherCard | undefined {
  return cards[sections.findIndex((s) => s.units.some((u) => u.id === id))];
}
