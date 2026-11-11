// Checks of the questions: each one on its own, then the set of each level and of Avos uBanim,
// one question after each section but the last and a summary question (SPEC S4, S9).
import { QUESTION_FIELDS } from '../../../src/domain/reviewable.ts';
import type { Portion, Question } from '../../../src/domain/types.ts';
import type { ContentRules } from '../config.ts';
import { isReviewed, type Context } from './context.ts';

function checkAnswer(
  ctx: Context,
  q: Question,
  where: string,
  inPortion: Set<string>,
  rules: ContentRules,
) {
  if (q.kind === 'choice') {
    const ids = (q.options ?? []).map((o) => o.id);
    if (new Set(ids).size !== ids.length) ctx.errors.push(`${where}: duplicate option ids`);
    if (ids.filter((id) => id === q.answer).length !== 1) {
      ctx.errors.push(`${where}: needs exactly one correct option`);
    }
    const [min, max] = rules.optionCount[q.track]!;
    if (ids.length < min || ids.length > max) {
      ctx.errors.push(`${where}: ${ids.length} options (expected ${min}–${max})`);
    }
  } else if (q.kind === 'trueFalse') {
    if (!['true', 'false'].includes(q.answer)) {
      ctx.errors.push(`${where}: answer must be "true" or "false"`);
    }
  } else if (q.kind === 'findSentence') {
    if (ctx.unitRef(where, q.answer) && !inPortion.has(q.answer)) {
      ctx.errors.push(`${where}: answer ${q.answer} is outside the portion`);
    }
    const continued = ctx.byId.get(q.answer)?.sentence;
    if (continued) {
      ctx.errors.push(`${where}: answer ${q.answer} is part of a sentence; use ${continued}`);
    }
  } else {
    ctx.errors.push(`${where}: unknown kind ${(q as { kind: string }).kind}`);
  }
}

/**
 * The questions of one level, or of Avos uBanim, follow the sections: `perSection` after each
 * section but the last (by the section of their unit), then one summary question.
 */
function checkPlacement(
  ctx: Context,
  group: string,
  questions: Question[],
  sectionOf: (q: Question) => number | undefined,
  sections: number,
  rules: ContentRules,
) {
  const summaries = questions.filter((q) => q.summary).length;
  if (summaries !== 1) ctx.errors.push(`${group}: ${summaries} summary questions (expected 1)`);
  const placed = questions.filter((q) => !q.summary).map(sectionOf);
  for (let i = 0; i < sections; i++) {
    const n = placed.filter((s) => s === i).length;
    const expected = i < sections - 1 ? rules.questions.perSection : 0;
    if (n !== expected) {
      ctx.errors.push(`${group}: ${n} questions after section ${i + 1} (expected ${expected})`);
    }
  }
}

/** Each level's questions, and the son's, by category and kind; and where they are asked. */
function checkGroups(ctx: Context, p: Portion, rules: ContentRules) {
  // A section with an unknown end is reported by checkSections; here it holds no unit.
  const known = (s: { from: string; to: string }) => ctx.byId.has(s.from) && ctx.byId.has(s.to);
  const sections = (p.sections ?? []).map(
    (s) => new Set(known(s) ? ctx.unitsOf(s).map((u) => u.id) : []),
  );
  const sectionOf = (q: Question) => {
    const i = sections.findIndex((s) => s.has(q.unitRef));
    return i < 0 ? undefined : i;
  };
  for (const [level, categories] of Object.entries(rules.questions.levelCategories)) {
    const qs = p.questions.filter((q) => q.track === 'solo' && String(q.level) === level);
    for (const q of qs.filter((x) => !categories.includes(x.category))) {
      ctx.errors.push(`question ${q.id}: level ${level} questions are ${categories.join(' or ')}`);
    }
    checkPlacement(ctx, `level ${level}`, qs, sectionOf, sections.length, rules);
  }
  const { category, kinds } = rules.questions.together;
  const together = p.questions.filter((q) => q.track === 'together');
  for (const q of together) {
    if (q.category !== category) {
      ctx.errors.push(`question ${q.id}: together questions are category "${category}"`);
    }
    if (!kinds.includes(q.kind)) {
      ctx.errors.push(`question ${q.id}: together questions are ${kinds.join(' or ')}`);
    }
  }
  checkPlacement(ctx, 'together', together, sectionOf, sections.length, rules);
}

export function checkQuestions(
  ctx: Context,
  p: Portion,
  inPortion: Set<string>,
  rules: ContentRules,
) {
  const ids = new Set<string>();
  for (const q of p.questions) {
    const where = `question ${q.id}`;
    if (ids.has(q.id)) ctx.errors.push(`${where}: duplicate id`);
    ids.add(q.id);
    for (const key of QUESTION_FIELDS) {
      if (!isReviewed(q[key])) ctx.errors.push(`${where}: ${key} is not a Reviewed<string>`);
    }
    if (ctx.unitRef(where, q.unitRef) && !inPortion.has(q.unitRef)) {
      ctx.errors.push(`${where}: unitRef ${q.unitRef} is outside the portion`);
    }
    checkAnswer(ctx, q, where, inPortion, rules);
  }
  checkGroups(ctx, p, rules);
}
