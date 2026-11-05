import { useEffect, useState } from 'react';
import { TopBar } from '../../components/TopBar';
import { usePortion } from '../../content/PortionProvider';
import { ROUTES } from '../../routes';
import { useStore } from '../../store/StoreProvider';
import { he } from '../../strings/he';
import { ShinunEnd } from './ShinunEnd';
import { ShinunRound } from './ShinunRound';
import './Shinun.css';

/** A taste of Shinun (S6): one sentence, words hidden round by round. No microphone. */
export function ShinunScreen() {
  const { dispatch } = useStore();
  const portion = usePortion();
  const shinun = portion.portion.shinun;
  const [round, setRound] = useState(0);
  const unit = shinun ? portion.unit(shinun.unitId) : undefined;
  const rounds = shinun?.rounds ?? [];
  const finished = round >= rounds.length;

  useEffect(() => {
    if (finished) dispatch({ type: 'seenShinun' });
  }, [finished, dispatch]);

  if (!unit) return null;
  return (
    <main className="screen shinun">
      <TopBar back={ROUTES.done} title={he.shinun.title} />
      {finished ? (
        <ShinunEnd sentence={unit.display} />
      ) : (
        <ShinunRound
          key={round}
          sentence={unit.display}
          round={round}
          rounds={rounds}
          onSuccess={() => setRound((r) => r + 1)}
        />
      )}
    </main>
  );
}
