import type { ReactNode } from 'react';
import type { GlossaryMark, PortionUnit } from '../content/loader';
import type { GlossaryEntry } from '../content/types';

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
  for (const m of marks as (GlossaryMark & { at: number })[]) {
    if (m.at < pos) continue;
    if (m.at > pos) parts.push(text.slice(pos, m.at));
    const word = text.slice(m.at, m.at + m.match.length);
    parts.push(
      onTerm ? (
        <button
          key={m.at}
          type="button"
          className="term"
          onClick={() => onTerm(m.entry)}
          aria-haspopup="dialog"
        >
          {word}
        </button>
      ) : (
        <span key={m.at}>{word}</span>
      ),
    );
    pos = m.at + m.match.length;
  }
  if (pos < text.length) parts.push(text.slice(pos));
  return <>{parts}</>;
}
