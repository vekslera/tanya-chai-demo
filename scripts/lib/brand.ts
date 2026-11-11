// Reads the heart's geometry from the animated logo (resources/brand/logo/), so the HeartMark
// component draws exactly the brand's paths without a copy of them in the code.

export type Chamber = { d: string; transform: string };

export type HeartGeometry = {
  viewBox: string;
  /** The contour: drawn once as the grey track, and again in gold as the progress. */
  contour: string;
  strokeWidth: number;
  /** The transform of the group that holds both chambers. */
  chambers: string;
  /** The left chamber is the one that warms (class "purify" in the logo). */
  left: Chamber;
  right: Chamber;
};

type Attrs = Record<string, string>;

const attrsOf = (tag: string): Attrs =>
  Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));

const tags = (svg: string, name: string) =>
  [...svg.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'g'))].map((m) => attrsOf(m[0]));

function required<T>(value: T | undefined, what: string): T {
  if (value === undefined) throw new Error(`logo: no ${what} found`);
  return value;
}

export function heartGeometry(svg: string): HeartGeometry {
  const root = required(tags(svg, 'svg')[0], '<svg>');
  const paths = tags(svg, 'path');
  const contour = required(
    paths.find((p) => p.pathLength),
    'contour (a path with pathLength)',
  );
  const left = required(
    paths.find((p) => p.class === 'purify'),
    'left chamber (class "purify")',
  );
  const right = required(
    paths.find((p) => p !== left && p.transform && p.fill !== 'none'),
    'right chamber',
  );
  const group = required(
    tags(svg, 'g').find((g) => g.transform),
    'chambers group (a <g> with a transform)',
  );
  return {
    viewBox: required(root.viewBox, 'viewBox'),
    contour: required(contour.d, 'contour path data'),
    strokeWidth: Number(required(contour['stroke-width'], 'contour stroke-width')),
    chambers: group.transform!,
    left: { d: required(left.d, 'left chamber path data'), transform: left.transform ?? '' },
    right: { d: required(right.d, 'right chamber path data'), transform: right.transform! },
  };
}
