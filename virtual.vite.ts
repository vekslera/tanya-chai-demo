// Serves the app's data at build time, so the app never names a file itself:
// - `virtual:texts`: the files of every chapter in texts.config.json, at the paths named there;
// - `virtual:app-config`: app.config.json;
// - `virtual:brand`: the heart's geometry, read from the logo.
// Everything is bundled; nothing is fetched at runtime.
import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';
import { heartGeometry } from './scripts/lib/brand.ts';
import {
  CONFIG_FILES,
  appLanguage,
  config,
  pathOf,
  readJson,
  root,
  type ChapterRef,
} from './scripts/lib/config.ts';
import { chapterKey } from './src/domain/units.ts';

const TEXTS = 'virtual:texts';
const APP_CONFIG = 'virtual:app-config';
const BRAND = 'virtual:brand';
/** Each per-chapter export, with the path it reads: the units are those of the app's language. */
const PER_CHAPTER = {
  units: `units.${appLanguage}`,
  translations: 'translations',
  unitContent: 'unitContent',
} as const;
type PerChapter = keyof typeof PER_CHAPTER;
const EXPORTS = Object.keys(PER_CHAPTER) as PerChapter[];
/** Generated before every build; the other per-chapter files may not exist yet for a chapter. */
const REQUIRED: PerChapter = 'units';
const SHARED = ['schedule', 'glossary', 'portion'] as const;

const importPath = (file: string) => JSON.stringify(file.replaceAll(path.sep, '/'));

export function textsModule(chapters: ChapterRef[] = config.chapters): string {
  const imports: string[] = [];
  const maps = Object.fromEntries(EXPORTS.map((k) => [k, [] as string[]]));
  chapters.forEach((ch, i) => {
    for (const key of EXPORTS) {
      const file = pathOf(PER_CHAPTER[key], ch, { absolute: true });
      if (key !== REQUIRED && !fs.existsSync(file)) continue;
      imports.push(`import ${key}${i} from ${importPath(file)};`);
      maps[key]!.push(`${JSON.stringify(chapterKey(ch))}: ${key}${i}`);
    }
  });
  return [
    ...imports,
    ...EXPORTS.map((key) => `export const ${key} = { ${maps[key]!.join(', ')} };`),
    ...SHARED.map(
      (key) =>
        `export { default as ${key} } from ${importPath(pathOf(key, undefined, { absolute: true }))};`,
    ),
  ].join('\n');
}

export function virtualModules(): Plugin {
  const resolved = (id: string) => '\0' + id;
  return {
    name: 'tanya-chai-virtual-modules',
    resolveId: (id) => ([TEXTS, APP_CONFIG, BRAND].includes(id) ? resolved(id) : undefined),
    load(id) {
      if (id === resolved(TEXTS)) return textsModule();
      if (id === resolved(APP_CONFIG)) {
        this.addWatchFile(path.join(root, CONFIG_FILES.app));
        return `export default ${JSON.stringify(readJson(CONFIG_FILES.app))};`;
      }
      if (id === resolved(BRAND)) {
        const logo = pathOf('logoMark', undefined, { absolute: true });
        this.addWatchFile(logo);
        return `export default ${JSON.stringify(heartGeometry(fs.readFileSync(logo, 'utf8')))};`;
      }
    },
  };
}
