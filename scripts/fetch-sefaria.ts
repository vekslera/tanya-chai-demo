// Downloads the Hebrew and English of each configured chapter from Sefaria (SPEC §8.1), once, on
// Alex's machine. Never runs at build time or in the app.
//
// For each language it saves the full, unmodified API response with the fetch date, prints the
// version and its license, and writes the plain resource file the pipeline reads. It stops without
// writing anything if a version or license is not the expected one.
//
// Usage: npm run fetch-sefaria [-- --lang he|en]
import { config, fill, pathOf, type ChapterRef } from './lib/config.ts';
import { runMain, type ScriptEnv } from './lib/env.ts';
import { englishText, hebrewText, portionMarkers } from './lib/sefaria.ts';

const LANGUAGES = { he: 'hebrew', en: 'english' } as const;
type Lang = keyof typeof LANGUAGES;
type Write = { file: string; body: string };
type Version = { versionTitle: string; license: string; versionSource: string; text: string[] };
type Response = { versions?: Version[] };

/** The languages to fetch: all, or the one after --lang. */
export function languagesOf(args: string[]): Lang[] {
  const i = args.indexOf('--lang');
  const only = i === -1 ? null : args[i + 1];
  return (Object.keys(LANGUAGES) as Lang[]).filter((l) => !only || l === only);
}

/** Fetches one language of a chapter and checks its version and license; returns its files. */
async function fetchVersion(env: ScriptEnv, ch: ChapterRef, lang: Lang): Promise<Write[]> {
  const { api, refs, versions, allowedLicenses } = config.sefaria;
  const ref = fill(refs[ch.part]!, ch);
  const version = encodeURIComponent(`${LANGUAGES[lang]}|${versions[lang]}`);
  const url = `${api}${encodeURIComponent(ref)}?version=${version}`;
  const res = await env.fetch(url);
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  const response = (await res.json()) as Response;
  const v = response.versions?.[0];
  if (!v) throw new Error(`${ref} (${lang}): no version in the response`);

  env.log.info(`\n${ref} [${lang}]`);
  env.log.info(`  versionTitle:  ${v.versionTitle}`);
  env.log.info(`  license:       ${v.license}`);
  env.log.info(`  versionSource: ${v.versionSource}`);
  env.log.info(`  segments:      ${v.text.length}`);
  if (v.versionTitle !== versions[lang]) {
    throw new Error(`Unexpected version "${v.versionTitle}". Stop and report to Alex.`);
  }
  if (!allowedLicenses.includes(v.license)) {
    throw new Error(`License "${v.license}" is not allowed. Stop and report to Alex.`);
  }
  if (lang === 'he') {
    portionMarkers(v.text).forEach(
      (m, i) => m.length && env.log.info(`  ¶${i + 1} markers: ${m.join(' ')}`),
    );
  }
  const fetchedAt = env.now().toISOString();
  return [
    {
      file: pathOf(`sefariaResponse.${lang}`, ch),
      body: JSON.stringify({ fetchedAt, url, response }, null, 2) + '\n',
    },
    {
      file: pathOf(`text.${lang}`, ch),
      body: lang === 'he' ? hebrewText(v.text) : englishText(v.text),
    },
  ];
}

export async function run(env: ScriptEnv): Promise<number> {
  const writes: Write[] = [];
  try {
    for (const ch of config.chapters) {
      for (const lang of languagesOf(env.args)) writes.push(...(await fetchVersion(env, ch, lang)));
    }
  } catch (e) {
    env.log.error(`fetch-sefaria: ${(e as Error).message}`);
    return 1;
  }
  // Everything was checked; now write.
  for (const { file, body } of writes) {
    const before = env.files.exists(file) ? env.files.read(file) : null;
    env.files.write(file, body);
    env.log.info(
      `${before === null ? 'created' : before === body ? 'unchanged' : 'updated'}: ${file}`,
    );
  }
  return 0;
}

await runMain(import.meta.url, run);
