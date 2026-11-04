// English resource → translation spans (SPEC §6.4, §8.1). Run once when the English file is added
// or changed; the output, data/translations/en/<part>/<chapter>.json, is committed.
// One span per Hebrew paragraph: line N of the English file covers paragraph N of the Hebrew.
import fs from 'node:fs';
import path from 'node:path';
import { buildUnits, paragraphs } from './lib/units.mjs';

const root = path.resolve(import.meta.dirname, '..');
const part = 'LA';
const chapter = 32;

const enPath = path.join(root, 'resources/texts/ENG/tanya', part, String(chapter));
if (!fs.existsSync(enPath)) {
  console.error(`build-translations: ${path.relative(root, enPath)} not found`);
  process.exit(1);
}
const raw = fs.readFileSync(
  path.join(root, 'resources/texts/HE/tanya', part, String(chapter)),
  'utf8',
);
const splits = JSON.parse(
  fs.readFileSync(path.join(root, 'data/splits', part, `${chapter}.json`), 'utf8'),
);
const { units, lines, errors } = buildUnits({ raw, splits, part, chapter });
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

const english = paragraphs(fs.readFileSync(enPath, 'utf8')).map((l) => l.trim());
if (english.length !== lines.length) {
  console.error(
    `build-translations: the English has ${english.length} paragraphs, the Hebrew ${lines.length}. Ask Alex how to align them.`,
  );
  process.exit(1);
}

const spans = english.map((text, i) => {
  const inParagraph = units.filter((u) => u.paragraph === i + 1);
  return {
    from: inParagraph[0].id,
    to: inParagraph[inParagraph.length - 1].id,
    text,
    sourceId: 'en-resource',
  };
});

const out = path.join(root, 'data/translations/en', part, `${chapter}.json`);
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(spans, null, 2) + '\n');
console.log(`build-translations: ${spans.length} spans → ${path.relative(root, out)}`);
