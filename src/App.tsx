import { HeartMark } from './components/HeartMark';
import { Wordmark } from './components/Wordmark';
import { he } from './strings/he';

export function App() {
  return (
    <main className="screen" style={{ alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <HeartMark progress={62} animated drawIn beating size={180} label="תניא חי" />
      <Wordmark />
      <p className="muted">{he.home.comingSoon}</p>
    </main>
  );
}
