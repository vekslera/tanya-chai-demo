import { config } from '../config';
import { bidiSegments } from '../domain/bidi';

/**
 * Hebrew text with embedded Latin stretches (names, licenses, numbers) isolated in <bdi>, so that
 * the neutral characters around them stay in place (SPEC §3.2). Short stretches do not wrap.
 */
export function BidiText({ text }: { text: string }) {
  return (
    <>
      {bidiSegments(text, config.text.bidiNowrapMaxChars).map((s, i) =>
        s.latin ? (
          <bdi key={i} className={s.nowrap ? 'nowrap' : undefined}>
            {s.text}
          </bdi>
        ) : (
          s.text
        ),
      )}
    </>
  );
}
