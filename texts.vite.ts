// Serves `virtual:texts`: the demo chapter's data files, at the paths named in texts.config.json, so
// the app never names a data file itself. Everything is bundled at build time.
import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';
import textsConfig from './texts.config.json' with { type: 'json' };

const ID = 'virtual:texts';
const RESOLVED = '\0' + ID;

function pathOf(template: string, chapter: { part: string; chapter: number }) {
  return path.resolve(
    import.meta.dirname,
    template.replaceAll('{part}', chapter.part).replaceAll('{chapter}', String(chapter.chapter)),
  );
}

export function textsPlugin(): Plugin {
  const chapter = textsConfig.chapters[0]!;
  const p = textsConfig.paths;
  const files = {
    units: pathOf(p.units, chapter),
    schedule: pathOf(p.schedule, chapter),
    unitContent: pathOf(p.unitContent, chapter),
    glossary: pathOf(p.glossary, chapter),
    portion: pathOf(p.portion, chapter),
    translations: pathOf(p.translations, chapter),
  };
  const importPath = (f: string) => JSON.stringify(f.replaceAll('\\', '/'));
  return {
    name: 'tanya-chai-texts',
    resolveId: (id) => (id === ID ? RESOLVED : undefined),
    load(id) {
      if (id !== RESOLVED) return;
      const lines = Object.entries(files)
        .filter(([key]) => key !== 'translations')
        .map(([key, f]) => `export { default as ${key} } from ${importPath(f)};`);
      // The English is optional until it is added.
      lines.push(
        fs.existsSync(files.translations)
          ? `export { default as translations } from ${importPath(files.translations)};`
          : 'export const translations = [];',
      );
      return lines.join('\n');
    },
  };
}
