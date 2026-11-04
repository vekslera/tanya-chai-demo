import { he } from '../strings/he';
import './Wordmark.css';

export function Wordmark({ as: Tag = 'h1' }: { as?: 'h1' | 'p' }) {
  return (
    <Tag className="wordmark">
      <span className="wordmark-tanya">{he.appName.tanya}</span>{' '}
      <span className="wordmark-chai">{he.appName.chai}</span>
    </Tag>
  );
}
