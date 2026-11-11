// Splits a sentence around its glossary terms (SPEC §7). The text is never changed: joining the
// segments gives it back exactly.
import type { GlossaryMark } from './portion.ts';

export type TextSegment = { kind: 'text'; text: string };
/**
 * A term with the letters or punctuation attached to it (a prefix like וְ, a closing ״ or comma),
 * so the line never breaks inside a word.
 */
export type TermSegment = {
  kind: 'term';
  before: string;
  term: string;
  after: string;
  mark: GlossaryMark;
};
export type Segment = TextSegment | TermSegment;

/** Each match is marked at its first occurrence only; overlapping matches keep the earlier one. */
export function glossarySegments(text: string, marks: readonly GlossaryMark[]): Segment[] {
  const found = marks
    .map((mark) => ({ mark, at: text.indexOf(mark.match) }))
    .filter((m) => m.at >= 0)
    .sort((a, b) => a.at - b.at);

  const out: Segment[] = [];
  let pos = 0;
  for (const { mark, at } of found) {
    if (at < pos) continue;
    const end = at + mark.match.length;
    const [, lead = '', before = ''] = text.slice(pos, at).match(/^([\s\S]*?)(\S*)$/)!;
    const after = text.slice(end).match(/^\S*/)![0];
    if (lead) out.push({ kind: 'text', text: lead });
    out.push({ kind: 'term', before, term: text.slice(at, end), after, mark });
    pos = end + after.length;
  }
  if (pos < text.length) out.push({ kind: 'text', text: text.slice(pos) });
  return out;
}
