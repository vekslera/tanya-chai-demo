// Checks of the Avos uBanim cards and of the Shinun sentence.
import type { Portion, TogetherCard, Unit } from '../../../src/domain/types.ts';
import type { ContentRules } from '../config.ts';
import { isReviewed, wordCount, type Context } from './context.ts';

const inside = (n: number, [min, max]: [number, number]) => n >= min && n <= max;

function checkCard(ctx: Context, c: TogetherCard, rules: ContentRules) {
  for (const key of ['forParent', 'toChild'] as const) {
    if (!isReviewed(c[key])) ctx.errors.push(`card ${c.id}: ${key} is not a Reviewed<string>`);
  }
  if (c.talk && !isReviewed(c.talk))
    ctx.errors.push(`card ${c.id}: talk is not a Reviewed<string>`);
  for (const [key, max] of Object.entries(rules.cards.maxWords)) {
    const field = c[key as keyof TogetherCard] as { value?: string } | undefined;
    const n = field?.value ? wordCount(field.value) : 0;
    if (n > max) ctx.warnings.push(`card ${c.id}: ${key} has ${n} words (max ${max})`);
  }
}

/** The cards cover the portion's units exactly once, in order. */
export function checkCards(ctx: Context, p: Portion, portionUnits: Unit[], rules: ContentRules) {
  const cards = p.together ?? [];
  const [min, max] = rules.cards.count;
  if (!inside(cards.length, rules.cards.count)) {
    ctx.errors.push(`together: ${cards.length} cards (expected ${min}–${max})`);
  }
  const covered: string[] = [];
  for (const c of cards) {
    checkCard(ctx, c, rules);
    if (ctx.range(`card ${c.id}`, c)) covered.push(...ctx.unitsOf(c).map((u) => u.id));
  }
  if (covered.join() !== portionUnits.map((u) => u.id).join()) {
    ctx.errors.push('together: cards do not cover the portion units exactly once, in order');
  }
  const talks = cards.filter((c) => c.talk).length;
  if (!inside(talks, rules.cards.talks)) {
    const [lo, hi] = rules.cards.talks;
    ctx.warnings.push(`together: ${talks} cards with a talk question (${lo}–${hi})`);
  }
}

export function checkShinun(ctx: Context, p: Portion) {
  if (!p.shinun) return;
  const { unitId, rounds } = p.shinun;
  const words = ctx.unitRef('shinun', unitId) ? wordCount(ctx.byId.get(unitId)!.text) : 0;
  if (!Array.isArray(rounds)) {
    ctx.errors.push('shinun: rounds must be an array');
    return;
  }
  for (const round of rounds) {
    if (round.some((i) => !Number.isInteger(i) || i < 0 || i >= words)) {
      ctx.errors.push(`shinun: word index out of range (the unit has ${words} words)`);
    }
  }
}
