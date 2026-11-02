/**
 * Bundle bank-entry.ts with esbuild and import the real ALL_QUESTIONS / coverage helpers.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const cacheDir = join(root, 'scripts/.cache');
const outfile = join(cacheDir, 'bank-bundle.mjs');

export async function loadBank() {
  mkdirSync(cacheDir, { recursive: true });
  const require = createRequire(import.meta.url);
  const esbuild = require('esbuild');

  await esbuild.build({
    entryPoints: [join(root, 'scripts/bank-entry.ts')],
    bundle: true,
    platform: 'node',
    format: 'esm',
    outfile,
    packages: 'bundle',
    // JSON is resolved as data
    loader: { '.json': 'json' },
    logLevel: 'silent',
  });

  return import(pathToFileURL(outfile).href + `?t=${Date.now()}`);
}

export function writeJson(rel, data) {
  const p = join(root, rel);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
}

export function writeText(rel, text) {
  const p = join(root, rel);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, text, 'utf8');
}
