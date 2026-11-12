import { HeartMark } from '../../components/HeartMark';
import { LanguageToggle } from '../../components/LanguageToggle';
import { TopBar } from '../../components/TopBar';
import { ROUTES } from '../../routes';
import { he } from '../../strings/he';

export function TogetherIntro({
  heartProgress,
  onStart,
}: {
  heartProgress: number;
  onStart: () => void;
}) {
  return (
    <main className="screen together together--center">
      <TopBar back={ROUTES.home} end={<LanguageToggle comingSoon />} />
      <div className="together-intro">
        <HeartMark progress={heartProgress} beating />
        <h1 className="together-title">{he.together.title}</h1>
        <p className="together-intro-text">{he.together.intro}</p>
        <button type="button" className="btn btn-gold btn-big btn-block" onClick={onStart}>
          {he.together.start}
        </button>
      </div>
    </main>
  );
}
