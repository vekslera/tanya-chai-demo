import type { ReactNode } from 'react';

// A Latin stretch: from an (optionally parenthesized) Latin letter or digit to the last Latin letter,
// digit or closing parenthesis before the Hebrew resumes, with the spaces and punctuation between
// (commas, ©, hyphens, inner parentheses) kept inside, so the stretch is laid out as one LTR run.
const LATIN_STRETCH = /\(?[A-Za-z0-9][A-Za-z0-9 .,:;()©&'’/\-–]*[A-Za-z0-9)]|\(?[A-Za-z0-9]\)?/g;
const NOWRAP_UP_TO = 30;

/** Drops a parenthesis at either end that has no partner inside the stretch. */
function balance(run: string): { text: string; lead: number } {
  let text = run;
  let lead = 0;
  const count = (c: string) => [...text].filter((x) => x === c).length;
  if (text.startsWith('(') && count('(') > count(')')) {
    text = text.slice(1);
    lead = 1;
  }
  if (text.endsWith(')') && count(')') > count('(')) text = text.slice(0, -1);
  return { text, lead };
}

/**
 * Hebrew text with embedded Latin stretches (names, licenses, numbers) isolated in <bdi>, so that
 * the neutral characters around them stay in place (SPEC §3.2). Short stretches do not wrap.
 */
export function BidiText({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  let pos = 0;
  for (const m of text.matchAll(LATIN_STRETCH)) {
    const { text: run, lead } = balance(m[0]);
    const start = m.index + lead;
    if (start > pos) parts.push(text.slice(pos, start));
    parts.push(
      <bdi key={start} className={run.length <= NOWRAP_UP_TO ? 'nowrap' : undefined}>
        {run}
      </bdi>,
    );
    pos = start + run.length;
  }
  parts.push(text.slice(pos));
  return <>{parts}</>;
}
