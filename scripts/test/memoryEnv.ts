// A ScriptEnv for tests: files in memory, a log that collects, and a network that must be faked.
import type { Files, ScriptEnv } from '../lib/env.ts';
import { diskFiles } from '../lib/env.ts';

export function memoryFiles(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  const files: Files = {
    read(rel) {
      const body = data.get(rel);
      if (body === undefined) throw new Error(`ENOENT: ${rel}`);
      return body;
    },
    exists: (rel) => data.has(rel),
    write: (rel, body) => void data.set(rel, body),
    list: (dir) => [...data.keys()].filter((k) => k.startsWith(`${dir}/`)),
  };
  return { files, data };
}

/** The repo's files, readable but never written: writes stay in memory. */
export function repoFiles() {
  const disk = diskFiles();
  const mem = memoryFiles();
  const files: Files = {
    read: (rel) => (mem.files.exists(rel) ? mem.files.read(rel) : disk.read(rel)),
    exists: (rel) => mem.files.exists(rel) || disk.exists(rel),
    write: mem.files.write,
    list: disk.list,
  };
  return { files, written: mem.data };
}

export function memoryEnv(files: Files, over: Partial<ScriptEnv> = {}) {
  const lines = { info: [] as string[], warn: [] as string[], error: [] as string[] };
  const env: ScriptEnv = {
    files,
    log: {
      info: (m) => void lines.info.push(m),
      warn: (m) => void lines.warn.push(m),
      error: (m) => void lines.error.push(m),
    },
    vars: {},
    args: [],
    fetch: () => Promise.reject(new Error('no network in tests')),
    now: () => new Date('2026-11-06T00:00:00Z'),
    ...over,
  };
  return { env, lines };
}
