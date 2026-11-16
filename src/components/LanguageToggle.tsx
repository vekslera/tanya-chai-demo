import { config } from '../config';
import { useNotice } from '../hooks/useNotice';
import { he } from '../strings/he';
import './LanguageToggle.css';

type Props =
  /** The lesson's language: Hebrew only, or with the English. */
  | { english: boolean; onToggle: () => void }
  /** Shown dimmed, for a path without English yet: pressing it says it is coming soon. */
  | { comingSoon: true };

/** The HE/EN switch at the top of a lesson: one choice for the whole lesson. */
export function LanguageToggle(props: Props) {
  const [soon, showSoon] = useNotice(config.motion.comingSoonMs);
  const english = 'english' in props && props.english;
  return (
    <div className="lang-toggle-wrap">
      <button
        type="button"
        className={`lang-toggle${'comingSoon' in props ? ' lang-toggle--soon' : ''}`}
        aria-label={he.language.label}
        {...('comingSoon' in props
          ? { 'aria-disabled': true, onClick: showSoon }
          : { 'aria-pressed': english, onClick: props.onToggle })}
      >
        <bdi className={english ? undefined : 'lang-toggle-on'}>{he.language.he}</bdi>
        <bdi className={english ? 'lang-toggle-on' : undefined}>{he.language.en}</bdi>
      </button>
      {'comingSoon' in props && (
        <span className="lang-soon" role="status">
          {soon ? he.language.comingSoon : ''}
        </span>
      )}
    </div>
  );
}
