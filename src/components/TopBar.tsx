import type { ReactNode } from 'react';
import { navigate } from '../router';
import type { Route } from '../routes';
import { he } from '../strings/he';
import { BackIcon } from './Icons';

export function TopBar({
  back,
  backLabel = he.common.back,
  title,
  end,
  children,
}: {
  back: Route;
  backLabel?: string;
  title?: ReactNode;
  end?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="topbar">
      <button
        type="button"
        className="icon-btn"
        onClick={() => navigate(back)}
        aria-label={backLabel}
      >
        <BackIcon />
      </button>
      <div className="topbar-title">{title}</div>
      {end}
      {children}
    </header>
  );
}
