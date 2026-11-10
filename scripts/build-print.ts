// Writes the integrated ביאור (ביאור משולב) of the demo portion as a Word document, to print or
// edit: one document per language in the print section of app.config.json.
import { pathOf, printConfig } from './lib/config.ts';
import { runMain, type ScriptEnv } from './lib/env.ts';
import { loadChapter } from './lib/load.ts';
import { toDocx } from './lib/print/docx.ts';
import { printModel } from './lib/print/model.ts';
import { printStyle } from './lib/print/style.ts';

export async function run({ files, log }: ScriptEnv): Promise<number> {
  const all = loadChapter(files);
  if (!all.portion) {
    log.error(`print: ${pathOf('portion', all)} is missing`);
    return 1;
  }
  const tokens = files.read(pathOf('tokens'));
  let failed = false;
  for (const [language, settings] of Object.entries(printConfig.languages)) {
    if (!all.texts[language]) {
      log.error(`print: no ${language} text or splits`);
      failed = true;
      continue;
    }
    const style = printStyle(tokens, printConfig.biurPt, settings);
    const model = printModel(all, all.portion, language);
    files.write(
      pathOf(`print.${language}`, all),
      await toDocx(model, style, printConfig, settings),
    );
    log.info(`print: wrote ${pathOf(`print.${language}`, all)}`);
  }
  return failed ? 1 : 0;
}

await runMain(import.meta.url, run);
