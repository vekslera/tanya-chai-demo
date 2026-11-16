// Checks of the portion's sections, of the Avos uBanim cards on them, and of the Shinun sentence.
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

/** The sections cover the portion's units exactly once, in order, each from a sentence's start. */
export function checkSections(ctx: Context, p: Portion, portionUnits: Unit[]) {
  const sections = p.sections ?? [];
  const covered: string[] = [];
  sections.forEach((s, i) => {
    const where = `section ${i + 1}`;
    if (!ctx.range(where, s)) return;
    covered.push(...ctx.unitsOf(s).map((u) => u.id));
    const continued = ctx.byId.get(s.from)!.sentence;
    if (continued) ctx.errors.push(`${where}: starts inside ${continued}'s sentence`);
  });
  if (covered.join() !== portionUnits.map((u) => u.id).join()) {
    ctx.errors.push('portion: the sections do not cover its units exactly once, in order');
  }
}

/** One card per section, in order. */
export function checkCards(ctx: Context, p: Portion, rules: ContentRules) {
  const cards = p.together ?? [];
  const [min, max] = rules.cards.count;
  if (!inside(cards.length, rules.cards.count)) {
    ctx.errors.push(`together: ${cards.length} cards (expected ${min}–${max})`);
  }
  const sections = (p.sections ?? []).length;
  if (cards.length !== sections) {
    ctx.errors.push(`together: ${cards.length} cards for ${sections} sections (one per section)`);
  }
  for (const c of cards) checkCard(ctx, c, rules);
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
