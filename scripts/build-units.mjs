// Raw text + splits → units (SPEC §8.2). Writes data/units/he/<part>/<chapter>.json.
// The output is generated: never edit it, and it is not committed.
import fs from 'node:fs';
import path from 'node:path';
import { buildUnits } from './lib/units.mjs';

const root = path.resolve(import.meta.dirname, '..');
const splitsDir = path.join(root, 'data/splits');
let failed = false;

for (const part of fs.readdirSync(splitsDir)) {
  for (const file of fs.readdirSync(path.join(splitsDir, part))) {
    const chapter = Number(path.basename(file, '.json'));
    const splits = JSON.parse(fs.readFileSync(path.join(splitsDir, part, file), 'utf8'));
    const raw = fs.readFileSync(
      path.join(root, 'resources/texts/HE/tanya', part, String(chapter)),
      'utf8',
    );
    const { units, errors } = buildUnits({ raw, splits, part, chapter });
    if (errors.length) {
      failed = true;
      for (const e of errors) console.error(`${part} ${chapter}: ${e}`);
      continue;
    }
    const out = path.join(root, 'data/units/he', part, `${chapter}.json`);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, JSON.stringify(units, null, 2) + '\n');
    console.log(`build-units: ${part} ${chapter}, ${units.length} units`);
  }
}

if (failed) process.exit(1);
