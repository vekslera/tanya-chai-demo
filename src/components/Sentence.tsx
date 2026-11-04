import type { ReactNode } from 'react';
import type { PortionUnit } from '../content/loader';
import type { GlossaryEntry } from '../content/types';
import './Sentence.css';

/**
 * A unit's text exactly as in the resource, with glossary terms marked. Each match is split out at
 * its first occurrence only (SPEC §7); overlapping matches keep the earlier one.
 */
export function SentenceText({
  unit,
  onTerm,
}: {
  unit: PortionUnit;
  onTerm?: (entry: GlossaryEntry) => void;
}) {
  const text = unit.display;
  const marks = unit.glossary
    .map((m) => ({ ...m, at: text.indexOf(m.match) }))
    .filter((m) => m.at >= 0)
    .sort((a, b) => a.at - b.at);

  const parts: ReactNode[] = [];
  let pos = 0;
  for (const m of marks) {
    if (m.at < pos) continue;
    const end = m.at + m.match.length;
    // Letters or punctuation attached to the term (a prefix like וְ, a closing ״ or comma) stay on
    // its line: a button is laid out as inline-block, so the line could otherwise break inside a word.
    const before = text.slice(pos, m.at).match(/^([\s\S]*?)(\S*)$/)!;
    const after = text.slice(end).match(/^\S*/)![0];
    if (before[1]) parts.push(before[1]);
    const term = text.slice(m.at, end);
    parts.push(
      <span key={m.at} className="term-group">
        {before[2]}
        {onTerm ? (
          <button
            type="button"
            className="term"
            onClick={() => onTerm(m.entry)}
            aria-haspopup="dialog"
          >
            {term}
          </button>
        ) : (
          term
        )}
        {after}
      </span>,
    );
    pos = end + after.length;
  }
  if (pos < text.length) parts.push(text.slice(pos));
  return <>{parts}</>;
}
