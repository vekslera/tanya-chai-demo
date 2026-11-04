// Small inline icons. Decorative: the button around each one carries the label.
type P = { size?: number };

const svg = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: false,
});

/** "Back" in RTL: the arrow points right. */
export const BackIcon = ({ size = 24 }: P) => (
  <svg {...svg(size)}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const MoreIcon = ({ size = 24 }: P) => (
  <svg {...svg(size)}>
    <circle cx="12" cy="5" r="1.4" fill="currentColor" />
    <circle cx="12" cy="12" r="1.4" fill="currentColor" />
    <circle cx="12" cy="19" r="1.4" fill="currentColor" />
  </svg>
);

export const CloseIcon = ({ size = 24 }: P) => (
  <svg {...svg(size)}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const CheckIcon = ({ size = 20 }: P) => (
  <svg {...svg(size)}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);

/** A heart with a pulse line: the streak icon (no fire emoji). */
export const HeartPulseIcon = ({ size = 20 }: P) => (
  <svg {...svg(size)} stroke="var(--gold-deep)">
    <path d="M12 20s-7.5-4.6-9.3-9.2C1.4 7.4 3.6 4 7 4c2.1 0 3.6 1.1 5 3 1.4-1.9 2.9-3 5-3 3.4 0 5.6 3.4 4.3 6.8C19.5 15.4 12 20 12 20z" />
    <path d="M3.5 12h4l1.5-3 3 6 1.5-3h7" />
  </svg>
);

export const BookIcon = ({ size = 22 }: P) => (
  <svg {...svg(size)}>
    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" />
    <path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5" />
  </svg>
);
