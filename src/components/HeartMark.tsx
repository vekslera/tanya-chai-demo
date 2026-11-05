import { useEffect, useState, type CSSProperties } from 'react';
import geometry from 'virtual:brand';
import { config } from '../config';
import './HeartMark.css';

const FULL = 100;

type Props = {
  /** Gold contour progress, 0..100. */
  progress: number;
  /** Transition the contour between values (over config.motion.heartContourMs). */
  animated?: boolean;
  /** With `animated`: draw the contour in from 0 on mount. */
  drawIn?: boolean;
  /** The heartbeat of the animated logo. */
  beating?: boolean;
  /** Warm the left chamber toward --purify and back, once, each time this turns true. */
  purify?: boolean;
  label?: string;
};

/** The logo's heart, drawn from the logo's own paths (virtual:brand). Its size is set in CSS. */
export function HeartMark({ progress, animated, drawIn, beating, purify, label }: Props) {
  const target = Math.max(0, Math.min(FULL, progress));
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
  const contourStyle: CSSProperties = {
    strokeDasharray: `${FULL} ${FULL}`,
    strokeDashoffset: FULL - drawn,
    opacity: drawn <= 0 ? 0 : 1,
  };
  const timing = { '--heart-contour-ms': `${config.motion.heartContourMs}ms` } as CSSProperties;
  const { contour, strokeWidth, chambers, left, right } = geometry;

  return (
    <svg
      className={`heartmark${animated ? ' heartmark--animated' : ''}`}
      viewBox={geometry.viewBox}
      style={timing}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <path
        d={contour}
        fill="none"
        stroke="var(--track)"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <path
        className="heartmark-contour"
        pathLength={FULL}
        d={contour}
        fill="none"
        stroke="var(--gold)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={contourStyle}
      />
      <g transform={chambers}>
        <g className={beating ? 'heartmark-beat' : undefined}>
          <path
            className={purify ? 'heartmark-purify' : undefined}
            transform={left.transform}
            d={left.d}
            fill="var(--tint)"
          />
          <path transform={right.transform} d={right.d} fill="var(--gold)" />
        </g>
      </g>
    </svg>
  );
}
