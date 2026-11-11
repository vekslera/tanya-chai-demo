// Avos uBanim (S8): the intro, one card per thought, then the son's turn.
import type { PortionUnit } from './portion.ts';
import type { TogetherCard, UnitId } from './types.ts';
import { isInRange } from './units.ts';

export const INTRO_INDEX = -1;

export type TogetherStep =
  { kind: 'intro' } | { kind: 'card'; index: number } | { kind: 'childTurn' };

/** The step for a stored index: below the cards is the intro, past them is the son's turn. */
export function togetherStep(index: number, cardCount: number): TogetherStep {
  if (index <= INTRO_INDEX) return { kind: 'intro' };
  if (index >= cardCount) return { kind: 'childTurn' };
  return { kind: 'card', index };
}

/** The card that covers a unit, if any. */
export function cardOfUnit(
  cards: readonly TogetherCard[],
  units: readonly PortionUnit[],
  id: UnitId,
): TogetherCard | undefined {
  return cards.find((c) => isInRange(units, c, id));
}
