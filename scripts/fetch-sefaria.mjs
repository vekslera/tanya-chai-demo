// Downloads the Hebrew and English of each configured chapter from Sefaria (SPEC §8.1), once, on
// Alex's machine. Never runs at build time or in the app.
//
// For each language it saves the full, unmodified API response with the fetch date, prints the
// version and its license, and writes the plain resource file the pipeline reads. It stops without
// writing anything if a version or license is not the expected one.
//
// Usage: npm run fetch-sefaria [-- --lang he|en]
import fs from 'node:fs';
import path from 'node:path';
import { config, fill, pathOf } from './lib/config.ts';
import { englishText, hebrewText, portionMarkers } from './lib/sefaria.mjs';

const only = process.argv.includes('--lang')
  ? process.argv[process.argv.indexOf('--lang') + 1]
  : null;
const langs = ['he', 'en'].filter((l) => !only || l === only);
const { api, refs, versions, allowedLicenses } = config.sefaria;
const languageName = { he: 'hebrew', en: 'english' };

const writes = [];
for (const chapter of config.chapters) {
  const ref = fill(refs[chapter.part], chapter);
  for (const lang of langs) {
    const url = `${api}${encodeURIComponent(ref)}?version=${encodeURIComponent(`${languageName[lang]}|${versions[lang]}`)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
    const response = await res.json();
    const v = response.versions?.[0];
    if (!v) throw new Error(`${ref} (${lang}): no version in the response`);

    console.log(`\n${ref} [${lang}]`);
    console.log(`  versionTitle:  ${v.versionTitle}`);
    console.log(`  license:       ${v.license}`);
    console.log(`  versionSource: ${v.versionSource}`);
    console.log(`  segments:      ${v.text.length}`);
    if (v.versionTitle !== versions[lang]) {
      throw new Error(`Unexpected version "${v.versionTitle}". Stop and report to Alex.`);
    }
    if (!allowedLicenses.includes(v.license)) {
      throw new Error(`License "${v.license}" is not allowed. Stop and report to Alex.`);
    }
    if (lang === 'he') {
      portionMarkers(v.text).forEach(
        (m, i) => m.length && console.log(`  ¶${i + 1} markers: ${m.join(' ')}`),
      );
    }

    writes.push({
      file: pathOf(`sefariaResponse.${lang}`, chapter, { absolute: true }),
      body: JSON.stringify({ fetchedAt: new Date().toISOString(), url, response }, null, 2) + '\n',
    });
    writes.push({
      file: pathOf(`text.${lang}`, chapter, { absolute: true }),
      body: lang === 'he' ? hebrewText(v.text) : englishText(v.text),
    });
  }
}

// Everything was checked; now write.
for (const { file, body } of writes) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const before = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
  fs.writeFileSync(file, body);
  const rel = path.relative(process.cwd(), file);
  console.log(`${before === null ? 'created' : before === body ? 'unchanged' : 'updated'}: ${rel}`);
}
