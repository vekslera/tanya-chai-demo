import type { ReactNode } from 'react';

// A Latin run: a whole parenthesized Latin phrase, or a run that starts and ends with a letter or
// digit and may hold spaces and simple punctuation.
const LATIN_RUN =
  /\([A-Za-z0-9][A-Za-z0-9 .,:/\-–]*\)|[A-Za-z0-9][A-Za-z0-9 .,:/\-–]*[A-Za-z0-9.]|[A-Za-z0-9]/g;

/**
 * Hebrew text with embedded Latin runs (names, licenses, numbers) isolated in <bdi>, so that
 * neutral characters around them, such as parentheses, stay in place (SPEC §3.2).
 */
export function BidiText({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  let pos = 0;
  for (const m of text.matchAll(LATIN_RUN)) {
    if (m.index > pos) parts.push(text.slice(pos, m.index));
    parts.push(
      <bdi key={m.index} className={m[0].startsWith('(') ? 'nowrap' : undefined}>
        {m[0]}
      </bdi>,
    );
    pos = m.index + m[0].length;
  }
  parts.push(text.slice(pos));
  return <>{parts}</>;
}
