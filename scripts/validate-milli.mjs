#!/usr/bin/env node
// Registry CI validation for the canonical .milli files. Run from repo root:
//   node scripts/validate-milli.mjs <path-to-milli-package>
// where <path-to-milli-package> contains dist/src/core/format.js
// (a repo checkout or node_modules/@amansingh-afk/milli).
// Checks every .milli decodes, matches its index.json entry, and that
// index.json <-> milli/ match 1:1.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const MAX_BYTES = 1.5 * 1024 * 1024;

const pkgRoot = process.argv[2];
if (!pkgRoot) {
  console.error('usage: validate-milli.mjs <path-to-milli-package>');
  process.exit(1);
}
const { decodeMilli } = await import(
  pathToFileURL(resolve(pkgRoot, 'dist/src/core/format.js')).href
);

const fail = [];
const files = new Map();

for (const f of readdirSync('milli')) {
  const name = f.match(/^(.+)\.milli$/)?.[1];
  if (!name) {
    fail.push(`non-milli file in milli/: ${f}`);
    continue;
  }
  if (!/^[a-z0-9_-]+$/.test(name)) {
    fail.push(`bad splash name (want lowercase [a-z0-9-_]): ${name}`);
    continue;
  }
  const path = `milli/${f}`;
  const size = statSync(path).size;
  if (size > MAX_BYTES) {
    fail.push(`${f} is ${(size / 1024).toFixed(0)}KB (max ${MAX_BYTES / 1024}KB)`);
  }
  try {
    const file = decodeMilli(readFileSync(path));
    if (!file.frames.length) fail.push(`${f} has no frames`);
    files.set(name, file);
  } catch (e) {
    fail.push(`${f} does not decode: ${e.message}`);
  }
}

let index;
try {
  index = JSON.parse(readFileSync('index.json', 'utf8'));
  if (!Array.isArray(index)) throw new Error('not an array');
} catch (e) {
  fail.push(`index.json does not parse as a JSON array: ${e.message}`);
  index = [];
}

const seen = new Set();
for (const e of index) {
  if (seen.has(e.name)) {
    fail.push(`duplicate index entry: ${e.name}`);
    continue;
  }
  seen.add(e.name);
  const file = files.get(e.name);
  if (!file) {
    fail.push(`index lists missing milli file: ${e.name}`);
    continue;
  }
  for (const [field, actual] of [
    ['cols', file.width],
    ['rows', file.height],
    ['frames', file.frames.length],
  ]) {
    if (e[field] !== undefined && e[field] !== actual) {
      fail.push(`${e.name}: index ${field}=${e[field]} but file has ${actual}`);
    }
  }
}
for (const name of files.keys()) {
  if (!seen.has(name)) fail.push(`milli file not in index.json: ${name}`);
}

if (fail.length) {
  for (const m of fail) console.error(`FAIL: ${m}`);
  process.exit(1);
}
console.log(`OK: ${files.size} .milli files valid, index consistent`);
