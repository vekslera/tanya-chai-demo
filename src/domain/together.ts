// Avos uBanim (S8): the intro, one card per thought, then the son's turn.
import type { PortionSection } from './portion.ts';
import type { TogetherCard, UnitId } from './types.ts';

export const INTRO_INDEX = -1;

export type TogetherStep =
  { kind: 'intro' } | { kind: 'card'; index: number } | { kind: 'childTurn' };

/** The step for a stored index: below the cards is the intro, past them is the son's turn. */
export function togetherStep(index: number, cardCount: number): TogetherStep {
  if (index <= INTRO_INDEX) return { kind: 'intro' };
  if (index >= cardCount) return { kind: 'childTurn' };
  return { kind: 'card', index };
}

/** The card that covers a unit: the card of the unit's section. */
export function cardOfUnit(
  cards: readonly TogetherCard[],
  sections: readonly PortionSection[],
  id: UnitId,
): TogetherCard | undefined {
  return cards[sections.findIndex((s) => s.units.some((u) => u.id === id))];
}
