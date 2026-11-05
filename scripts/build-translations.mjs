// English resource → translation spans (SPEC §6.4, §8.1), for every chapter in texts.config.json.
// Run when the English file is added or changed; the output is committed.
// One span per Hebrew paragraph: line N of the English file covers paragraph N of the Hebrew.
import fs from 'node:fs';
import path from 'node:path';
import { config, pathOf } from './lib/config.ts';
import { footnoteMarks, parseEnglish } from './lib/english.mjs';
import { loadAll } from './lib/content.mjs';

let failed = false;
const fail = (msg) => {
  console.error(`build-translations: ${msg}`);
  failed = true;
};

for (const ch of config.chapters) {
  const enPath = pathOf('text.en', ch, { absolute: true });
  if (!fs.existsSync(enPath)) {
    fail(`${pathOf('text.en', ch)} not found`);
    continue;
  }
  const { units, lines, errors } = loadAll(ch);
  if (errors.length) {
    errors.forEach(fail);
    continue;
  }
  const parsed = parseEnglish(fs.readFileSync(enPath, 'utf8'));
  if (parsed.errors.length) {
    parsed.errors.forEach(fail);
    continue;
  }
  if (parsed.paragraphs.length !== lines.length) {
    fail(
      `the English has ${parsed.paragraphs.length} paragraphs, the Hebrew ${lines.length}. Ask Alex how to align them.`,
    );
    continue;
  }

  const spans = parsed.paragraphs.map((text, i) => {
    const inParagraph = units.filter((u) => u.paragraph === i + 1);
    const marks = footnoteMarks(text).filter((n) => n in parsed.footnotes);
    return {
      from: inParagraph[0].id,
      to: inParagraph[inParagraph.length - 1].id,
      text,
      sourceId: 'en-resource',
      ...(marks.length
        ? { footnotes: Object.fromEntries(marks.map((n) => [n, parsed.footnotes[n]])) }
        : {}),
    };
  });

  const out = pathOf('translations', ch, { absolute: true });
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(spans, null, 2) + '\n');
  console.log(`build-translations: ${spans.length} spans → ${pathOf('translations', ch)}`);
}

if (failed) process.exit(1);
