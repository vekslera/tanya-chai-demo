import { useEffect, useState } from 'react';
import './HeartMark.css';

// Path data copied verbatim from resources/brand/logo/logo-mark-animated.svg. Do not redraw.
const CONTOUR =
  'M130 94 C136 82 146 74 160 74 C178 74 194 88 194 110 C194 140 164 166 130 190 C96 166 66 140 66 110 C66 88 82 74 100 74 C114 74 124 82 130 94 Z';
const LEFT_CHAMBER = 'M130 94 C124 82 114 74 100 74 C82 74 66 88 66 110 C66 140 96 166 130 190 Z';
const RIGHT_CHAMBER =
  'M130 94 C136 82 146 74 160 74 C178 74 194 88 194 110 C194 140 164 166 130 190 Z';

type Props = {
  /** Gold contour progress, 0..100. */
  progress: number;
  /** Transition the contour between values (1.2s). */
  animated?: boolean;
  /** With `animated`: draw the contour in from 0 on mount. */
  drawIn?: boolean;
  /** The heartbeat of the animated logo. */
  beating?: boolean;
  /** Warm the left chamber toward --purify and back, once, each time this turns true. */
  purify?: boolean;
  size?: number;
  label?: string;
};

export function HeartMark({
  progress,
  animated,
  drawIn,
  beating,
  purify,
  size = 156,
  label,
}: Props) {
  const target = Math.max(0, Math.min(100, progress));
  const [drawn, setDrawn] = useState(animated && drawIn ? 0 : target);

  useEffect(() => {
    if (!animated) {
      setDrawn(target);
      return;
    }
    // Two frames, so the browser paints the start value before the transition begins.
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setDrawn(target));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [animated, target]);

  // The spec's model is stroke-dasharray `${p} 100` on a pathLength="100" path. Safari does not
  // interpolate dasharray smoothly, so the same visual is produced with a fixed dasharray and an
  // animated dashoffset (SPEC §4.3 allows this).
  const contourStyle = {
    strokeDasharray: '100 100',
    strokeDashoffset: 100 - drawn,
    opacity: drawn <= 0 ? 0 : 1,
  };

  return (
    <svg
      className={`heartmark${animated ? ' heartmark--animated' : ''}`}
      viewBox="52 54 156 156"
      width={size}
      height={size}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <path d={CONTOUR} fill="none" stroke="var(--track)" strokeWidth="7" strokeLinejoin="round" />
      <path
        className="heartmark-contour"
        pathLength={100}
        d={CONTOUR}
        fill="none"
        stroke="var(--gold)"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={contourStyle}
      />
      <g transform="translate(130 134) scale(0.64) translate(-130 -132)">
        <g className={beating ? 'heartmark-beat' : undefined}>
          <path
            className={purify ? 'heartmark-purify' : undefined}
            transform="translate(-5 0)"
            d={LEFT_CHAMBER}
            fill="var(--tint)"
          />
          <path transform="translate(5 0)" d={RIGHT_CHAMBER} fill="var(--gold)" />
        </g>
      </g>
    </svg>
  );
}
