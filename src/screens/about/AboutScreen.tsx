import { HeartMark } from '../../components/HeartMark';
import { TopBar } from '../../components/TopBar';
import { Wordmark } from '../../components/Wordmark';
import { config } from '../../config';
import { usePortion } from '../../content/PortionProvider';
import { ROUTES } from '../../routes';
import { he } from '../../strings/he';
import { AboutSources } from './AboutSources';
import { ResetSection } from './ResetSection';
import { ThemeSection } from './ThemeSection';
import './About.css';

/** About (S7): what Tanya Chai is, the paths, sources and rights, contact, the look, and a reset. */
export function AboutScreen({ strict = __CONTENT_STRICT__ }: { strict?: boolean }) {
  const { unreviewed, portion } = usePortion();
  // The טיוטה badge marks a development build with content still waiting for approval (SPEC §8.4).
  const draftNote = !strict && unreviewed > 0 ? he.about.draftNote(unreviewed) : null;

  return (
    <main className="screen about">
      <TopBar back={ROUTES.home} />
      <div className="about-brand">
        <HeartMark progress={config.demo.aboutHeartProgress} />
        <Wordmark as="p" />
        {draftNote && (
          <p className="draft-badge" title={draftNote}>
            {he.about.draft}
          </p>
        )}
      </div>

      <h1 className="screen-title">{he.about.title}</h1>
      <section className="about-section">
        {he.about.what.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </section>

      <section className="about-section">
        <h2>{he.about.pathsTitle}</h2>
        <dl className="about-paths">
          {he.about.paths.map((p) => (
            <div key={p.name}>
              <dt>{p.name}</dt>
              <dd>{p.text}</dd>
            </div>
          ))}
        </dl>
      </section>

      <AboutSources sources={portion.sources} draftNote={draftNote} />

      <section className="about-section">
        <h2>{he.about.contactTitle}</h2>
        <p>{he.about.contact}</p>
      </section>

      <ThemeSection />

      <ResetSection />

      <p className="about-version">
        <bdi>{he.about.version(__APP_VERSION__, __BUILD_DATE__)}</bdi>
      </p>
    </main>
  );
}
