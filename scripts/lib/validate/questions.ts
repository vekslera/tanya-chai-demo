// Checks of the questions: each one on its own, then the set of each level and of Avos uBanim.
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
  } else {
    ctx.errors.push(`${where}: unknown kind ${(q as { kind: string }).kind}`);
  }
}

/** Each level has exactly the configured number of questions of each category. */
function checkLevels(ctx: Context, questions: Question[], rules: ContentRules) {
  for (const [level, categories] of Object.entries(rules.levelQuestions)) {
    const qs = questions.filter((q) => q.track === 'solo' && String(q.level) === level);
    const expected = Object.values(categories).reduce((a, b) => a + b, 0);
    const counts = Object.entries(categories).every(
      ([cat, n]) => qs.filter((q) => q.category === cat).length === n,
    );
    if (qs.length !== expected || !counts) {
      const wanted = Object.entries(categories)
        .map(([cat, n]) => `${n} ${cat}`)
        .join(' and ');
      ctx.errors.push(`level ${level} needs exactly ${wanted} question(s)`);
    }
  }
}

function checkTogether(ctx: Context, questions: Question[], rules: ContentRules) {
  const { count, category, kinds } = rules.togetherQuestions;
  const together = questions.filter((q) => q.track === 'together');
  if (together.length !== count) {
    ctx.errors.push(`together track has ${together.length} questions (expected ${count})`);
  }
  for (const q of together) {
    if (q.category !== category) {
      ctx.errors.push(`question ${q.id}: together questions are category "${category}"`);
    }
    if (!kinds.includes(q.kind)) {
      ctx.errors.push(`question ${q.id}: together questions are ${kinds.join(' or ')}`);
    }
  }
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
  checkLevels(ctx, p.questions, rules);
  checkTogether(ctx, p.questions, rules);
}
