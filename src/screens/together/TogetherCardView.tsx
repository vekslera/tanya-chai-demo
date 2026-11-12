import { useState } from 'react';
import { Dedication } from '../../components/Dedication';
import { GlossarySheet } from '../../components/GlossarySheet';
import { ProgressDots } from '../../components/ProgressDots';
import { SentenceText } from '../../components/Sentence';
import { LanguageToggle } from '../../components/LanguageToggle';
import { TopBar } from '../../components/TopBar';
import { usePortion } from '../../content/PortionProvider';
import type { GlossaryEntry, TogetherCard } from '../../domain/types';
import { ROUTES } from '../../routes';
import { he } from '../../strings/he';
import { CardSection } from './CardSection';

/** One thought: its section's text, what the father should know, and what to say to the son. */
export function TogetherCardView({
  card,
  index,
  count,
  onGo,
}: {
  card: TogetherCard;
  index: number;
  count: number;
  onGo: (index: number) => void;
}) {
  const { sections } = usePortion();
  const [term, setTerm] = useState<GlossaryEntry | null>(null);
  return (
    <main className="screen together">
      <TopBar back={ROUTES.home} title={he.together.title} end={<LanguageToggle comingSoon />} />
      <p className="together-progress">
        <span>{he.together.cardOf(index + 1, count)}</span>
        <ProgressDots count={count} current={index} />
      </p>

      <article className="together-card" key={card.id}>
        <p className="together-text">
          {sections[index]!.units.map((u) => (
            <span key={u.id}>
              <SentenceText unit={u} onTerm={setTerm} />{' '}
            </span>
          ))}
        </p>
        <CardSection label={he.together.forParent}>
          <p className="together-parent">{card.forParent.value}</p>
        </CardSection>
        <CardSection label={he.together.toChild} className="together-child">
          <p>{card.toChild.value}</p>
        </CardSection>
        {card.talk && (
          <CardSection label={he.together.talk} className="together-talk">
            <p>{card.talk.value}</p>
          </CardSection>
        )}
      </article>

      <nav className="together-nav">
        <button type="button" className="btn btn-secondary btn-big" onClick={() => onGo(index - 1)}>
          {he.common.prev}
        </button>
        <button type="button" className="btn btn-primary btn-big" onClick={() => onGo(index + 1)}>
          {he.common.next}
        </button>
        <Dedication />
      </nav>

      <GlossarySheet entry={term} onClose={() => setTerm(null)} />
    </main>
  );
}
