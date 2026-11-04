// Schema and integrity checks (SPEC §6.5, §8.4).
// Fails on any integrity error. Unreviewed items fail only with CONTENT_STRICT=1.
import { loadAll, reviewables, validate } from './lib/content.mjs';

const strict = process.env.CONTENT_STRICT === '1';
const all = loadAll();
const { errors, warnings } = validate(all);

for (const w of warnings) console.warn(`warning: ${w}`);
for (const e of errors) console.error(`error: ${e}`);

const items = reviewables(all);
const unreviewed = items.filter((r) => !r.item?.reviewed);
console.log(
  `\nunits: ${all.units.length}; reviewable items: ${items.length}; unreviewed: ${unreviewed.length}`,
);
if (unreviewed.length) {
  const groups = {};
  for (const r of unreviewed) {
    const group = r.id
      .split('/')[0]
      .replace(/\.\d+$/, '')
      .replace(/^(q|card)-.*/, '$1');
    groups[group] = (groups[group] ?? 0) + 1;
  }
  console.log(
    'unreviewed by group:',
    Object.entries(groups)
      .map(([k, v]) => `${k} ${v}`)
      .join(', '),
  );
}

if (errors.length) {
  console.error(`\nvalidate-content: ${errors.length} error(s)`);
  process.exit(1);
}
if (strict && unreviewed.length) {
  console.error(
    `\nvalidate-content: CONTENT_STRICT=1 and ${unreviewed.length} item(s) are unreviewed`,
  );
  process.exit(1);
}
console.log('validate-content: OK');
