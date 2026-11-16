// The integrity rules of SPEC §6.5, with the limits of app.config.json (contentRules).
import { contentRules, type ContentRules } from '../config.ts';
import type { ChapterLayers } from '../load.ts';
import { checkUnits } from '../units.ts';
import { checkCards, checkSections, checkShinun } from './cards.ts';
import { checkGlossary, checkUnitContent } from './content.ts';
import { createContext, type Findings } from './context.ts';
import { checkPortion } from './portion.ts';
import { checkQuestions } from './questions.ts';
import { checkSchedule, checkTexts, checkTranslations } from './text.ts';

export type { Findings };

export function validate(
  all: ChapterLayers,
  { strict = false, rules = contentRules }: { strict?: boolean; rules?: ContentRules } = {},
): Findings {
  // Without units, nothing else can be checked.
  if (all.errors.length) return { errors: [...all.errors], warnings: [] };
  const ctx = createContext(all);
  ctx.errors.push(...checkUnits(all));
  checkTexts(ctx);
  checkSchedule(ctx);
  checkTranslations(ctx, strict);
  checkUnitContent(ctx, checkGlossary(ctx), rules);
  const placed = checkPortion(ctx);
  if (placed) {
    const inPortion = new Set(placed.units.map((u) => u.id));
    checkQuestions(ctx, placed.p, inPortion, rules);
    checkSections(ctx, placed.p, placed.units);
    checkCards(ctx, placed.p, rules);
    checkShinun(ctx, placed.p);
  }
  return { errors: ctx.errors, warnings: ctx.warnings };
}
