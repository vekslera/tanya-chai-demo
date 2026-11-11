// Small inline icons. Decorative: the button around each one carries the label. Their size is set
// in CSS (.icon, .icon--sm in base.css; a screen may size them in its own CSS).
import type { ReactNode } from 'react';

function Icon({
  small,
  children,
  stroke,
}: {
  small?: boolean;
  children: ReactNode;
  stroke?: string;
}) {
  return (
    <svg
      className={small ? 'icon icon--sm' : 'icon'}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke ?? 'currentColor'}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable={false}
    >
      {children}
    </svg>
  );
}

/** "Back" in RTL: the arrow points right. */
export const BackIcon = () => (
  <Icon>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Icon>
);

export const MoreIcon = () => (
  <Icon>
    <circle cx="12" cy="5" r="1.4" fill="currentColor" />
    <circle cx="12" cy="12" r="1.4" fill="currentColor" />
    <circle cx="12" cy="19" r="1.4" fill="currentColor" />
  </Icon>
);

export const CloseIcon = () => (
  <Icon>
    <path d="M6 6l12 12M18 6L6 18" />
  </Icon>
);

export const CheckIcon = () => (
  <Icon small>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </Icon>
);

/** A heart with a pulse line: the streak icon (no fire emoji). */
export const HeartPulseIcon = () => (
  <Icon small stroke="var(--gold-deep)">
    <path d="M12 20s-7.5-4.6-9.3-9.2C1.4 7.4 3.6 4 7 4c2.1 0 3.6 1.1 5 3 1.4-1.9 2.9-3 5-3 3.4 0 5.6 3.4 4.3 6.8C19.5 15.4 12 20 12 20z" />
    <path d="M3.5 12h4l1.5-3 3 6 1.5-3h7" />
  </Icon>
);
