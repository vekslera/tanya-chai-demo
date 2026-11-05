import { BidiText } from '../../components/BidiText';
import type { Source } from '../../domain/types';
import { he } from '../../strings/he';

/** Sources and rights: each text's attribution with a link to its license, then our own content. */
export function AboutSources({
  sources,
  draftNote,
}: {
  sources: readonly Source[];
  draftNote: string | null;
}) {
  return (
    <section className="about-section">
      <h2>{he.about.sourcesTitle}</h2>
      <ul className="about-sources">
        {sources.map((s) => (
          <li key={s.id}>
            <BidiText text={s.attribution} />
            {s.url && (
              <>
                {' '}
                <a href={s.url} target="_blank" rel="noopener noreferrer">
                  {he.about.licenseLink}
                </a>
              </>
            )}
          </li>
        ))}
        <li>{he.about.contentCredit}</li>
      </ul>
      {draftNote && <p className="small muted">{draftNote}</p>}
    </section>
  );
}
