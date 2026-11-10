// The items that need approval before publishing (SPEC §8.4), in reading order.
import type { GlossaryEntry, Portion, Reviewed, UnitContent } from './types.ts';

export const QUESTION_FIELDS = ['prompt', 'hint', 'explanation'] as const;
export const CARD_FIELDS = ['forParent', 'toChild', 'talk'] as const;

export type ReviewableItem = { id: string; item: Reviewed<string> };

export type ReviewableContent = {
  unitContent: readonly UnitContent[];
  glossary: readonly GlossaryEntry[];
  portion: Portion;
};

export function reviewableItems({ unitContent, glossary, portion }: ReviewableContent) {
  const out: ReviewableItem[] = [];
  const add = (id: string, item: Reviewed<string> | undefined) => item && out.push({ id, item });
  for (const c of unitContent) {
    for (const [language, b] of Object.entries(c.biur ?? {}))
      add(`${c.id}/biur.${language}`, b.short);
  }
  for (const g of glossary) add(`glossary/${g.id}`, g.body);
  for (const q of portion.questions) {
    for (const key of QUESTION_FIELDS) add(`${q.id}/${key}`, q[key]);
  }
  for (const c of portion.together) {
    for (const key of CARD_FIELDS) add(`${c.id}/${key}`, c[key]);
  }
  return out;
}

export const unreviewedOf = (items: readonly ReviewableItem[]) =>
  items.filter((r) => !r.item.reviewed);
