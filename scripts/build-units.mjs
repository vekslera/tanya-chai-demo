// Raw text + splits → units (SPEC §8.2), for every chapter in texts.config.json.
// The output is generated: never edit it, and it is not committed.
import fs from 'node:fs';
import path from 'node:path';
import { config, pathOf } from './lib/config.ts';
import { buildUnits } from './lib/units.mjs';

let failed = false;

for (const ch of config.chapters) {
  const { part, chapter } = ch;
  const splits = JSON.parse(fs.readFileSync(pathOf('splits', ch, { absolute: true }), 'utf8'));
  const raw = fs.readFileSync(pathOf('text.he', ch, { absolute: true }), 'utf8');
  const { units, errors } = buildUnits({ raw, splits, part, chapter });
  if (errors.length) {
    failed = true;
    for (const e of errors) console.error(`${part} ${chapter}: ${e}`);
    continue;
  }
  const out = pathOf('units', ch, { absolute: true });
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(units, null, 2) + '\n');
  console.log(`build-units: ${part} ${chapter}, ${units.length} units`);
}

if (failed) process.exit(1);
