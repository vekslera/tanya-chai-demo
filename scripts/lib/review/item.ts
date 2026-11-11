// One reviewable item in the review document, and the quoted text it refers to.
import type { Reviewed, Unit } from '../../../src/domain/types.ts';

const status = (r: Reviewed<string>) => (r.reviewed ? '✅ approved' : '⬜ to review');

export function item(id: string, r: Reviewed<string>): string {
  const lines = [`- **${id}** (${status(r)})`, `  ${r.value}`];
  if (r.note) lines.push(`  _Note: ${r.note}_`);
  return lines.join('\n');
}

export const quote = (units: readonly Unit[]) => `> ${units.map((u) => u.text.trim()).join(' ')}`;
