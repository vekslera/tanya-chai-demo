import { config } from '../../config';
import { he } from '../../strings/he';

/** The community counter, marked as demo data. */
export function DoneCommunity() {
  const lessons = config.demo.communityLessons.toLocaleString(config.format.numberLocale);
  return (
    <section className="done-community">
      <p>
        {he.done.communityLabel} <bdi>{lessons}</bdi> {he.done.communityUnit}
      </p>
      <span className="demo-tag">{he.common.demoData}</span>
    </section>
  );
}
