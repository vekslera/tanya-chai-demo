// What a script needs from the outside world. Every script takes a ScriptEnv, so the tests can run
// it over in-memory files, a collecting log and a fake network.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { root } from './config.ts';

/** Files by path relative to the repo root. */
export interface Files {
  read(rel: string): string;
  exists(rel: string): boolean;
  write(rel: string, body: string): void;
  /** Every file under a directory, recursively, as paths relative to the repo root. */
  list(relDir: string): string[];
}

export type Log = {
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
};

export type ScriptEnv = {
  files: Files;
  log: Log;
  /** Environment variables, such as CONTENT_STRICT. */
  vars: Record<string, string | undefined>;
  /** Command-line arguments after the script name. */
  args: string[];
  fetch: typeof fetch;
  now: () => Date;
};

/** A script returns its exit code. */
export type Script = (env: ScriptEnv) => number | Promise<number>;

export function diskFiles(base: string = root): Files {
  const abs = (rel: string) => path.join(base, rel);
  return {
    read: (rel) => fs.readFileSync(abs(rel), 'utf8'),
    exists: (rel) => fs.existsSync(abs(rel)),
    write(rel, body) {
      fs.mkdirSync(path.dirname(abs(rel)), { recursive: true });
      fs.writeFileSync(abs(rel), body);
    },
    list: (relDir) =>
      fs
        .readdirSync(abs(relDir), { recursive: true, withFileTypes: true })
        .filter((d) => d.isFile())
        .map((d) => path.relative(base, path.join(d.parentPath, d.name))),
  };
}

export function nodeEnv(): ScriptEnv {
  return {
    files: diskFiles(),
    log: console,
    vars: process.env,
    args: process.argv.slice(2),
    fetch: globalThis.fetch,
    now: () => new Date(),
  };
}

/** Runs `script` when its module is the one started from the command line, then exits. */
export async function runMain(
  moduleUrl: string,
  script: Script,
  { argv1 = process.argv[1], exit = process.exit, env = nodeEnv } = {},
) {
  if (!argv1 || pathToFileURL(argv1).href !== moduleUrl) return;
  exit(await script(env()));
}
