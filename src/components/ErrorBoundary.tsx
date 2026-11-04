import { Component, type ReactNode } from 'react';
import { he } from '../strings/he';

/** A calm full-screen message with a retry button (SPEC §7). */
export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main className="screen" style={{ justifyContent: 'center', textAlign: 'center', gap: 16 }}>
        <h1 className="screen-title">{he.error.title}</h1>
        <p className="muted">{he.error.text}</p>
        <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
          {he.error.retry}
        </button>
      </main>
    );
  }
}
