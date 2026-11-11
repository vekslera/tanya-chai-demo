// @vitest-environment node
// The scripts' infrastructure: config, files, the entry-point runner and the logo reader.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { describe, expect, it, vi } from 'vitest';
import { memoryEnv, memoryFiles, repoFiles } from '../test/memoryEnv.ts';
import { heartGeometry } from './brand.ts';
import {
  appConfig,
  config,
  contentRules,
  fill,
  pathOf,
  printConfig,
  root,
  textLanguages,
} from './config.ts';
import { diskFiles, nodeEnv, runMain } from './env.ts';

describe('config', () => {
  it('fills path templates, relative or absolute', () => {
    const ch = { part: 'LA', chapter: 32 };
    expect(fill('a/{part}/{chapter}', ch)).toBe('a/LA/32');
    expect(pathOf('splits.he', ch)).toBe('data/splits/he/LA/32.json');
    expect(pathOf('splits.en', ch)).toBe('data/splits/en/LA/32.json');
    expect(pathOf('text.he', ch, { absolute: true })).toBe(
      path.join(root, 'resources/texts/he/tanya/LA/32'),
    );
    expect(() => pathOf('nope')).toThrow('texts.config.json: no path "nope"');
    expect(() => pathOf('text')).toThrow('no path "text"');
  });

  it('reads both config files', () => {
    expect(config.chapters.length).toBeGreaterThan(0);
    expect(appConfig.storage.key).toBeTruthy();
    expect(contentRules.biurMaxWords.he).toBeGreaterThan(0);
    expect(textLanguages).toEqual(['he', 'en']);
    expect(Object.keys(printConfig.languages)).toEqual(textLanguages);
  });
});

describe('diskFiles', () => {
  it('reads, writes, lists and creates directories', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tanya-'));
    const files = diskFiles(dir);
    files.write('a/b/c.txt', 'x');
    expect(files.exists('a/b/c.txt')).toBe(true);
    expect(files.read('a/b/c.txt')).toBe('x');
    expect(files.list('a').map((f) => f.replaceAll('\\', '/'))).toEqual(['a/b/c.txt']);
    fs.rmSync(dir, { recursive: true });
  });
});

describe('test files', () => {
  it('keep writes in memory', () => {
    const { files, data } = memoryFiles({ 'd/x': '1', 'e/y': '2' });
    expect(files.list('d')).toEqual(['d/x']);
    expect(() => files.read('nope')).toThrow('ENOENT');
    const repo = repoFiles();
    repo.files.write('package.json', '{}');
    expect(repo.files.read('package.json')).toBe('{}');
    expect(repo.files.exists('README.md')).toBe(true);
    expect(data.size).toBe(2);
  });

  it('collect the log and refuse the network', async () => {
    const { env, lines } = memoryEnv(memoryFiles().files);
    env.log.info('i');
    env.log.warn('w');
    env.log.error('e');
    expect(lines).toEqual({ info: ['i'], warn: ['w'], error: ['e'] });
    await expect(env.fetch('x')).rejects.toThrow('no network');
    expect(env.now().getUTCFullYear()).toBe(2026);
  });
});

describe('runMain', () => {
  const url = pathToFileURL(path.join(root, 'scripts/x.ts')).href;

  it('runs the script started from the command line, and exits with its code', async () => {
    const exit = vi.fn();
    const script = vi.fn(() => 3);
    await runMain(url, script, {
      argv1: path.join(root, 'scripts/x.ts'),
      exit: exit as never,
      env: () => ({}) as never,
    });
    expect(exit).toHaveBeenCalledWith(3);
  });

  it('does nothing when the module was imported', async () => {
    const script = vi.fn(() => 0);
    await runMain(url, script, { argv1: path.join(root, 'other.ts') });
    await runMain(url, script, { argv1: '' });
    expect(script).not.toHaveBeenCalled();
  });

  it('builds the real environment', () => {
    const env = nodeEnv();
    expect(env.files.exists('package.json')).toBe(true);
    expect(env.now()).toBeInstanceOf(Date);
    expect(Array.isArray(env.args)).toBe(true);
  });
});

describe('heartGeometry', () => {
  const logo = diskFiles().read(pathOf('logoMark'));

  it('reads the paths, transforms and stroke of the logo', () => {
    const g = heartGeometry(logo);
    expect(g.viewBox).toBe('52 54 156 156');
    expect(g.strokeWidth).toBe(7);
    expect(g.contour).toMatch(/^M130 94/);
    expect(g.chambers).toContain('scale(0.64)');
    expect(g.left).toMatchObject({ transform: 'translate(-5 0)' });
    expect(g.right).toMatchObject({ transform: 'translate(5 0)' });
  });

  it('defaults a left chamber without a transform', () => {
    const svg = logo.replace('class="purify" transform="translate(-5 0)"', 'class="purify"');
    expect(heartGeometry(svg).left.transform).toBe('');
  });

  it('names what is missing', () => {
    expect(() => heartGeometry('<p/>')).toThrow('logo: no <svg> found');
    expect(() => heartGeometry('<svg>')).toThrow('no contour');
    expect(() => heartGeometry(logo.replace('class="purify"', ''))).toThrow('no left chamber');
    expect(() => heartGeometry(logo.replace('viewBox="52 54 156 156"', ''))).toThrow('no viewBox');
    expect(() =>
      heartGeometry(logo.replace(/stroke-width="7" stroke-linecap/, 'stroke-linecap')),
    ).toThrow('no contour stroke-width');
  });
});
